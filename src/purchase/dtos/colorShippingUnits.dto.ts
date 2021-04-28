import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import { ShippingDates } from '../../entities/shippingDates.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ColorShippingUnits {
    @ApiProperty({
        description: 'Id de compra estilo color',
        example: '',
    })
    purchaseColorStoreId: number;

    @ApiProperty({
        description: 'Id del envío compra estilo color',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Estado de compra estilo color',
        example: '',
    })
    state: boolean;

    @ApiProperty({
        description: 'Fecha del envío de compra estilo color',
        example: '',
    })
    date: Date;

    @ApiProperty({
        description: 'Cantidad de unidades de envío de compra estilo color',
        example: '',
    })
    units: number;

    @ApiProperty({
        description: 'Nombre del envío de compra estilo color',
        example: '',
    })
    shippingName: string;

    /**
     *
     */
    constructor(data: any, purchaseStyleColorId: number, state: boolean, id = -1) {
        this.id = id;
        this.purchaseColorStoreId = purchaseStyleColorId;
        this.state = state;
        this.date = data.date;
        this.shippingName = data.shipping;
        this.units = data.units && this.state ? data.units : 0;
    }

}