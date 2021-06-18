import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { Provider } from '../../entities/provider.entity';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { JdaOcDto } from '../dtos/jdaoc.dto';
import { JdaOcFilterDto } from '../dtos/jdaocFilter.dto';
import moment = require('moment');
import * as XLSX from '@sheet/image';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { AwsS3 } from '../../shared/class/AwsS3';
import { ConfigService } from 'nestjs-config';


@Injectable()
export class JdaOcService {
    private logger = new Logger('JdaOcService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;
    private pool: any;

    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
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
        } catch (error) {
            this.logger.error(error);
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

    async jdaOcByFilter(filter: JdaOcFilterDto): Promise<JdaOcDto[]> {
        try {
            let sqlQuery = `SELECT p.PONUMB, p.POVNUM, a.AANAME, p.POSTOR, p.PODPT, p.POEDAT, p.POCOST, p.PORETL, p.POUNTS, p.POMTYP
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
            sqlQuery = `SELECT PONUMB, IFNULL(ROUND(((RETAIL_I-(COSTO_I * 1.19))/RETAIL_I) * 100),ROUND(((RETAIL_II-(COSTO_II * 1.19))/RETAIL_II) * 100))
                        AS MARGEN, IFNULL (RETAIL_I,retail_II) AS VTA_RTL, IFNULL (COSTO_I ,COSTO_II) AS COSTO
                        FROM (SELECT PONUMB,
                            (SELECT SUM ((CASE 
                                WHEN ZEVRTO = 0 THEN ZEVRTR 
                                ELSE ZEVRTO END ) * D.POMQTY) AS PRECIO   FROM MMSP4LIB.POMZEV Z 
                                INNER JOIN  MMSP4LIB.POMDTL D ON  Z.ZEVNPO = D.PONUMB AND Z.ZEVSKU = D.INUMBR WHERE Z.ZEVNPO = H.PONUMB ) AS RETAIL_I,
                            (SELECT SUM ((D.POBCST - D.POBALW) * D.POMQTY) AS COSTO   FROM  MMSP4LIB.POMDTL D  WHERE D.PONUMB = H.PONUMB ) AS COSTO_I, 
                            (SELECT SUM ((CASE 
                            WHEN ZEVRTO = 0 THEN ZEVRTR 
                            ELSE ZEVRTO END ) * C.PCSQTY) AS PRECIO   FROM MMSP4LIB.POMZEV Z 
                            INNER JOIN  MMSP4LIB.POMCSD C ON  Z.ZEVNPO = C.PONUMB AND Z.ZEVSTY = C.PCSSTY  AND C.PCSTYP = 2 WHERE Z.ZEVNPO = H.PONUMB ) AS RETAIL_II,
                            (SELECT SUM ((C.PCSBCS - C.PCSBAW) * C.PCSQTY) AS COSTO   FROM  MMSP4LIB.POMCSD C  WHERE C.PONUMB = H.PONUMB AND C.PCSTYP = 2) AS COSTO_II
                        FROM MMSP4LIB.POMHDR H
                        WHERE H.POSTAT = '2' AND H.POMUS1 <> '' AND H.PONUMB IN (${ocNumbers.join(',')}))`;

            const rates = {};
            const ocRates = await this.pool.query(sqlQuery);
            ocRates.forEach(item => { rates[item.PONUMB] = item.MARGEN; });

            const departments = {};
            const departmentJdaCodes = _.uniq(ocs.map(o => o.PODPT));
            const responseDepartments = await this.styleService.getDepartmentsByCodeDepartmentCountry(departmentJdaCodes);
            responseDepartments.forEach(item => { departments[item.codeChile] = item.name; });

            return ocs.map(oc => {
                let distributionType = '';
                if (oc.POMTYP && oc.POMTYP === 'S') {
                    distributionType = 'STOCK';
                } else if (oc.POMTYP && oc.POMTYP === 'P') {
                    distributionType = 'PREDISTRIBUIDA';
                }

                return {
                    ocNumber: oc.PONUMB,
                    provider: oc.AANAME,
                    destinationWinery: oc.POSTOR,
                    department: departments[oc.PODPT] || '',
                    creationDate: moment(oc.POEDAT, 'YYMMDD').toDate(),
                    totalCost: oc.POCOST,
                    totalRetail: oc.PORETL,
                    totalUnits: oc.POUNTS,
                    conversionRate: rates[oc.PONUMB] || 0,
                    distributionType
                }
            });
        } catch (error) {
            this.logger.error(error);
        }
        return [];
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
                    FCHNOE: moment(oc.FCHNOE, 'DDMMYYYY').format('YYYYMMDD'),
                    FCHNEC: moment(oc.FCHNEC, 'DDMMYYYY').format('YYYYMMDD'),
                    INSTPA: oc.INSTPA,
                    ICOTER: dataCodes[oc.ICOTER] || oc.ICOTER,
                    PUEORI: oc.PUEORI,
                    FEEM: moment(oc.FEEM, 'DDMMYYYY').format('YYYYMMDD'),
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