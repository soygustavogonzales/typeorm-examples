import { Injectable, Logger } from '@nestjs/common';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Sku } from '../../entities/sku.entity';
import { Repository, In } from 'typeorm';
import { SkuColorSize } from '../../entities/skuColorSize.entity';
import { SkuColor } from '../../entities/skuColor.entity';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import * as _ from 'lodash';
import { SkuErrDictionary } from '../../entities/skuErrDictionary.entity';

@Injectable()
export class JdaskusyncService {
    // Create a logger instance
    private logger = new Logger('JdaskusyncService');
    private pool: any;

    constructor(
        @InjectRepository(Sku)
        private readonly skuRepository: Repository<Sku>,
        @InjectRepository(SkuColorSize)
        private readonly skuColorSizeRepository: Repository<SkuColorSize>,
        @InjectRepository(SkuErrDictionary)
        private readonly skuErrDictionary: Repository<SkuErrDictionary>,
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
        const response = {
            mbrStatusError: [],
            skuStatusError: [],
            successSync: [],
            colorError: []
        };

        const pendingSku = await this.skuRepository
            .createQueryBuilder('sku')
            .leftJoinAndSelect('sku.skuJdaMbr', 'skuJdaMbr')
            .leftJoinAndSelect('sku.provider', 'provider')
            .leftJoinAndSelect('sku.skuColor', 'skuColor')
            .leftJoinAndSelect('skuColor.skuColorSize', 'skuColorSize')
            .leftJoinAndSelect('skuColorSize.sizeJda', 'sizeJda')
            .where('skuColorSize.sku IS NULL')
            .getMany();

        if (pendingSku.length === 0) { return response; }

        let mbrsToDelete = []
        let codesToDelete = []
        await Promise.all(pendingSku.map(async sku => {
            const jda = await this.pool.query(`SELECT I.IDEPT,I.ASNUM,I.IVNDPÑ AS IVNDPN,I.INUMBR,I2.IUPC,T.COLSHT,T.COLCOD,T2.SIZSHT,
                                            CASE WHEN TRIM(I3.SVATCD) = 'Y' THEN 'ATC' || TRIM(I.ISTYLÑ) || LPAD(T.COLCOD,4,'0') ELSE NULL END AS ATC,
                                            siz.SSALOC, t2.SIZCOD, I.IMDATE
                                        FROM mmsp4lib.INVMST I
                                        INNER JOIN MMSP4LIB.INSMST i3 ON I3.SSTYLÑ = I.ISTYLÑ
                                        INNER JOIN EXISBUGD.TBLCOL t ON I.ISCOLR = T.COLCOD
                                        INNER JOIN EXISBUGD.TBLSIZ t2 ON I.ISSIZE = T2.SIZCOD
                                        INNER JOIN MMSP4LIB.INVUPC i2 ON I.INUMBR = I2.INUMBR
                                        INNER JOIN MMSP4LIB.INSSIZ siz ON siz.SSTYLN = I.ISTYLÑ AND siz.SSSIZE = T2.SIZCOD
                                        LEFT JOIN MMSP4LIB.INSVEN alt ON alt.SSTYLÑ = i.ISTYLÑ 
                                        WHERE I.IVNDPÑ LIKE ? AND NOT REGEXP_LIKE(I.IVNDPÑ,?,'i')
                                        AND (I.ASNUM = ? OR alt.SVVNUM = ?) AND i.IDSCCD = 'A'`, [`${sku.code}%`, `${sku.code}+?[.a-zA-Z0-9]`, sku.provider.codeJda, sku.provider.codeJda]);
            if (jda.length === 0) {
                const jdamember = await this.pool.query(`SELECT * FROM mmsp4lib.MSTXCM WHERE XCMNAR = ? AND XCMNPP = ?`, [sku.skuJdaMbr.jdaMember, sku.code]);
                if (jdamember.length === 0) {
                    response.mbrStatusError.push(sku.skuJdaMbr.jdaMember);
                    mbrsToDelete.push(sku.skuJdaMbr?.id || 0)
                } else {
                    const stylesErrors = jdamember.filter(skujda => skujda['XCMSTS'] === 'E'); // Errors
                    if (stylesErrors.length > 0) {
                        response.skuStatusError.push(...stylesErrors); 
                        codesToDelete.push(...stylesErrors.map(e => e['XCMNPP'] || ''))
                    }
                }
            } else {
                // Verificamos que se hayan creado todos los colores
                sku.skuColor.forEach(color => {
                    const findColor = jda.find(j => j['COLSHT'] === color.shortName);
                    if (!findColor) {
                        response.colorError.push({ code: sku.code, color: color.shortName });
                    }
                });
                for (const row of jda) {
                    const color: SkuColor[] = sku.skuColor.filter(c => c.shortName === row['COLSHT']);
                    for (const c of color) {
                        const size = c.skuColorSize.filter(s => s.sizeJda.jdaCode === row['SIZCOD']);
                        await Promise.all(size.map(async s => {
                            s.sku = row['INUMBR'];
                            s.ean = row['IUPC'];
                            s.atc = row['ATC'];
                            s.datejda = row['IMDATE'];
                            await this.skuColorSizeRepository.update(s.id, { sku: s.sku, ean: s.ean, atc: s.atc, datejda: s.datejda });
                            response.successSync.push(s);
                        }));
                    }
                }
            }
        }));

        // Get all usersId to notify
        let description = '';
        if (response.mbrStatusError.length > 0) {
            description = `Miembro no encontrado en JDA (MSTXCM): ${response.mbrStatusError.join(', ')};`;
        }
        if (response.colorError.length !== 0) { 
            description = `${description}Los siguientes estilo/color no existen en JDA. Realice workflow para agregar los nuevos colores a los estilos faltantes: `;
            response.colorError.forEach(color => {
                description = `${description}${color.code} - ${color.color},`;
            });
            description = `${description};`;
        }
        if (response.skuStatusError.length !== 0) {
            const errorsDictionary = await this.skuErrDictionary.find();
            description = `${description}Los siguientes estilos están con error de carga en JDA: `;
            response.skuStatusError.forEach(rowerr => {
                for (const [key, value] of Object.entries(rowerr)) {
                    const errorDictionary = errorsDictionary.find(error => error.field === key && value === 'N');
                    if (errorDictionary) {
                        description = `${description} ${rowerr['XCMNPP']} - ${rowerr[errorDictionary.fieldref]} ${errorDictionary.desc},`;
                    }
                }
            });
            description = `${description};`;
        }
        description = (description === '') ? 'Sincronización exitosa' : `Sincronización con errores;${description}`;
        if (response.successSync.length > 0 || 
            response.mbrStatusError.length > 0 || 
            response.skuStatusError.length > 0 || 
            response.colorError.length > 0) {
            const usersId = _.uniq(pendingSku.map(s => s.skuJdaMbr.userId));

            for (const userId of usersId) {
                const notification = {
                    description,
                    notificationType: NotificationTypeEnum.SkuSynchronize,
                    originUserId: userId,
                    creatorPurchaseUserId: -1,
                    merchantUserId: -1,
                    departmentsRelated: [],
                };
                await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
            }
        }

        // Delete SKUs with errors
        mbrsToDelete = _.uniq(mbrsToDelete.filter(m => m > 0));
        codesToDelete = _.uniq(codesToDelete.filter(c => c != ''));

        const skusToDelete = await this.skuRepository.find({ where: { skuJdaMbr:{ id: In(mbrsToDelete) }}, select: ['id']});
        skusToDelete.push(...await this.skuRepository.find({ where: { code: In(codesToDelete) }, select: ['id']}));
        if (skusToDelete.length > 0) {
            await this.skuRepository.remove(skusToDelete);
        }

        return response;
    }
}
