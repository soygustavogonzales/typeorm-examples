import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { Provider } from '../../entities/provider.entity';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { JdaOcDto } from '../dtos/jdaoc.dto';
import { JdaOcFilterDto } from '../dtos/jdaocFilter.dto';
import moment = require('moment');


@Injectable()
export class JdaOcService {
    private logger = new Logger('JdaOcService');
    private pool: any;

    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
        private styleService: StyleProxyService)
        { this.connect(); }

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
}