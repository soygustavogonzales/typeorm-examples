import { Store } from '../../entities/store.entity';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { StylePurchaseDto } from './stylesPurchase.dto';
import { PurchaseStore } from '../../entities/purchaseStore.entity';

export class PurchaseStoreDto {
    id: number;
    store: Store;
    styles: StylePurchaseDto[];

    /**
     *
     */
    constructor(data: PurchaseStore, stylesData: any = null) {
        this.id = data.id;
        this.store = data.store;
        this.styles = data.styles?.map(s => new StylePurchaseDto(s, stylesData)) || [];
    }
}