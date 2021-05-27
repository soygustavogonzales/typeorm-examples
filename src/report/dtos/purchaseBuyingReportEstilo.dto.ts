import { PurchaseBuyingReport } from './purchaseBuyingReport.dto';
import * as _ from 'lodash';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { Repository } from 'typeorm';
import { FilterApprovalDto } from '../../purchase/dtos/filterApproval.dto';
import { StatusPurchaseColorEnum } from '../../shared/enums/statusPurchaseColor.enum';
import moment = require('moment');

export class PurchaseBuyingReportEstilo extends PurchaseBuyingReport {

    constructor(private purchaseStyleRepository: Repository<PurchaseStyle>, 
                private purchaseStyles, private stylesData, private styleSkus, private users, private userId: number) {
        super();
        this.headers = {
            status: 'STATUS',
            season: 'SEASON',
            productSeason: 'PRODUCT SEASON',
            tripDate: 'TRIP DATE',
            unit: 'UNIT',
            division: 'DIVISION',
            departmentCode: 'ID DEPT',
            department: 'DEPT',
            classTypeCode: 'CLASS',
            classType: 'CLASS DESC',
            providerCode: 'VENDOR',
            provider: 'VENDOR DESC',
            cso: 'CSO',
            brand: 'BRAND',
            styleCode: 'STYLE',
            sku: 'SKU', // TODO: Pending
            atcId: 'ATC ID', // TODO: Pending
            color: 'COLOR',
            colorCode: 'ID COLOR',
            colorShortName: 'SHORT COLOR',
            collection: 'COLLECTION',
            profile: 'PROFILE',
            origin: 'ORIGIN',
            shippingMethod: 'SHIPPING METHOD',
            price: 'NORMAL PRICE',
            sato: 'SATO PRICE',
            ratio: 'RATIO', // add to join,
            size: 'SIZE', // add to join
            packingMethod: 'PACKING METHOD',
            hanger: 'HANGER',
            vstTag: 'VST TAG',
            atc: 'ATC',
            unitsPerInner: 'UNITS PER INNER', // calculate by ratio,
            innerPerMaster: 'INNER PER MASTER', // calculate by ratio,
            cbm: 'CBM',
            totalCbm: 'TOTAL CBM',
            dimension: 'DIMENSION',
            rse: 'RSE',
            sustainableFeature: 'SUSTAINABLE FEATURE',
            composition: 'COMPOSITION',
            weaving: 'WEAVING',
            construction: 'CONSTRUCTION',
            weight: 'WEIGHT',
            gauge: 'GAUGE',
            referencialProvider: 'LY VENDOR',
            // totalQty: 'TOTAL QTY',
            firstDelivery: 'FIRST DELIVERY', // check
            fob: 'FOB',
            totalFob: 'TOTAL FOB', // TODO: pending
            dollarBought: 'DOLLAR BOUGHT', // TODO: Pending,
            importFactor: 'IMPORT FACTOR', // TODO: Pending,
            cost: 'COST', // TODO: Pending
            totalCost: 'TOTAL COST', // TODO: Pending
            totalRetail: 'TOTAL RETAIL', // TODO: Pending
            brandManager: 'BRAND MANAGER', // TODO: Pending
            productManager: 'PRODUCT MANAGER', // TODO: Pending
            designer: 'DESIGNER',
            piNumber: 'PI NUMBER',
            country: 'COUNTRY',
            sticker: 'STICKER',
            internetDescription: 'INTERNET DESCRIPTION',
            segment: 'SEGMENTATION',
            delivery: 'DELIVERY',
            units: 'UNITS',
            date: 'DATE',
            category: 'CATEGORY',
            exitPort: 'EXIT PORT NAME',
            exitPortCode: 'EXIT PORT CODE',
            approvalDate: 'APPROVAL',
            ocJda: 'OC',
            impNum: 'IMP NUM'
        };
        this.processData(this.purchaseStyles, this.stylesData, this.styleSkus, this.users);
    }

    protected processData(purchaseStyles, stylesData, styleSkus, users): void {
        _.flatten(purchaseStyles.map(purchaseStyle => {
            return purchaseStyle.colors.map(color => {
                const styleData = stylesData.find(s => s.id === purchaseStyle.styleId);
                const styleDetails = purchaseStyle.details[0];                
                if (styleData && styleDetails) {
                    const colorData = styleData.colors.find(c => c.id === color.styleColorId);                    
                    if (colorData) {
                        const sku = styleSkus.find(sku => sku.styleId === styleData.id);
                        const skuColor = sku?.skuColor.find(skuColor => skuColor.styleColorId === colorData.id);
                        const referentialSku = skuColor?.skuColorSize.find(skuColorSize => skuColorSize.sku);
                        
                        let brandManager = 'NO APLICA';
                        if (styleDetails.brandManager && styleDetails.brandManager !== '-1') {
                            const brandManagerUser = users?.find(u => u.id === parseInt(styleDetails.brandManager, null) ?? -1);
                            brandManager = brandManagerUser ? `${brandManagerUser.firstName} ${brandManagerUser.lastName}` : styleDetails.brandManager;
                        }
                        let productManager = 'NO APLICA';
                        if (styleDetails.productManager && styleDetails.productManager !== '-1') {
                            const productManagerUser = users?.find(u => u.id === parseInt(styleDetails.productManager, null) ?? -1);
                            productManager = productManagerUser ? `${productManagerUser.firstName} ${productManagerUser.lastName}` : styleDetails.productManager;
                        }
                        let designer = 'NO APLICA';
                        if (styleDetails.designer && styleDetails.designer !== '-1') {
                            const designerUser = users?.find(u => u.id === parseInt(styleDetails.designer, null) ?? -1);
                            designer = designerUser ? `${designerUser.firstName} ${designerUser.lastName}` : styleDetails.designer;
                        }
                        const firsDeliveryDate = color.shippings.map(s => s.date).sort((a, b) => a.getTime() - b.getTime())[0];
                        for (const shipping of color.shippings) {
                            const cbm = parseFloat(styleData.cbm).toFixed(4);
                            this.dataToExport.push({
                                status: color.status.name,
                                season: purchaseStyle.purchaseStore.purchase.seasonCommercial.name,
                                productSeason: styleData.seasonProduct,
                                tripDate: moment(purchaseStyle.purchaseStore.purchase.tripDate).format('MMM-yyyy'),
                                unit: purchaseStyle.purchaseStore.store.name,
                                division: styleData.division,
                                departmentCode: styleData.departmentCode,
                                department: styleData.department,
                                classTypeCode: styleData.classTypeCode,
                                classType: styleData.classType,
                                providerCode: styleDetails.provider.codeJda,
                                provider: styleDetails.provider.name,
                                cso: styleDetails.cso.name,
                                brand: styleData.brand,
                                styleCode: styleData.code,
                                sku: referentialSku?.sku || '',
                                atcId: (purchaseStyle.purchaseStore.store.shortName !== 'PW' &&
                                        purchaseStyle.purchaseStore.store.shortName !== 'TP') ? referentialSku?.atc || '' : '',
                                color: colorData.colorName,
                                colorCode: colorData.colorCode,
                                colorShortName: colorData.colorShortName,
                                collection: styleDetails.collection,
                                profile: styleData.profileJdaCode,
                                origin: styleDetails.origin.name,
                                shippingMethod: styleDetails.shippingMethod.name,
                                price: styleDetails.price,
                                sato: styleDetails.sato,
                                ratio: styleDetails.ratio.ratio,
                                size: styleDetails.size.size,
                                packingMethod: styleDetails.packingMethod.name,
                                hanger: styleDetails.hanger ? 'YES' : 'NO',
                                vstTag: styleDetails.vstTag ? 'YES' : 'NO',
                                atc: styleDetails.atc ? 'YES' : 'NO',
                                unitsPerInner: styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b), // calculate by ratio,
                                innerPerMaster: styleData.divisionMaster, // calculate by ratio,
                                cbm: Number(cbm),
                                totalCbm: styleData.cbm * shipping.units,
                                dimension: styleData.dimension,
                                rse: styleDetails.rse?.name || '',
                                sustainableFeature: styleDetails.sustainableFeature?.name || '',
                                composition: styleDetails.composition || '',
                                weaving: styleDetails.fabricWeaving || '',
                                construction: styleDetails.fabricConstruction || '',
                                weight: styleDetails.fabricWight || '',
                                gauge: styleDetails.gauge || '',
                                referencialProvider: styleDetails.referencialProvider || '',
                                // totalQty: color.getTotalUnits(),
                                firstDelivery: firsDeliveryDate ? moment(firsDeliveryDate).format('DD-MMM-yyyy') : '', // check
                                fob: styleDetails.fob *(1/1),
                                totalFob: shipping.units * styleDetails.fob,
                                dollarBought: styleDetails.dollarChange*(1/1) || 0,
                                importFactor: styleDetails.importFactor * 1 || 0,
                                cost: (styleDetails.fob * styleDetails.dollarChange * styleDetails.importFactor) || 0,
                                totalCost: ((styleDetails.fob * styleDetails.dollarChange * styleDetails.importFactor) * shipping.units * 1.0) || 0, // TODO: Pending
                                totalRetail: (styleDetails.price * shipping.units) * 1.0, // TODO: Pending
                                brandManager,
                                productManager,
                                designer,
                                piNumber: shipping.piName,
                                country: purchaseStyle.purchaseStore.store.destinyCountry.name,
                                sticker: styleDetails.seasonSticker.name,
                                internetDescription: styleDetails.internetDescription,
                                segment: styleDetails.segment?.name || '',
                                delivery: shipping.shipping,
                                units: shipping.units,
                                date: moment(shipping.date).format('DD-MMM-yyyy'),
                                category: styleDetails.category.name,
                                exitPort: styleDetails.exitPort.name,
                                exitPortCode: styleDetails.exitPort.jdaCode,
                                approvalDate: purchaseStyle?.purchaseStore?.purchase?.approvalDate ? moment(purchaseStyle.purchaseStore.purchase.approvalDate).format('DD-MMM-yyyy') : '',
                                ocJda: shipping['oc'].map(oc => oc.ponumb).join('/'),
                                impNum: shipping['oc'][0] ? `${purchaseStyle.purchaseStore.store.impnumpfx}${shipping['oc'][0].poedat.toString().substring(0, 4)}${shipping['oc'][0].ponumb}` : null,
                            });
                        }
                    }
                }
            });
        }));
    }

    /*async getPurchaseStylesByFilter(filter: FilterApprovalDto, statusColor: StatusPurchaseColorEnum, approved?, includeUnits0 = false) {
        try {
            let query = this.purchaseStyleRepository
                .createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
                .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                .leftJoinAndSelect('purchase.status', 'status')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchaseStyle.details', 'details')
                .leftJoinAndSelect('details.category', 'category')
                .leftJoinAndSelect('details.seasonSticker', 'seasonSticker')
                .leftJoinAndSelect('details.shippingMethod', 'shippingMethod')
                .leftJoinAndSelect('details.segment', 'segment')
                .leftJoinAndSelect('details.provider', 'provider')
                .leftJoinAndSelect('details.origin', 'origin')
                .leftJoinAndSelect('details.packingMethod', 'packingMethod')
                .leftJoinAndSelect('details.exitPort', 'exitPort')
                .leftJoinAndSelect('details.size', 'size')
                .leftJoinAndSelect('details.ratio', 'ratio')
                .leftJoinAndSelect('details.rse', 'rse')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.status', 'colorStatus')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndMapMany('shippings.oc', OcJda, 'oc', 'shippings.piName = oc.piname')
                .leftJoinAndMapMany('purchaseStyle.sku', Sku, 'sku', 'purchaseStyle.styleId = sku.styleId AND details.provider = sku.provider')
                .where({ active: true })
                .andWhere('colors.state = true');

            if (!includeUnits0) {
                query = query.andWhere('shippings.units<>0');
            }
            if (approved) {
                query = query.andWhere('colors.approved = true')
                    .andWhere('status.id=:id', { id: Status.Approvement });
            } else {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('status.id=' + Status.Approvement);
                    qb = qb.orWhere('status.id=' + Status.CompletePurchase);
                }));
            }
            if (statusColor === StatusPurchaseColorEnum.ConfirmedOrCanceled) {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Confirmed);
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Canceled);
                }));
            } else if (statusColor) {
                query = query.andWhere('colorStatus.id=' + statusColor);
            }

            if (filter.seasons && filter.seasons.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.seasons.forEach((seasonId) => {
                            qb = qb.orWhere('purchase.seasonCommercial.id=' + seasonId);
                        });
                    }));
            }
            if (filter.tripDates && filter.tripDates.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.tripDates.forEach((tripDate) => {
                            qb = qb.orWhere(`purchase."tripDate"::date='${tripDate}'`);
                        });
                    }));
            }
            if (filter.stores && filter.stores.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.stores.forEach((storeId) => {
                            qb = qb.orWhere('store.id=' + storeId);
                        });
                    }));
            }
            if (filter.origins && filter.origins.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.origins.forEach((originId) => {
                            qb = qb.orWhere('origin.id=' + originId);
                        });
                    }));
            }
            if (filter.providers && filter.providers.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.providers.forEach((providerId) => {
                            qb = qb.orWhere('provider.id=' + providerId);
                        });
                    }));
            }
            if (filter.categories && filter.categories.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.categories.forEach((categoryId) => {
                            qb = qb.orWhere('category.id=' + categoryId);
                        });
                    }));
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.users && filter.users.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.users.forEach((userId) => {
                            qb = qb.orWhere('purchase.userId=' + userId);
                        });
                    }));
            }
            if (filter.piName) {
                query = query.andWhere(`shippings.piName=:piName`, { piName: filter.piName });
            }
            const purchaseStylesDb = await query.getMany();
            const usersId = purchaseStylesDb.map(p => p.details[0].brandManager).concat(purchaseStylesDb.map(p => p.details[0].productManager)).concat(purchaseStylesDb.map(p => p.details[0].designer));
            const uniqUsersId = _.uniq(usersId.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const users = uniqUsersId && uniqUsersId.length > 0 ? await this.securityProxyService.getUsers({ ids: uniqUsersId, departments: [], roles: [] }) : null;

            const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));
            if (stylesIds.length > 0 && (((filter.departments && filter.departments.length > 0) || (filter.brands && filter.brands.length > 0)) || approved)) {
                let stylesData = await this.externalStyleService.getStylesDataByIds(stylesIds);
                if (stylesIds.length > 0 && stylesData.length === 0) {
                    this.logger.error('Datos de estilos no encontrados');
                    return null;
                }
                if (filter.brands && filter.brands.length > 0) {
                    stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
                }
                if (filter.departments && filter.departments.length > 0) {
                    stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
                }

                return { purchaseStyles: purchaseStylesDb.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1), stylesData, users };
            }

            return { purchaseStyles: purchaseStylesDb, stylesData: null, users };
        } catch (error) {
            this.logger.error(error);
            return { purchaseStyles: [], stylesData: null, users: null };
        }
    }*/
}