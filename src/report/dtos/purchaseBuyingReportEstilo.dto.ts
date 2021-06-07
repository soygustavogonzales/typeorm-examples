import { PurchaseBuyingReport } from './purchaseBuyingReport.dto';
import * as _ from 'lodash';
import moment = require('moment');

export class PurchaseBuyingReportEstilo extends PurchaseBuyingReport {

    constructor(private purchaseStyles, private stylesData, private styleSkus, private users, private ocs, private detailsData,public  iva:number) {
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
            imu: 'IMU',
            imuSato: 'IMU SATO',
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
        this.processData(this.purchaseStyles, this.stylesData, this.styleSkus, this.users, this.ocs, this.detailsData);
    }

    protected processData(purchaseStyles, stylesData, styleSkus, users, ocs, detailsData): void {
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
                        for (const shipping of color.shippings.filter(s => s.units > 0)) {
                            const shippingOcs = ocs.filter(o => o.piname === shipping.piName);
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
                                providerCode: detailsData.providers[styleDetails.providerId]?.codeJda || '',
                                provider: detailsData.providers[styleDetails.providerId]?.name || '',
                                cso: detailsData.csos[styleDetails.csoId]?.name || '',
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
                                origin: detailsData.origins[styleDetails.originId]?.name || '',
                                shippingMethod: detailsData.shippingMethods[styleDetails.shippingMethodId]?.name || '',
                                price: styleDetails.price,
                                sato: styleDetails.sato,
                                ratio: detailsData.ratios[styleDetails.ratioId]?.ratio || '',
                                size: detailsData.sizes[styleDetails.sizeId]?.size || '',
                                packingMethod: detailsData.packingMethods[styleDetails.packingMethodId]?.name || '',
                                hanger: styleDetails.hanger ? 'YES' : 'NO',
                                vstTag: styleDetails.vstTag ? 'YES' : 'NO',
                                atc: styleDetails.atc ? 'YES' : 'NO',
                                unitsPerInner: detailsData.ratios[styleDetails.ratioId]?.ratio ? detailsData.ratios[styleDetails.ratioId]?.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b) : 0,
                                innerPerMaster: styleData.divisionMaster,
                                cbm: Number(cbm),
                                totalCbm: styleData.cbm * shipping.units,
                                dimension: styleData.dimension,
                                rse: detailsData.rses[styleDetails.rseId]?.name || '',
                                sustainableFeature: detailsData.sustainableFeatures[styleDetails.sustainableFeatureId]?.name || '',
                                composition: styleDetails.composition || '',
                                weaving: styleDetails.fabricWeaving || '',
                                construction: styleDetails.fabricConstruction || '',
                                weight: styleDetails.fabricWight || '',
                                gauge: styleDetails.gauge || '',
                                referencialProvider: styleDetails.referencialProvider || '',
                                // totalQty: color.getTotalUnits(),
                                firstDelivery: firsDeliveryDate ? moment(firsDeliveryDate).format('DD-MMM-yyyy') : '',
                                fob: styleDetails.fob *(1/1),
                                totalFob: shipping.units * styleDetails.fob,
                                dollarBought: styleDetails.dollarChange*(1/1) || 0,
                                importFactor: styleDetails.importFactor * 1 || 0,
                                imu:(this.getImu(styleDetails.price,styleDetails.fob,styleDetails.importFactor,styleDetails.dollarChange,this.iva)*100).toFixed(2).toString().concat('%'),
                                imuSato:(this.getImuSato(styleDetails.sato,styleDetails.fob,styleDetails.importFactor,styleDetails.dollarChange,this.iva)*100).toFixed(2).toString().concat('%'),
                                cost: (styleDetails.fob * styleDetails.dollarChange * styleDetails.importFactor) || 0,
                                totalCost: ((styleDetails.fob * styleDetails.dollarChange * styleDetails.importFactor) * shipping.units * 1.0) || 0,
                                totalRetail: (styleDetails.price * shipping.units) * 1.0,
                                brandManager,
                                productManager,
                                designer,
                                piNumber: shipping.piName,
                                country: purchaseStyle.purchaseStore.store.destinyCountry.name,
                                sticker: detailsData.seasonStickers[styleDetails.seasonStickerId]?.name || '',
                                internetDescription: styleDetails.internetDescription,
                                segment: detailsData.segments[styleDetails.segmentId]?.name || '',
                                delivery: shipping.shipping,
                                units: shipping.units,
                                date: moment(shipping.date).format('DD-MMM-yyyy'),
                                category: detailsData.categories[styleDetails.categoryId]?.name || '',
                                exitPort: detailsData.exitPorts[styleDetails.exitPortId]?.name || '',
                                exitPortCode: detailsData.exitPorts[styleDetails.exitPortId]?.jdaCode || '',
                                approvalDate: purchaseStyle?.purchaseStore?.purchase?.approvalDate ? moment(purchaseStyle.purchaseStore.purchase.approvalDate).format('DD-MMM-yyyy') : '',
                                ocJda: shippingOcs.map(oc => oc.ponumb).join('/'),
                                impNum: shippingOcs[0] ? `${purchaseStyle.purchaseStore.store.impnumpfx}${shippingOcs[0].poedat.toString().substring(0, 4)}${shippingOcs[0].ponumb}` : null,
                            });
                        }
                    }
                }
            });
        }));
    }
    
}