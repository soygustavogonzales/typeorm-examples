import { ExitPort } from '../../entities/exitPort.entity';

export interface SaveQuotationSelectionDataDto {
    purchaseId: number;
    type: string;
    styles: {
        styleId: number;
        regularPrice: number;
        satoPrice: number;
        fob: number;
        purchaseStyleNegotiation: number;
        exitPort?: ExitPort;
    }[];
}