import moment = require('moment');
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';
import { GetUserDto } from '../../external-services/security-proxy/dtos/getUser.dto';
import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';

export class PurchaseStyleOrderRecapDto {
    status: string;
    season: string;
    // productSeason: string;
    // tripDate: string;
    unit: string;
    division: string;
    divisionId: number;
    departmentCode: string;
    department: string;
    departmentId: string;
    // classTypeCode: string;
    classType: string;
    classTypeId: string;
    providerCode: string;
    provider: string;
    providerId: number;
    brand: string;
    brandId: number;
    composition: string;
    fabricWeaving: string;
    fabricConstruction: string;
    fabricWeight: string;
    gauge: string;
    styleCode: string;
    color: string;
    // colorCode: string;
    // collection: string;
    // profile: string;
    origin: string;
    shippingMethod: string;
    ratio: string;
    size: string;
    packingMethod: string;
    hanger: string;
    vstTag: string;
    atc: string;
    unitsPerInner: number;
    innerPerMaster: number;
    // cbm: number;
    // totalCbm: number;
    rse: string;
    // totalQty: number;
    // firstDelivery: string;
    fob: number;
    // totalFob: number;
    brandManager: string;
    // productManager: string;
    designer: string;
    piNumber: string;
    country: string;
    sticker: string;
    internetDescription: string;
    // segment: string;
    delivery: string;
    units: number;
    date: string;
    category: string;
    exitPort: string;
    exitPortCode: string;

    // Notification data
    purchaseId: number;
    departmentsRelated: string;
    purchaseUserId: number;
    merchantsUserId: string;

    constructor(styleData: any, styleDetails: PurchaseStyleDetails, purchaseStyle: PurchaseStyle, color: PurchaseStyleColor, colorData: any, users: GetUserDto[], shipping: PurchaseStyleColorShipping) {
        const destinyCountry = purchaseStyle.purchaseStore.store.destinyCountry;
        // const firsDeliveryDate = color.shippings.map(s => s.date).sort((a, b) => a.getTime() - b.getTime())[0];
        const brandManager = users?.find(u => u.id.toString() == styleDetails.brandManager);
        // const productManager = users?.find(u => u.id.toString() == styleDetails.productManager);
        const designer = users?.find(u => u.id.toString() == styleDetails.designer);
        
        this.status = 'Confirmed';
        this.season = purchaseStyle.purchaseStore.purchase.seasonCommercial.name;
        // this.productSeason = styleData.seasonProduct,
        // this.tripDate = moment(purchaseStyle.purchaseStore.purchase.tripDate).format('MMM-yyyy'),
        this.unit = purchaseStyle.purchaseStore.store.name;
        this.division = styleData.division;
        this.departmentCode = styleData.departmentCode;
        this.department = styleData.department;
        // this.classTypeCode = styleData.classTypeCode,
        this.classType = styleData.classType;
        this.providerCode = styleDetails.provider?.codeJda;
        this.provider = styleDetails.provider?.name;
        this.brand = destinyCountry.shortName === 'PE' && styleData.brand.toUpperCase() === 'MELT' ? 'AUSSIE' : styleData.brand;
        this.composition = styleDetails.composition;
        this.fabricWeaving = styleDetails.fabricWeaving;
        this.fabricConstruction = styleDetails.fabricConstruction;
        this.fabricWeight = styleDetails.fabricWight;
        this.gauge = styleDetails.gauge;
        this.styleCode = styleData.code;
        this.color = colorData.colorName;
        // this.colorCode = colorData.colorCode,
        // this.collection = styleDetails.collection,
        // this.profile = styleData.profileJdaCode,
        this.origin = styleDetails.origin?.name;
        this.shippingMethod = styleDetails.shippingMethod?.name;
        this.ratio = styleDetails.ratio?.ratio;
        this.size = styleDetails.size?.size;
        this.packingMethod = styleDetails.packingMethod?.name;
        this.hanger = styleDetails.hanger ? 'YES' : 'NO';
        this.vstTag = styleDetails.vstTag ? 'YES' : 'NO';
        this.atc = styleDetails.atc ? 'YES' : 'NO';
        this.unitsPerInner = styleDetails.ratio ? styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b) : 0;
        this.innerPerMaster = styleData.divisionMaster;
        // this.cbm = (styleData.cbm *(Math.sqrt(styleData.cbm))/(Math.sqrt(styleData.cbm))),
        // this.totalCbm = color.getTotalUnits() * styleData.cbm,
        this.rse = styleDetails.rse?.name || '';
        // this.totalQty = color.getTotalUnits(),
        // this.firstDelivery = firsDeliveryDate ? moment(firsDeliveryDate).format('DD-MMM-yyyy') : '',
        // Debido a que por defecto ocurre un error y en el excel no reconoce el valor numerico, al hacer un calculo adicional se reactualiza el formato numerico del atributo FOB
        this.fob = (styleDetails.fob*(Math.sqrt(styleData.cbm)))/(Math.sqrt(styleData.cbm));
        // this.totalFob = color.getTotalUnits() * styleDetails.fob,
        this.brandManager = brandManager ? `${brandManager.firstName} ${brandManager.lastName}` : '';
        // this.productManager = productManager ? `${productManager.firstName} ${productManager.lastName}` : '' ,
        this.designer = designer ? `${designer.firstName} ${designer.lastName}` : '';
        this.piNumber = shipping.piName;
        this.country = destinyCountry.name;
        this.sticker = styleDetails.seasonSticker.name;
        this.internetDescription = styleDetails.internetDescription;
        // this.segment = styleDetails.segment?.name || '',
        this.delivery = shipping.shipping;
        this.units = shipping.units;
        this.date = moment(shipping.date).format('DD-MMM-yyyy');
        this.category = styleDetails.category?.name;
        this.exitPort = styleDetails.exitPort?.name;
        this.exitPortCode = styleDetails.exitPort?.jdaCode;
        // Notification data
        this.purchaseId = purchaseStyle.purchaseStore?.purchase?.id;
        this.departmentsRelated = purchaseStyle.purchaseStore?.purchase?.departments ? purchaseStyle.purchaseStore.purchase.departments.join(',') : '';
        this.purchaseUserId = purchaseStyle.purchaseStore?.purchase?.userId;
        this.merchantsUserId = styleDetails.merchandiser;
        // Group data
        this.brandId = styleData.brandId;
        this.departmentId = styleData.departmentId;
        this.providerId = styleDetails.provider.id;
    }
}

export const headerOrderRecap = {
    status: 'STATUS',
    season: 'SEASON',
    unit: 'UNIT',
    division: 'DIVISION',
    departmentCode: 'ID DEPT',
    department: 'DEPT',
    classType: 'CLASS DESC',
    providerCode: 'VENDOR',
    provider: 'VENDOR DESC',
    brand: 'BRAND',
    composition: 'COMPOSITION',
    fabricWeaving: 'FABRIC WEAVING',
    fabricConstruction: 'FABRIC CONSTRUCTION',
    fabricWeight: 'FABRIC WEIGHT',
    gauge: 'GAUGE',
    styleCode: 'STYLE',
    color: 'COLOR',
    origin: 'ORIGIN',
    shippingMethod: 'SHIPPING METHOD',
    ratio: 'RATIO',
    size: 'SIZE',
    packingMethod: 'PACKING METHOD',
    hanger: 'HANGER',
    vstTag: 'VST TAG',
    atc: 'ATC',
    unitsPerInner: 'UNITS PER INNER',
    innerPerMaster: 'INNER PER MASTER',
    rse: 'RSE',
    fob: 'FOB',
    brandManager: 'BRAND MANAGER',
    designer: 'DESIGNER',
    piNumber: 'PI NUMBER',
    country: 'COUNTRY',
    sticker: 'STICKER',
    internetDescription: 'INTERNET DESCRIPTION',
    delivery: 'DELIVERY',
    units: 'UNITS',
    date: 'DATE',
    category: 'CATEGORY',
    exitPort: 'EXIT PORT NAME',
    exitPortCode: 'EXIT PORT CODE',
    // productSeason: 'PRODUCT SEASON',
    // tripDate: 'TRIP DATE',
    // classTypeCode: 'CLASS',
    // colorCode: 'ID COLOR',
    // collection: 'COLLECTION',
    // profile: 'PROFILE',
    // cbm: 'CBM',
    // totalCbm: 'TOTAL CBM',
    // totalQty: 'TOTAL QTY',
    // firstDelivery: 'FIRST DELIVERY',
    // totalFob: 'TOTAL FOB',
    // productManager: 'PRODUCT MANAGER',
    // segment: 'SEGMENTATION',
}