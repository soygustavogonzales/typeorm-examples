import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import { ShippingDates } from '../../entities/shippingDates.entity';
import { ApiProperty } from '@nestjs/swagger';

export class StyleDetailDto {
    @ApiProperty({
        description: 'Id de compra estilo',
        example: '',
    })
    purchaseStyleStoreId: number;

    @ApiProperty({
        description: 'Id de compra estilo detalles',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Valor de Detalle',
        example: '',
    })
    detailsValue: string;

    /**
     *
     */
    constructor(data: any, id = -1, detailsValue: string) {
        this.id = id;
        this.purchaseStyleStoreId = data?.purchaseStyle?.id;
        this.detailsValue = detailsValue;
    }

}
