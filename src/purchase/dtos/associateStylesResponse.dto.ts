import { CreatePurchaseStyleDto } from './createPurchaseStyle.dto';
import { ApiProperty } from '@nestjs/swagger';
import { StylePurchaseDto } from './stylesPurchase.dto';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStore } from '../../entities/purchaseStore.entity';
import { Store } from '../../entities/store.entity';
export class AssociateStylesResponseDto {

    @ApiProperty({
        description: 'Id de Compra - Unidad de Negocio',
        example: '',
    })
    purchaseStoreId: number;

    // @ApiProperty({
    //     description: 'Id de Unidad de Negocio',
    //     example: '',
    // })
    // storeId: number;

    // @ApiProperty({
    //     description: 'Nombre Unidad de Negocio',
    //     example: '',
    // })
    // storeName: string;

    @ApiProperty({
        description: 'Unidad de Negocio',
        example: '',
    })
    store: Store;


    @ApiProperty({
        description: 'Estilos Seleccionados',
        example: '',
    })
    styles: StylePurchaseDto[];


    constructor(data: PurchaseStore, style: PurchaseStyle) {
        this.purchaseStoreId = data.id;
        // this.storeId = data.store.id;
        // this.storeName = data.store.name;
        this.store = data.store;
        this.styles = [];
        this.styles.push(new StylePurchaseDto(style));
    }

}