import { Injectable, Logger } from '@nestjs/common';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OcJda } from '../../entities/ocJda.entity';
import { IsNull, Repository } from 'typeorm';
import { Purchase } from '../../entities/purchase.entity';
import * as _ from 'lodash';
import { StoreProxyService } from '../../external-services/store-proxy/store-proxy/store-proxy.service';

@Injectable()
export class JdaOcSyncService {
    // Create a logger instance
    private logger = new Logger('JdaOcSyncService');
    private pool: any;

    constructor(
        @InjectRepository(Purchase)
        private readonly purchaseRepository: Repository<Purchase>,
        @InjectRepository(OcJda)
        private readonly ocJdaRepository: Repository<OcJda>,
        private externalStoreService: StoreProxyService,
        private notificationPublisherService: NotificationPublisherService) { this.connect(); }

    async connect() {
        const dbconfig = {
            host: process.env.AS400HOST,
            user: process.env.AS400USER,
            password: process.env.AS400PASS,
        };

        this.pool = require('node-jt400').pool(dbconfig);
    }

    async jdasync() {
        let createdOc = [];
        let cancelledOc = [];

        const pendingOc = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoin('purchase.stores', 'stores')
            .leftJoin('stores.store', 'store')
            .leftJoin('stores.styles', 'styles')
            .leftJoin('styles.colors', 'colors')
            .leftJoin('styles.details', 'details')
            .leftJoin('details.provider', 'provider')
            .leftJoin('colors.shippings', 'shippings')
            .leftJoin('OcJda', 'oc', 'shippings.piName = oc.piname')
            .leftJoin('Sku', 'sku', 'styles.styleId = sku.styleId AND  details.provider = sku.provider')
            .leftJoin('sku.skuColor', 'skuColor', 'skuColor.styleColorId = colors.styleColorId')
            .leftJoin('skuColor.skuColorSize', 'skuColorSize')
            .select(['shippings.piName AS pi', 'provider.id AS providerid, provider.codeJda AS providerJda'])
            .addSelect('skuColorSize.sku', 'sku')
            .addSelect('store.impnumpfx', 'impnumpfx')
            .where('purchase.status >= 8')
            .andWhere('styles.active=:active', { active: true })
            .andWhere('colors.state = true')
            .andWhere('colors.approved = true')
            .andWhere('oc.piName IS NULL')
            .andWhere(`shippings.piName != ''`)
            .andWhere('shippings.units > 0')
            .andWhere(`details.provider IS NOT NULL`)
            .groupBy('shippings.piName')
            .addGroupBy('provider.id')
            .addGroupBy('provider.codeJda')
            .addGroupBy('store.impnumpfx')
            .addGroupBy('skuColorSize.sku')
            .getRawMany();

        const piInfo = [];
        const pendingOcUniqByPiAndProvider = _.uniqBy(pendingOc, oc => `${oc.pi}-${oc.providerjda}`);
        let queryList = pendingOcUniqByPiAndProvider.map(pi => `(PONOT1 LIKE '%${pi.pi}%' AND POVNUM = ${pi.providerjda} AND POSTAT = '3')`);
        let i = 0;
        let oc = [];
        while (i < queryList.length) {
            const list = queryList.slice(i, i + 1000);
            let sqlQuery = `SELECT PONOT1, PONUMB, POVNUM, PODEST, POSTOR, PODPT, POEDAT
                            FROM mmsp4lib.POMHDR
                            WHERE ${list.join(' OR ')}`;
            const ocList = await this.pool.query(sqlQuery);
            ocList.forEach(o => oc.push(o));
            i += 1000;
        }
        const ocsToCreateForImports = [];

        for await (const o of oc) {
            const findPi = pendingOcUniqByPiAndProvider.find(pi => o.PONOT1.search(pi.pi) >= 0);
            if (findPi) {
                piInfo.push({
                    piname: findPi.pi,
                    provider: findPi.providerid,
                    ponot1: o.PONOT1,
                    ponumb: o.PONUMB,
                    povnum: o.POVNUM,
                    podest: o.PODEST,
                    postor: o.POSTOR,
                    podpt: o.PODPT,
                    poedat: o.POEDAT
                });
                const piSkus = pendingOc.filter(oc => oc.pi == findPi.pi && oc.sku !== null);
                ocsToCreateForImports.push(...piSkus.map(pi => ({ sku: pi.sku, piName: pi.pi, impNumber: `${pi.impnumpfx}${o.POEDAT.substring(0, 4)}${o.PONUMB}` })))
            }
        }
        // this.logger.debug(ocsToCreateForImports);
        try {
            if (ocsToCreateForImports.length > 0) {
                this.externalStoreService.registerOcToImport(ocsToCreateForImports);
            }
        } catch (error) {
            this.logger.error(error);
        }

        createdOc = await Promise.all(piInfo.map(async p => {
            const oc = await this.ocJdaRepository.findOne({
                where: [
                    { piname: p.piname, ponumb: p.ponumb },
                    { piname: IsNull(), ponumb: p.ponumb }
                ]
            });
            if (oc) {
                oc.piname = p.piname;
                oc.providerId = p.provider
                await this.ocJdaRepository.save(oc);
                return { piname: p.ponot1, ponumb: p.ponumb }
            } else {
                await this.ocJdaRepository.save(p);
                return { piname: p.ponot1, ponumb: p.ponumb }
            }
        }));

        return { createdOc: createdOc.filter(p => p), cancelledOc: cancelledOc };
    }

    /**
     * Re-sincroniza una PI limpiando las OC que se pudieron haber eliminado en JDA y sincronizando los nuevos numeros de OC
     * @param piName 
     * @returns ISyncOc[]
     * @example return { 
     * createdOc: [{piname: '607AZPACHSTII21SZXE103SEP', ponumb: '123456'}], 
     * cancelledOc: [{piname: '607AZPACHSTII21SZXE103SEP', ponumb: '456789'}] 
     * }
     */
    async jdaOcResync(piName: string): Promise<ISyncOc> {
        let createdOc: ISyncOcDet[];
        let cancelledOc: ISyncOcDet[];

        const pendingOc = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoin('purchase.stores', 'stores')
            .leftJoin('stores.styles', 'styles')
            .leftJoin('styles.colors', 'colors')
            .leftJoin('styles.details', 'details')
            .leftJoin('details.provider', 'provider')
            .leftJoin('colors.shippings', 'shippings')
            .leftJoinAndMapMany('shippings.oc', OcJda, 'oc', 'shippings.piName = oc.piname')
            .select(['shippings.piName AS pi', 'provider.id AS providerid, provider.codeJda AS providerJda'])
            .where('purchase.status >= 8')
            .andWhere('shippings.piName=:piName', { piName: piName })
            .andWhere('styles.active=:active', { active: true })
            .andWhere('colors.state = true')
            .andWhere('colors.approved = true')
            .andWhere('shippings.units > 0')
            .andWhere(`details.provider IS NOT NULL`)
            .groupBy('shippings.piName')
            .addGroupBy('provider.id')
            .addGroupBy('provider.codeJda')
            .getRawOne();
        if (!pendingOc) {
            return { createdOc, cancelledOc };
        }

        const piInfo = [];
        let sqlQuery = `SELECT PONOT1, PONUMB, POVNUM, PODEST, POSTOR, PODPT, POEDAT
                        FROM mmsp4lib.POMHDR
                        WHERE (PONOT1 LIKE '%${pendingOc.pi}%' AND POVNUM = ${pendingOc.providerjda} AND POSTAT = 3)`;
        const oc = await this.pool.query(sqlQuery);

        for await (const o of oc) {
            const findPi = pendingOc.find(pi => o.PONOT1.search(pi.pi) >= 0);
            if (findPi) {
                piInfo.push({
                    piname: findPi.pi,
                    provider: findPi.providerid,
                    ponot1: o.PONOT1,
                    ponumb: o.PONUMB,
                    povnum: o.POVNUM,
                    podest: o.PODEST,
                    postor: o.POSTOR,
                    podpt: o.PODPT,
                    poedat: o.POEDAT
                });
            }
        }

        const ocCancel = await this.ocJdaRepository.find({ where: { pi_name: pendingOc.pi, povnum: pendingOc.providerjda } });
        for await (const ocCan of ocCancel) {
            const deletedOc = await this.pool.query(`SELECT POCDAT AS "pocdat" FROM mmsp4lib.POMCAN WHERE PONUMB = ? AND POVNUM = ?`, [ocCan.ponumb, ocCan.povnum]);
            if (deletedOc.length > 0) {
                this.ocJdaRepository.delete(ocCan.id);
                cancelledOc.push({ piname: pendingOc.pi, ponumb: oc.ponumb });
            }
        }

        createdOc = await Promise.all(piInfo.map(async p => {
            const oc = await this.ocJdaRepository.findOne({ where: { piname: p.piname, ponumb: p.ponumb } });
            if (!oc) {
                await this.ocJdaRepository.save(p);
                return { piname: p.ponot1, ponumb: p.ponumb }
            }
            return null;
        }));

        return { createdOc: createdOc.filter(p => p), cancelledOc: cancelledOc };
    }
}

interface ISyncOc {
    createdOc: ISyncOcDet[];
    cancelledOc: ISyncOcDet[];
}

interface ISyncOcDet { piname: string; ponumb: string; }