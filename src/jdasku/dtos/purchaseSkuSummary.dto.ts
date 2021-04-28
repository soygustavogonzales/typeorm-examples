import { SeasonCommercial } from '../../entities/seasonCommercial.entity';
import { PurchaseStore } from '../../entities/purchaseStore.entity';
import { Status } from '../../entities/status.entity';
export class PurchaseSkuSummary {
    id: number;
    name: string;
    brands: number[];
    departments: number[];
    userId: number;
    tripDate: Date;
    createDate: Date;
    updateDate: Date;
    deleteDate: Date;
    seasonCommercial: SeasonCommercial;
    status: Status;
    seasonCommercialId: number;
    stores: PurchaseStore[];
    totalStyles?: number;
    totalStylesWSku?: number;
}
