import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';

export class PurchaseNegotiationConfirm {
    purchaseId: number;
    styleId: number;
    department: string;
    subDepartment: string;
    classType: string;
    brand: string;
    season: string;
    category: string;
    tripDate: string;
    style: string;
    colorQty: number;
    composition: string;
    fabricWeaving: string;
    fabricConstruction: string;
    fabricWeight: string;
    gauge: string;
    packingMethod: string;
    vstTag: boolean;
    hanger: boolean;	
    fob: number;
    referencialProvider: string;
    totalUnits: number;
    ecommerce: boolean;	
    regularPrice: number;
    satoPrice: number;
    imuRegular: number;
    imuSato: number;
    dollar: number;
    tax: number;
    importFactor:number;
    purchaseStyleNegotiation:number;
    vendorName:string;
    quotations: {
        id: number;
        vendorName: string;
        vendorFob: number;
        exitPort: string;
        vendorComments: string;
    }[];
}