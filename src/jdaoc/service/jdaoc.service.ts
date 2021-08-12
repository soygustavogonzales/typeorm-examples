import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { JdaOcDto } from '../dtos/jdaoc.dto';
import { JdaOcFilterDto } from '../dtos/jdaocFilter.dto';
import moment = require('moment');
import * as XLSX from '@sheet/image';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { AwsS3 } from '../../shared/class/AwsS3';
import { ConfigService } from 'nestjs-config';
import { UserDecode } from '../../shared/dtos/userDecode.entity';
import { OcJdaMbr } from '../../entities/ocJdaMbr.entity';
import { OcJda } from '../../entities/ocJda.entity';


@Injectable()
export class JdaOcService {
    private logger = new Logger('JdaOcService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;
    private pool: any;
    private pgmOcRelease: any;

    constructor(
        @InjectRepository(OcJdaMbr)
        private readonly ocJdaMbrRepository: Repository<OcJdaMbr>,
        @InjectRepository(OcJda)
        private readonly ocJdaRepository: Repository<OcJda>,
        private styleService: StyleProxyService,
        private config: ConfigService,)
        { 
            this.connect(); 
            this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
            AWS.config.update({
                accessKeyId: this.config.get('aws').aws_access_key_id,
                secretAccessKey: this.config.get('aws').aws_secret_access_key,
            });
            this.s3 = new AWS.S3();
        }


    async connect() {
        try {
            const dbconfig = {
                host: process.env.AS400HOST,
                user: process.env.AS400USER,
                password: process.env.AS400PASS,
            };

            this.pool = require('node-jt400').pool(dbconfig);    
            this.pgmOcRelease = this.pool.defineProgram({
                programName: process.env.AS400PGMOC,
                paramsSchema: [
                    { type: 'CHAR', precision: 32, scale: 0, name: 'Member' },
                ],
                libraryName: 'MMSP4PGM',
            });        
        } catch (error) {
            this.logger.error(error);
        }
    }

    async jdaOcRelease(ocNumbers: string[], user: UserDecode): Promise<number> {
        try {
            if (ocNumbers.length <= 0) { return -1 }
            let sqlQuery = `SELECT PONOT1, PONUMB, POVNUM, PODEST, POSTOR, PODPT, POEDAT, POCOST, POTPID
                            FROM mmsp4lib.POMHDR
                            WHERE PONUMB IN (${ocNumbers.join(',')})`;
            const ocs = await this.pool.query(sqlQuery);
            if (ocs.length === 0) { return -1; } 

            const sequence = await this.ocJdaMbrRepository.query(`SELECT * from public."oc_jda_mbr_id_seq"`);
            const ocJdaMbr = await this.ocJdaMbrRepository.save({ jdaMember: `E${((sequence[0].is_called) ? (parseInt(sequence[0].last_value, 10) + 1).toString() : sequence[0].last_value).padStart(9, '0')}`, userId: user.id });

            await Promise.all(ocs.map(async oc => {
                const ocJda = await this.ocJdaRepository.findOne({ where: { ponumb: oc.PONUMB } });
                if (ocJda) {
                    ocJda.pocost = oc.POCOST;
                    ocJda.potpid = oc.POTPID;
                    ocJda.ocJdaMbr = ocJdaMbr;
                    return await this.ocJdaRepository.save(ocJda);
                } else {
                    return await this.ocJdaRepository.save({
                        ponot1: oc.PONOT1,
                        ponumb: oc.PONUMB,
                        povnum: oc.POVNUM,
                        podest: oc.PODEST,
                        postor: oc.POSTOR,
                        podpt: oc.PODPT,
                        poedat: oc.POEDAT,
                        pocost: oc.POCOST,
                        potpid: oc.POTPID,
                        ocJdaMbrId: ocJdaMbr.id
                    });
                }
            }));
            
            await this.pool.update(`CALL QSYS.QCMDEXC('ADDPFM FILE(MMSP4LIB/WORKFILE1) MBR(${ocJdaMbr.jdaMember})', 0000000047.00000)`);
            await this.pool.update(`CALL QSYS.QCMDEXC('OVRDBF FILE(WORKFILE1) TOFILE(MMSP4LIB/WORKFILE1) MBR(${ocJdaMbr.jdaMember}) OVRSCOPE(*JOB)', 0000000080.00000)`);
            const response = await this.pool.update(`INSERT INTO MMSP4LIB.WORKFILE1 VALUES('${ocNumbers.join('\'),(\'')}')`);
            await this.pgmOcRelease({ Member: ocJdaMbr.jdaMember }, 20);

            return response;
        } catch (error) {
            this.logger.error(error.message);
            throw new BadRequestException(error.message);
        }
    }
    
    async jdaOcNumbers(): Promise<string[]> {
        try {
            const sqlQuery = `SELECT p.PONUMB FROM mmsp4lib.POMHDR p
                              WHERE p.POSTAT = '2' AND p.POMUS1 <> ''`;
            const ocs = await this.pool.query(sqlQuery);
            return ocs.map(o => o.PONUMB);
        } catch (error) {
            this.logger.error(error);
        }
        return [];
    }
    
    async releasedJdaOcNumbers(): Promise<number[]> {
        try {
            let ocNumbers = await this.ocJdaRepository.createQueryBuilder('oc')
                .where('oc.ocJdaMbr IS NOT NULL')
                .select(['ponumb'])
                .getRawMany();

            return ocNumbers.map(o => o.ponumb);
        } catch (error) {
            this.logger.error(error);
        }
        return [];
    }

    async jdaOcByFilter(filter: JdaOcFilterDto): Promise<JdaOcDto[]> { 
        try {
            let sqlQuery = `SELECT p.PONUMB, p.POVNUM, a.AANAME, p.POSTOR, p.PODPT, p.POEDAT, p.POMTYP
                            FROM mmsp4lib.POMHDR p
                            LEFT JOIN exisbugd.APADDR a ON a.AANUM = p.POVNUM
                            WHERE p.POSTAT = '2' AND p.POMUS1 <> ''`;

            if (filter.ocs && filter.ocs.length > 0) {
                sqlQuery += ` AND p.PONUMB IN (${filter.ocs.join(',')})`;
            }
            if (filter.providers && filter.providers.length > 0) {
                const providersCodes = filter.providers.map(p => `'${p}'`);
                if (providersCodes.length > 0) {
                    sqlQuery += ` AND p.POVNUM IN (${providersCodes.join(',')})`;
                }
            }
            if (filter.departments && filter.departments.length > 0) {
                const departments = await this.styleService.getDepartmentDataByIds(filter.departments);
                const departmentNumbers = departments.map(d => d.codeChile);
                if (departmentNumbers.length > 0) {
                    sqlQuery += ` AND p.PODPT IN (${departmentNumbers.join(',')})`;
                }
            }
            if (filter.range && filter.range.start && filter.range.end && filter.range.start < filter.range.end) {
                sqlQuery += ` AND p.POEDAT BETWEEN ${moment(filter.range.start).format("YYMMDD")} AND ${moment(filter.range.end).format("YYMMDD")}`;
            }

            const ocs = await this.pool.query(sqlQuery);
            if (ocs.length === 0) { return []; } 

            const ocNumbers = _.uniq(ocs.map(o => o.PONUMB));
            sqlQuery = `SELECT PONUMB, IFNULL(ROUND(((RETAIL_I-(COSTO_I * 1.19))/RETAIL_I) * 100), ROUND(((RETAIL_II-(COSTO_II * 1.19))/RETAIL_II) * 100))
                        AS MARGEN,IFNULL(RETAIL_I, retail_II) AS VTA_RTL, IFNULL (COSTO_I, COSTO_II) AS COSTO, IFNULL(uni1, uni2) AS UNIDADES_OC
                        FROM
                        (SELECT PONUMB,
                            (SELECT SUM ((CASE WHEN ZEVRTO = 0 THEN ZEVRTR ELSE ZEVRTO END) * D.POMQTY) AS PRECIO
                            FROM MMSP4LIB.POMZEV Z 
                            INNER JOIN MMSP4LIB.POMDTL D ON Z.ZEVNPO = D.PONUMB AND Z.ZEVSKU = D.INUMBR
                            WHERE Z.ZEVNPO = H.PONUMB) AS RETAIL_I,
                            (SELECT SUM ((D.POBCST - D.POBALW) * D.POMQTY) AS COSTO FROM MMSP4LIB.POMDTL D WHERE D.PONUMB = H.PONUMB ) AS COSTO_I, 
                            (SELECT SUM ((CASE WHEN ZEVRTO = 0 THEN ZEVRTR ELSE ZEVRTO END) * C.PCSQTY) AS PRECIO
                            FROM MMSP4LIB.POMZEV Z 
                            INNER JOIN  MMSP4LIB.POMCSD C ON Z.ZEVNPO = C.PONUMB AND Z.ZEVSTY = C.PCSSTY  AND C.PCSTYP = 2
                            WHERE Z.ZEVNPO = H.PONUMB) AS RETAIL_II,
                            (SELECT SUM ((C.PCSBCS - C.PCSBAW) * C.PCSQTY) AS COSTO FROM MMSP4LIB.POMCSD C WHERE C.PONUMB = H.PONUMB AND C.PCSTYP = 2) AS COSTO_II, h.POUNTS AS cant,
                            (SELECT SUM (D.POMQTY) AS cant1 FROM  MMSP4LIB.POMDTL D WHERE D.PONUMB = H.PONUMB) AS uni1,
                            (SELECT SUM (C.PCSQTY) AS cant1 FROM  MMSP4LIB.POMCSD C WHERE c.PONUMB = H.PONUMB AND C.PCSTYP = 2) AS uni2       
                        FROM MMSP4LIB.POMHDR H
                        WHERE H.POSTAT = '2' AND H.POMUS1 <> '' AND H.PONUMB IN (${ocNumbers.join(',')}))`;

            const details = {};
            const ocRates = await this.pool.query(sqlQuery);
            ocRates.forEach(item => { details[item.PONUMB] = item; });

            const departments = {};
            const departmentJdaCodes = _.uniq(ocs.map(o => o.PODPT));
            const responseDepartments = await this.styleService.getDepartmentsByCodeDepartmentCountry(departmentJdaCodes);
            responseDepartments.forEach(item => { departments[item.codeChile] = {name: item.name, limit: item.costCap}; });

            return ocs.map(oc => {
                let distributionType = '';
                const limit = departments[oc.PODPT]?.limit || 0;
                const totalCost = details[oc.PONUMB]?.COSTO || 0;

                if (oc.POMTYP && oc.POMTYP === 'S') {
                    distributionType = 'STOCK';
                } else if (oc.POMTYP && oc.POMTYP === 'P') {
                    distributionType = 'PREDISTRIBUIDA';
                }

                return {
                    ocNumber: oc.PONUMB,
                    provider: oc.AANAME,
                    destinationWinery: oc.POSTOR,
                    department: departments[oc.PODPT]?.name || '',
                    creationDate: moment(oc.POEDAT, 'YYMMDD').toDate(),
                    totalCost,
                    totalRetail: details[oc.PONUMB]?.VTA_RTL || 0,
                    totalUnits: details[oc.PONUMB]?.UNIDADES_OC || 0,
                    conversionRate: details[oc.PONUMB]?.MARGEN || 0,
                    distributionType,
                    status: limit === 0 ? 'PL' : totalCost > limit ? 'HP' : 'PL'
                }
            });
        } catch (error) {
            this.logger.error(error);
        }
        return [];
    }

    async jdaOcDetails(ocNumbers: string[]): Promise<string> {
        try {
            let sqlQuery = `SELECT H.PONUMB, H.POMTYP, H.POTPID, H.POSTOR, 
                            CASE
                            WHEN D.INUMBR IS NULL AND C.PCQSKU IS NULL AND T.INUMBR IS NULL THEN X.PCSSKU 
                            WHEN D.INUMBR IS NULL AND C.PCQSKU IS NULL AND X.PCSSKU IS NULL THEN T.INUMBR
                            WHEN D.INUMBR IS NULL AND T.INUMBR IS NULL AND X.PCSSKU IS NULL THEN C.PCQSKU
                            WHEN C.PCQSKU IS NULL AND T.INUMBR IS NULL AND X.PCSSKU IS NULL THEN D.INUMBR
                            END AS ITEMS,
                            CASE 
                            WHEN D.POLOC IS NULL AND C.PCQLOC IS NULL AND T.POLOC IS NULL THEN X.PCSLOC
                            WHEN D.POLOC IS NULL AND C.PCQLOC IS NULL AND  X.PCSLOC IS NULL THEN T.POLOC
                            WHEN D.POLOC IS NULL AND T.POLOC IS NULL AND  X.PCSLOC IS NULL THEN C.PCQLOC
                            WHEN C.PCQLOC IS NULL AND T.POLOC IS NULL AND  X.PCSLOC IS NULL THEN D.POLOC
                            END AS LOCAL,
                            CASE
                            WHEN D.PODQTY IS NULL AND C.PCQDQT IS NULL AND T.POMQTY IS NULL THEN  X.PCSQTY
                            WHEN D.PODQTY IS NULL AND C.PCQDQT IS NULL AND X.PCSQTY IS NULL THEN  T.POMQTY
                            WHEN D.PODQTY IS NULL AND T.POMQTY IS NULL AND X.PCSQTY IS NULL THEN  C.PCQDQT
                            WHEN C.PCQDQT IS NULL AND T.POMQTY IS NULL AND X.PCSQTY IS NULL THEN  D.PODQTY
                            END AS CANTIDAD 
                            FROM mmsp4lib.POMHDR H
                            LEFT JOIN mmsp4lib.POMDSQ D ON H.PONUMB = D.PONUMB  
                            LEFT JOIN mmsp4lib.POMCSQ C ON  C.PONUMB = H.PONUMB AND PCQTYP = 1
                            LEFT JOIN MMSP4LIB.POMDTL T ON H.PONUMB = T.PONUMB AND H.POMTYP = 'S'
                            LEFT JOIN MMSP4LIB.POMCSD X ON H.PONUMB = X.PONUMB  AND x.PCSTYP = 1 AND H.POMTYP = 'S'
                            WHERE H.POSTAT = '2' AND H.POMUS1 <> ''`;

            if (ocNumbers.length > 0) {
                sqlQuery += ` AND H.PONUMB IN (${ocNumbers.join(',')})`;
            }
            
            const ocs = await this.pool.query(sqlQuery);
            if (ocs.length === 0) { return null; } 

            const data = ocs.map(oc => {
                let distributionType = '';
                if (oc.POMTYP && oc.POMTYP === 'S') {
                    distributionType = 'STOCK';
                } else if (oc.POMTYP && oc.POMTYP === 'P') {
                    distributionType = 'PREDISTRIBUIDA';
                }

                let origin = '';
                if (oc.POTPID && oc.POTPID === 'I') {
                    origin = 'IMPORT';
                } else if (oc.POTPID && oc.POTPID === 'D') {
                    origin = 'DOMESTIC';
                }

                return {
                    PONUMB: oc.PONUMB,
                    POMTYP: distributionType,
                    POTPID: origin,
                    POSTOR: oc.POSTOR,
                    ITEMS: oc.ITEMS,
                    LOCAL: oc.LOCAL,
                    CANTIDAD: oc.CANTIDAD,
                }
            });

            const headers = {
                PONUMB: 'OC NUMBER',
                POMTYP: 'DISTRIBUTION TYPE',
                POTPID: 'ORIGIN',
                POSTOR: 'WHS',
                ITEMS: 'SKU',
                LOCAL: 'LOCAL',
                CANTIDAD: 'QUANTITY',
            };
            const ws = XLSX.utils.json_to_sheet([headers, ...data], { skipHeader: true });
            const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\r\n' });
            const bufferFile = Buffer.from(csv, 'utf8');
            const name = `JdaOcDetails_${uuidv4()}.csv`;
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            const url = await S3.uploadFile(bufferFile, name, 'text/csv', 10800, this.logger);
            return url;
        } catch (error) {
            this.logger.error(error);
        }
        return null;
    }

    async jdaOcDetailsB200(ocNumbers: string[]): Promise<string> {
        try {
            let sqlQuery = `SELECT POFPCD,POSTOR,POVNUM,INUMBR,POMQTY,POMYZD,VOLU,UNID,TICO1,TICT1,
                                    POMYZF,SWTQA,FCHNOE,FCHNEC,INSTPA,ICOTER,PUEORI,FEEM,GESE,NMBGS,CONT,EMAI,
                                    TICO2,TICT2,TICO3,TICT3,CACO1,CACO2,CACO3,OCMAST,PROFOR,VIATRA,TIPMO,TEMPO
                            FROM MMSP4LIB.POMHDR a
                            INNER JOIN MMSP4LIB.POMDTL B ON a.PONUMB = b.PONUMB
                            INNER JOIN MMSP4LIB.POMYYD C ON a.PONUMB = c.NUMORD
                            INNER JOIN MMSP4LIB.POMYZC D ON a.PONUMB = D.POMYZO
                            WHERE a.POSTAT = '3' AND a.POTPID = 'I'
                            AND a.POSTOR IN (200)`;

            if (ocNumbers.length > 0) {
                sqlQuery += ` AND a.PONUMB IN (${ocNumbers.join(',')})`;
            }

            const ocs = await this.pool.query(sqlQuery);
            if (ocs.length === 0) { return null; } 

            sqlQuery = `SELECT * FROM MMSP4LIB.POMYYE WHERE TIPCDG IN (1,2,3,5,6) ORDER BY TIPCDG`
            const dataCodes = {};
            const codes = await this.pool.query(sqlQuery);
            codes.forEach(item => { dataCodes[item.DESC] = item.CDG; });

            const data = ocs.map(oc => {
                return {
                    POFPCD: oc.POFPCD,
                    POSTOR: oc.POSTOR,
                    POVNUM: oc.POVNUM,
                    INUMBR: oc.INUMBR,
                    EAN: '',
                    POMQTY: oc.POMQTY,
                    POMYZD: oc.POMYZD.replace('.', ','),
                    POMYZF: oc.POMYZF.replace('.', ','),
                    SWTQA: oc.SWTQA,
                    FCHNOE: moment(oc.FCHNOE.length < 8 ? `0${oc.FCHNOE}` : oc.FCHNOE, 'DDMMYYYY').format('YYYYMMDD'),
                    FCHNEC: moment(oc.FCHNEC.length < 8 ? `0${oc.FCHNEC}` : oc.FCHNEC, 'DDMMYYYY').format('YYYYMMDD'),
                    INSTPA: oc.INSTPA,
                    ICOTER: dataCodes[oc.ICOTER] || oc.ICOTER,
                    PUEORI: oc.PUEORI,
                    FEEM: moment(oc.FEEM.length < 8 ? `0${oc.FEEM}` : oc.FEEM, 'DDMMYYYY').format('YYYYMMDD'),
                    GESE: oc.GESE,
                    NMBGS: oc.NMBGS,
                    CONT: oc.CONT,
                    EMAI: oc.EMAI,                                    
                    VOLU: oc.VOLU.replace('.', ','),                                    
                    UNID: oc.UNID,                                    
                    TICO1: oc.TICO1,                                    
                    TICT1: oc.TICT1,                                    
                    TICO2: oc.TICO2,                                    
                    TICT2: oc.TICT2,                                    
                    TICO3: oc.TICO3,                                    
                    TICT3: oc.TICT3,                                    
                    CACO1: oc.CACO1,                                    
                    CACO2: oc.CACO2,                                    
                    CACO3: oc.CACO3,                                    
                    OCMAST: oc.OCMAST,                                    
                    PROFOR: oc.PROFOR,                                    
                    VIATRA: dataCodes[oc.VIATRA] || oc.VIATRA,                                    
                    TIPMO: dataCodes[oc.TIPMO] || oc.TIPMO,                                    
                    TEMPO: oc.TEMPO,                                    
                    Separator: '',                                    
                }
            });

            const ws = XLSX.utils.json_to_sheet([...data], { skipHeader: true });
            const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\r\n' });
            const bufferFile = Buffer.from(csv, 'utf8');
            const name = `JdaOcDetailsB200_${uuidv4()}.csv`;
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            const url = await S3.uploadFile(bufferFile, name, 'text/csv', 10800, this.logger);
            return url;
        } catch (error) {
            this.logger.error(error);
        }
        return null;
    }
}