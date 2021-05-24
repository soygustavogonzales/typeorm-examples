import { PurchaseBuyingReport } from './purchaseBuyingReport.dto';
import * as _ from 'lodash';
import moment = require('moment');

export class PurchaseBuyingReportSku extends PurchaseBuyingReport {

    constructor(protected purchaseStyles,protected stylesData,protected styleSkus,protected users, private userId: number) {
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
            ean: 'EAN', // TODO: Pending
            description: 'DESCRIPTION',
            color: 'COLOR',
            colorCode: 'ID COLOR',
            colorShortName: 'SHORT COLOR',
            collection: 'COLLECTION',
            profile: 'PROFILE',
            origin: 'ORIGIN',
            shippingMethod: 'SHIPPING METHOD',
            price: 'NORMAL PRICE',
            sato: 'SATO PRICE',
            atcId: 'ATC ID', // TODO: Pending
            ratio: 'RATIO', // add to join,
            size: 'SIZE', // add to join
            sizeId: 'SIZE ID',
            packingMethod: 'PACKING METHOD',
            hanger: 'HANGER',
            vstTag: 'VST TAG',
            unitsPerInner: 'UNITS PER INNER', // calculate by ratio,
            innerPerMaster: 'INNER PER MASTER', // calculate by ratio,
            cbm: 'CBM',
            dimension: 'DIMENSION',
            totalCbm: 'TOTAL CBM',
            rse: 'RSE EDITADO',
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
                const colorData = styleData.colors.find(c => c.id === color.styleColorId);
                const sku = styleSkus.find(sku => sku.styleId === styleData.id);
                const skuColor = sku?.skuColor.find(skuColor => skuColor.styleColorId === colorData.id);
                if (styleData && styleDetails && colorData && skuColor) {
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

                    for (const colorSize of skuColor.skuColorSize) {
                        const firsDeliveryDate = color.shippings.map(s => s.date).sort((a, b) => a.getTime() - b.getTime())[0];
                        for (const shipping of color.shippings) {
                            const unitsPerInner = styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b);
                            const totalQty = (shipping.units / unitsPerInner) * colorSize.ratio; // (color.getTotalUnits()/unitsPerInner)*colorSize.ratio;
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
                                sku: colorSize.sku,
                                ean: colorSize.ean,
                                description: `${styleData.code} ${styleData.articleType}`,
                                color: colorData.colorName,
                                colorCode: colorData.colorCode,
                                colorShortName: colorData.colorShortName,
                                collection: styleDetails.collection,
                                profile: styleData.profileJdaCode,
                                origin: styleDetails.origin.name,
                                shippingMethod: styleDetails.shippingMethod.name,
                                price: styleDetails.price,
                                sato: styleDetails.sato,
                                atcId: (purchaseStyle.purchaseStore.store.shortName !== 'PW' && 
                                        purchaseStyle.purchaseStore.store.shortName !== 'TP') ? colorSize.atc : '',
                                ratio: colorSize.ratio,
                                size: colorSize.sizeJda?.shortName || 'N/A',
                                sizeId: colorSize.sizeJda?.jdaCode || 'N/A',
                                packingMethod: styleDetails.packingMethod.name,
                                hanger: styleDetails.hanger ? 'YES' : 'NO',
                                vstTag: styleDetails.vstTag ? 'YES' : 'NO',
                                unitsPerInner: unitsPerInner,
                                innerPerMaster: styleData.divisionMaster, // calculate by ratio,
                                cbm: Number(cbm),
                                totalCbm: styleData.cbm * totalQty,
                                dimension: styleData.dimension,
                                rse: styleDetails.rse?.name || '',
                                sustainableFeature: styleDetails.sustainableFeature?.name || '',
                                composition: styleDetails.composition || '',
                                weaving: styleDetails.fabricWeaving || '',
                                construction: styleDetails.fabricConstruction || '',
                                weight: styleDetails.fabricWight || '',
                                gauge: styleDetails.gauge || '',
                                referencialProvider: styleDetails.referencialProvider || '',
                                // totalQty: totalQty,
                                firstDelivery: firsDeliveryDate ? moment(firsDeliveryDate).format('DD-MMM-yyyy') : '', // check
                                fob: styleDetails.fob *(1/1),
                                totalFob: totalQty * styleDetails.fob,
                                dollarBought: styleDetails.dollarChange*(1/1) || 0,
                                importFactor: styleDetails.importFactor * 1 || 0,
                                cost: (styleDetails.fob || 0 * styleDetails.dollarChange || 0 * styleDetails.importFactor || 0) || 0,
                                totalCost: ((styleDetails.fob * styleDetails.dollarChange * styleDetails.importFactor) * color.getTotalUnits())*(1/1) || 0, // TODO: Pending
                                totalRetail: (styleDetails.price * totalQty)*(1/1), // TODO: Pending
                                brandManager,
                                productManager,
                                designer,
                                piNumber: shipping.piName,
                                country: purchaseStyle.purchaseStore.store.destinyCountry.name,
                                sticker: styleDetails.seasonSticker.name,
                                internetDescription: styleDetails.internetDescription,
                                segment: styleDetails.segment?.name || '',
                                delivery: shipping.shipping,
                                units: totalQty,
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

        this.dataToExport = this.dataToExport.filter(row => !((row.unit === 'PARIS E-COMMERCE' || row.unit === 'TIENDAS PROPIAS') && row.size === 'SURT'));
        this.dataToExport = this.dataToExport.filter(row => !(row.unit === 'PARIS' && row.atcId != '' && row.size === 'SURT'));
        this.dataToExport = this.dataToExport.filter(row => !(row.unit === 'PARIS' && row.atcId == '' && (row.size !== 'SURT' && row.size !== 'TU' && row.packingMethod !== 'GOH / SOLID COLOR / SOLID SIZE|6' && row.packingMethod !== 'GOH/SOLID COLOR/ASSORTED SIZE|7')));
        this.dataToExport = this.dataToExport.filter(row => !(row.unit === 'PARIS' && row.atcId == '' && (row.size === 'SURT' && (row.packingMethod === 'GOH / SOLID COLOR / SOLID SIZE|6' || row.packingMethod === 'GOH/SOLID COLOR/ASSORTED SIZE|7'))));
    }
}