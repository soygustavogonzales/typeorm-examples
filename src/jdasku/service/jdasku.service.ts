import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Equal, MoreThanOrEqual, Repository, In, Any, FindOperator, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from '../../entities/purchase.entity';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { StyleDto } from '../dtos/style.dto';
import { SkuColor } from '../../entities/skuColor.entity';
import { Sku } from '../../entities/sku.entity';
import { SizeJda } from '../../entities/sizeJda.entity';
import { JdaSkuInterface } from '../dtos/jdaSkuInterface.dto';
import { SkuJdaMbr } from '../../entities/skuJdaMbr.entity';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { FilterApprovalDto } from '../dtos/filterApproval.dto';
import { PurchaseSkuSummary } from '../dtos/purchaseSkuSummary.dto';
import { SkuColorSize } from '../../entities/skuColorSize.entity';
import { UserDecode } from '../../shared/dtos/userDecode.entity';
import * as _ from 'lodash';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import { CleanSkuRuleCause } from '../../shared/enums/cleanSkuRuleCause.enum';
import { StoreProxyService } from '../../external-services/store-proxy/store-proxy/store-proxy.service';
import { SkuSummaryGroup } from '../dtos/skuSummaryGroup.dto';
@Injectable()
export class JdaskuService {

    // Create a logger instance
    private logger = new Logger('JdaskuService');
    private pool: any;
    private pgmCreateSku: any;

    constructor(
        @InjectRepository(Purchase)
        private readonly purchaseRepository: Repository<Purchase>,
        @InjectRepository(PurchaseStyle)
        private readonly purchaseStyleRepository: Repository<PurchaseStyle>,
        @InjectRepository(Sku)
        private readonly skuRepository: Repository<Sku>,
        @InjectRepository(SkuJdaMbr)
        private readonly skuJdaMbrRepository: Repository<SkuJdaMbr>,
        @InjectRepository(SizeJda)
        private readonly sizeJda: Repository<SizeJda>,
        @InjectRepository(SkuColorSize)
        private readonly skuColorSizeRepository: Repository<SkuColorSize>,
        private notificationPublisherService: NotificationPublisherService,
        private externalStyleService: StyleProxyService,
        private externalStoreService: StoreProxyService) { this.connect(); }

    async connect() {
        const dbconfig = {
            host: process.env.AS400HOST,
            user: process.env.AS400USER,
            password: process.env.AS400PASS,
        };

        this.pool = require('node-jt400').pool(dbconfig);
        this.pgmCreateSku = this.pool.defineProgram({
            programName: process.env.AS400PGMSKU,
            paramsSchema: [
                { type: 'CHAR', precision: 32, scale: 0, name: 'Member' },
            ],
            libraryName: 'MMSP4PGM', // Optional. Defaults to *LIBL
        });
    }

    async getFilteredPurchase(filter: FilterApprovalDto) {
        const mainWhere: { status: { id: FindOperator<number> }, active: boolean, seasonCommercial?: FindOperator<number> } = {
            status: { id: MoreThanOrEqual(8) },
            active: true,
        };
        if (filter.seasons?.length > 0) { mainWhere.seasonCommercial = In(filter.seasons); }

        let query = this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('stores.store', 'store')
            .leftJoinAndSelect('stores.styles', 'styles')
            .leftJoin('styles.details', 'details')
            .leftJoin('styles.colors', 'colors')
            .where(mainWhere)
            .andWhere('styles.active=:active', { active: true })
            .andWhere('colors.state = true')
            .andWhere('colors.approved = true');
        if (filter.brands?.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    filter.brands.forEach((brandId) => {
                        qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                    });
                }));
        }
        if (filter.departments?.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    filter.departments.forEach((departmentId) => {
                        qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                    });
                }));
        }
        if (filter.tripDates?.length > 0) {
            query = query.andWhere('purchase."tripDate"::date IN (:...tripdates)', { tripdates: filter.tripDates });
        }
        if (filter.categories?.length > 0) {
            query = query.andWhere('details.category IN (:...categories)', { categories: filter.categories });
        }
        if (filter.providers?.length > 0) {
            query = query.andWhere('details.provider IN (:...providers)', { providers: filter.providers });
        }
        const purchases: PurchaseSkuSummary[] = await query.getMany(); // .; getMany() getQueryAndParameters()

        const dataIds: number[] = _.flattenDepth(purchases.map(s => s.stores.map(st => st.styles.map(sty => sty.styleId))), 3);
        const ids = Array.from(new Set(dataIds));
        const stylesData: StyleDto[] = await this.externalStyleService.getStylesDataByIds(ids);
        
        let groupedStyles = [];
        purchases.forEach(purchase => {
            groupedStyles.push(stylesData.map(style => {
                return {
                    seasonId: purchase.seasonCommercial.id,
                    seasonName: purchase.seasonCommercial.name,
                    department: style.departmentId,
                    brand: style.brandId,
                    styles: [],
                    stylesWSku: []
                }
            }));
        });
        groupedStyles = _.uniqBy(_.flattenDepth(groupedStyles, 1), x => `${x.seasonId}-${x.department}-${x.brand}`);

        await Promise.all(purchases.map(async purchase => {
            const styleProvider: 
            Array<{ style: number, provider: number }> 
            = await this.purchaseRepository
                .createQueryBuilder('purchase')
                .select(['styles.styleId AS style', 'details.provider AS provider'])
                .leftJoin('purchase.stores', 'stores')
                .leftJoin('stores.store', 'store')
                .leftJoin('stores.styles', 'styles')
                .leftJoin('styles.details', 'details')
                .where({ id: purchase.id })
                .groupBy('styles.styleId')
                .addGroupBy('details.provider')
                .getRawMany();
            purchase.totalStyles = styleProvider.length;

            for await (const style of styleProvider) {
                const styleData = stylesData.find(sty => sty.id === style.style);
                if (styleData) {
                    const groupData = groupedStyles.findIndex(group => group.brand === styleData.brandId && 
                                                              group.department === styleData.departmentId && 
                                                              group.seasonId === purchase.seasonCommercial.id);
                    groupedStyles[groupData].styles.push(styleData.id);

                    const sku = await this.skuRepository
                    .createQueryBuilder('sku')
                    .leftJoinAndSelect('sku.skuColor', 'skuColor')
                    .leftJoinAndSelect('skuColor.skuColorSize', 'skuColorSize')
                    .where({ styleId: style.style, provider: style.provider })
                    .getOne();
                    if (sku) {
                        const colors = sku.skuColor.length; // Total de colores
                        const colorsOk: number[] = sku.skuColor.map(color => {
                            const sizes = color.skuColorSize.length;
                            const sizesOk = color.skuColorSize.filter(size => size.sku).length;
                            return (sizes === sizesOk) ? 1 : 0;
                        });
                        if (colors === colorsOk.reduce((prev, curr) => prev + curr, 0)) {
                            groupedStyles[groupData].stylesWSku.push(styleData.id);
                        }
                    }
                }
            }
        }));

        groupedStyles.forEach(element => {
            element.styles = _.uniq(element.styles);
            element.stylesWSku = _.uniq(element.stylesWSku);
        });
        groupedStyles = groupedStyles.filter(group => group.styles.length > 0);

        return groupedStyles;
    }

    // async jdasync() {
    //     const response = {
    //         mbrStatusError: [],
    //         skuStatusError: [],
    //         successSync: [],
    //     };

    //     const pendingSku = await this.skuRepository
    //         .createQueryBuilder('sku')
    //         .leftJoinAndSelect('sku.skuJdaMbr', 'skuJdaMbr')
    //         .leftJoinAndSelect('sku.provider', 'provider')
    //         .leftJoinAndSelect('sku.skuColor', 'skuColor')
    //         .leftJoinAndSelect('skuColor.skuColorSize', 'skuColorSize')
    //         .leftJoinAndSelect('skuColorSize.sizeJda', 'sizeJda')
    //         .where('skuColorSize.sku IS NULL')
    //         .getMany();

    //     await Promise.all(pendingSku.map(async sku => {
    //         const jda = await this.pool.query(`SELECT I.IDEPT,I.ASNUM,I.IVNDPÑ AS IVNDPN,I.INUMBR,I2.IUPC,T.COLSHT,T.COLCOD,T2.SIZSHT,
    //                                         CASE WHEN TRIM(I3.SVATCD) = 'Y' THEN 'ATC' || TRIM(I.ISTYLÑ) || LPAD(T.COLCOD,4,'0') ELSE NULL END AS ATC,
    //                                         siz.SSALOC, t2.SIZCOD, I.IMDATE
    //                                     FROM mmsp4lib.INVMST I
    //                                     INNER JOIN MMSP4LIB.INSMST i3 ON I3.SSTYLÑ = I.ISTYLÑ
    //                                     INNER JOIN EXISBUGD.TBLCOL t ON I.ISCOLR = T.COLCOD
    //                                     INNER JOIN EXISBUGD.TBLSIZ t2 ON I.ISSIZE = T2.SIZCOD
    //                                     INNER JOIN MMSP4LIB.INVUPC i2 ON I.INUMBR = I2.INUMBR
    //                                     INNER JOIN MMSP4LIB.INSSIZ siz ON siz.SSTYLN = I.ISTYLÑ AND siz.SSSIZE = T2.SIZCOD
    //                                     WHERE I.IVNDPÑ LIKE ? AND NOT REGEXP_LIKE(I.IVNDPÑ,?,'i')
    //                                     AND I.ASNUM = ? AND i.IDSCCD = 'A'`, [`${sku.code}%`, `${sku.code}+?[[a-zA-Z0-9]]`, sku.provider.codeJda]);
    //         if (jda.length === 0) {
    //             const jdamember = await this.pool.query(`SELECT * FROM mmsp4lib.MSTXCM WHERE XCMNAR = ? AND XCMNPP = ?`, [sku.skuJdaMbr.jdaMember, sku.code]);
    //             if (jdamember.length === 0) {
    //                 response.mbrStatusError.push(sku.skuJdaMbr.jdaMember);
    //             } else {
    //                 response.skuStatusError.push(jdamember.filter(skujda => skujda['XCMSTS'] === 'E')); // Errors
    //             }
    //         } else {
    //             for (const row of jda) {
    //                 const color: SkuColor[] = sku.skuColor.filter(c => c.shortName === row['COLSHT']);
    //                 for (const c of color) {
    //                     const size = c.skuColorSize.filter(s => s.sizeJda.jdaCode === row['SIZCOD']);
    //                     await Promise.all(size.map(async s => {
    //                         s.sku = row['INUMBR'];
    //                         s.ean = row['IUPC'];
    //                         s.atc = row['ATC'];
    //                         s.datejda = row['IMDATE'];
    //                         await this.skuColorSizeRepository.update(s.id, { sku: s.sku, ean: s.ean, atc: s.atc, datejda: s.datejda });
    //                         response.successSync.push(s);
    //                     }));
    //                 }
    //             }

    //         }
    //     }));
    //     response.skuStatusError = response.skuStatusError.filter(x => x.length > 0);

    //     // Get all usersId to notify
    //     let description = 'Sincronización exitosa';
    //     if (response.mbrStatusError.length !== 0 && response.skuStatusError.length !== 0) {
    //         description = 'Sincronización Fallida: No se pudo sincronizar los skus';
    //         if (response.successSync.length !== 0) {
    //             description = 'Sincronización Parcial: No todos los estilos fuero sincronizados exitosamente';
    //         }
    //     }
    //     const usersId = _.uniq(pendingSku.map(s => s.skuJdaMbr.userId));

    //     for (const userId of usersId) {
    //         const notification = {
    //             description,
    //             notificationType: NotificationTypeEnum.SkuSynchronize,
    //             originUserId: userId,
    //             creatorPurchaseUserId: -1,
    //             merchantUserId: -1,
    //             departmentsRelated: [],
    //         };
    //         await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
    //     }
    //     return response;
    // }

    async createsku(dto: SkuSummaryGroup, user: UserDecode): Promise<any> {
        let createdSku: number = 0;
        const skuData: JdaSkuInterface[] = [];
        try {
            const mainWhere: { status: { id: FindOperator<number> }, active: boolean, seasonCommercial?: FindOperator<number> } = {
                status: { id: MoreThanOrEqual(8) },
                active: true,
                seasonCommercial: Equal(dto.seasonId)
            };
            const purchaseEntity = await this.purchaseRepository
                    .createQueryBuilder('purchase')
                    .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                    .leftJoinAndSelect('purchase.stores', 'stores', 'stores.deleteDate is null')
                    .leftJoinAndSelect('stores.store', 'store')
                    .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
                    .leftJoinAndSelect('stores.styles', 'style', 'style.deleteDate is null')
                    .leftJoinAndSelect('style.colors', 'colors', 'colors.deleteDate is null')
                    .leftJoinAndSelect('style.details', 'detail', 'detail.deleteDate is null')
                    .leftJoinAndSelect('detail.provider', 'provider')
                    .leftJoinAndSelect('provider.originCountry', 'originCountry')
                    .leftJoinAndSelect('detail.size', 'size')
                    .leftJoinAndSelect('detail.ratio', 'ratio')
                    .leftJoinAndSelect('detail.packingMethod', 'packingMethod')
                    .leftJoinAndSelect('purchase.status', 'status')
                    .where(mainWhere)
                    .andWhere('style.active=:active', { active: true })
                    .andWhere('colors.state = true')
                    .andWhere('colors.approved = true')
                    .andWhere(dto.brand + '=ANY(purchase.brands)')
                    .andWhere(dto.department + '=ANY(purchase.departments)')
                    .andWhere('style.styleId IN (:...styleIds)', { styleIds: dto.styles })
                    .getMany();
            if (purchaseEntity.length === 0) { return createdSku; }

            const stylesData: StyleDto[] = await this.externalStyleService.getStylesDataByIds(dto.styles);
            stylesData.map((styleInfo: StyleDto) => {
                let atcValue = false;
                purchaseEntity.forEach(purchase => {
                    purchase.stores.forEach(store => {
                        store.styles.forEach(style => {
                            if (styleInfo.id === style.styleId) {
                                styleInfo.colors.forEach(color => {
                                    color.approved = style.colors.findIndex(col => col.styleColorId === color.id) >= 0 ? true : false;
                                });
                                style.details.forEach(detail => {
                                    if (detail.atc === true) { atcValue = true; }
                                    styleInfo.details = (!styleInfo.details) ? detail : (detail.size.code.split('-').length > styleInfo.details.size.code.split('-').length) ? detail : styleInfo.details;
                                });
                            }
                        });
                    });
                });
                styleInfo.details.atc = atcValue;
            });

            const saveData = stylesData.map(async style => {
                const sku: Sku = {
                    styleId: style.id,
                    code: style.code,
                    provider: style.details.provider,
                };

                const skuColors = style.colors.map(async colors => {
                    const skuColor: SkuColor = {
                        sku,
                        styleColorId: colors.id,
                        shortName: colors.colorShortName,
                        colorCode: colors.colorCode,
                    };

                    const curva = style.details.ratio.ratio.split('-');
                    const skuColorSize = style.details.size.code.split('-').map(async (code, idx) => {
                        const savedStyle = await this.skuRepository.createQueryBuilder('sku')
                            .leftJoinAndSelect('sku.skuColor', 'skuColor')
                            .leftJoinAndSelect('skuColor.skuColorSize', 'skuColorSize')
                            .leftJoinAndSelect('skuColorSize.sizeJda', 'sizeJda')
                            .where({ styleId: style.id, provider: style.details.provider })
                            .andWhere('skuColor.styleColorId=:styleColorId', { styleColorId: colors.id })
                            .andWhere('sizeJda.jdaCode=:jdaCode', { jdaCode: code })
                            .getCount();
                        if (savedStyle > 0) { return null; }

                        const sizeJda = await this.sizeJda.findOne({ where: { jdaCode: code } });
                        return {
                            skuColor,
                            sizeJda,
                            size: style.details.size,
                            ratio: parseInt(curva[idx], 10),
                        };
                    });
                    skuColor.skuColorSize = (await Promise.all(skuColorSize)).filter(size => size);
                    return skuColor;
                });
                sku.skuColor = (await Promise.all(skuColors)).filter(color => color.skuColorSize.length > 0);
                if (sku.skuColor.length === 0) { return null; }

                skuData.push(this.pushJdaSkuInterface(style, sku));
                return sku;
            });

            await Promise.all(saveData).then(async data => {
                data = data.filter(dat => dat);
                if (data.length === 0) { return; }
                const dataJda = skuData.map(sku => Object.values(sku).join(';'));
                const sequence = await this.skuJdaMbrRepository.query(`SELECT * from public."sku_jda_mbr_id_seq"`);
                const skuJdaMbr = await this.skuJdaMbrRepository.save({ jdaMember: `E${((sequence[0].is_called) ? (parseInt(sequence[0].last_value, 10) + 1).toString() : sequence[0].last_value).padStart(9, '0')}`, userId: user.id });

                for await (const style of data) {
                    style.skuJdaMbr = skuJdaMbr;
                    const skuDB = await this.skuRepository.findOne({ where: { provider: style.provider, styleId: style.styleId } });
                    if (!skuDB) {
                        await this.skuRepository.save(style);
                    }
                }
                
                await this.pool.update(`CALL QSYS.QCMDEXC('ADDPFM FILE(MMSP4LIB/WORKFILE) MBR(${skuJdaMbr.jdaMember})', 0000000046.00000)`);
                await this.pool.update(`CALL QSYS.QCMDEXC('OVRDBF FILE(ECOCOMPR) TOFILE(MMSP4LIB/WORKFILE) MBR(${skuJdaMbr.jdaMember}) OVRSCOPE(*JOB)', 0000000078.00000)`);
                const insert = await this.pool.update(`INSERT INTO MMSP4LIB.ECOCOMPR VALUES('${dataJda.join('\'),(\'')}')`);
                await this.pgmCreateSku({ Member: skuJdaMbr.jdaMember }, 10);
                createdSku = insert;
            });

            return createdSku;
        } catch (error) {
            console.log(error);
            this.logger.error(error);
            throw new BadRequestException('Error en request');
        }
    }

    pushJdaSkuInterface(style: StyleDto, sku: Sku): JdaSkuInterface {
        let codigoManejoJda: string = '0';
        if (style.details?.packingMethod.name.includes('|')) {
            [, codigoManejoJda] = style.details.packingMethod.name.split('|');
        }

        return {
            indicadorSkuEstilo: 1,
            proveedor: parseInt(sku.provider?.codeJda, 10),
            departamento: parseInt(style.classTypeCode.slice(0, 3), 10),
            subDepartamento: parseInt(style.classTypeCode.slice(3, 6), 10),
            clase: parseInt(style.classTypeCode.slice(6, 9), 10),
            partProveedor: style.code,
            costo: Math.round(style.details.cost),
            precio: Math.round(style.details.price),
            unidadEmpaque: 1,
            unidadMedida: 1,
            metodoDistribucion: 2,
            comprador: 100,
            linea: '',
            ean13: '',
            codigoManejo: codigoManejoJda,
            marca: style.brandJdaCode,
            temporada: style.seasonProductJda,
            perfil: style.profileJdaCode,
            pais: style.details.provider.originCountry.shortName,
            coleccion: '',
            tamano: style.dimension,
            descripcion: `${style.code} ${style.articleType}`,
            descripcionBoleta: `${style.code} ${style.articleType}`,
            descripcionEtiqueta: `${style.code} ${style.articleType}`,
            descripcionCorta: `${style.code} ${style.articleType}`,
            colores: sku.skuColor.map(color => color.colorCode).join('-'),
            tallas: style.details.size.code,
            dimension: '',
            atc: (style.details.atc) ? 'Y' : 'N',
            ratio: (style.details.atc) ? style.details.ratio.ratio : '',
        };
    }

    async cleanSkus(stylesId: number[], ruleCause: CleanSkuRuleCause, user: any) {
        const skusStyles = await this.skuRepository.find({ where: { styleId: In(stylesId) }, relations: ['skuColor', 'skuColor.skuColorSize'] });
        
        let querySku = this.skuColorSizeRepository.createQueryBuilder('skuColorSize')
        .innerJoinAndSelect('skuColorSize.skuColor', 'skuColor')
        .innerJoinAndSelect('skuColor.sku', 'sku')
        .innerJoinAndSelect('skuColorSize.sizeJda', 'sizeJda')
        .where('sku.styleId IN (:...styleIds)', { styleIds: stylesId });
        const skuColorSizes = await querySku.getMany();
        const skus = skuColorSizes.map(s => s.sku);
        
        if (ruleCause === CleanSkuRuleCause.SizeDetailChange ||
            ruleCause === CleanSkuRuleCause.StyleCodeChange ||
            ruleCause === CleanSkuRuleCause.ProviderDetailChange ||
            ruleCause === CleanSkuRuleCause.PurchaseColorChange) {
            if (skusStyles.length > 0) {
                this.skuRepository.remove(skusStyles);
                await this.externalStoreService.setZeroQuantityStoreStuffingBySku(skus);
                const purchaseStyles = await this.purchaseStyleRepository.find({ where: { styleId: In(stylesId) }, relations: ['purchaseStore', 'purchaseStore.purchase'] });
                const stylesData = await this.externalStyleService.getStylesDataByIds(stylesId);
                const departments = _.uniq(stylesData.map(s => s.departmentId));
                const purchases = _.uniqBy(purchaseStyles.map(p => p.purchaseStore.purchase), 'id') as Purchase[];
                for (const purchase of purchases) {
                    const notification = {
                        description: `Skus eliminados de la compra ${purchase.name} por ajuste a la compra por el usuario ${user.firstName} ${user.lastName}`,
                        notificationType: NotificationTypeEnum.CleanSkus,
                        originUserId: user.id,
                        creatorPurchaseUserId: purchase.userId,
                        merchantUserId: -1,
                        departmentsRelated: departments?.join(','),
                    };
                    await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
                }
            }
        }

    }

    async getSkuByStyle(styleIds: number[]){
        return await this.skuRepository.createQueryBuilder('sku')
            .leftJoinAndSelect('sku.skuColor', 'skuColor')
            .leftJoinAndSelect('skuColor.skuColorSize', 'skuColorSize')
            .leftJoinAndSelect('skuColorSize.sizeJda', 'sizeJda')
            .leftJoinAndSelect('sku.provider', 'provider')
            .where('sku.styleId IN (:...styleIds)', { styleIds })
            .getMany();
    }
}
