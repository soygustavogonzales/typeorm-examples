import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { ColorShippingUnits } from './colorShippingUnits.dto';
import { StatusPurchaseColor } from '../../entities/statusPurchaseColor.entity';
export class StyleColorPurchaseDto {
    @ApiProperty({
        description: 'Id de Estilo Color Compra',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Id de Estilo Color',
        example: '',
    })
    styleColorId: number;

    @ApiProperty({
        description: 'Estado de activo Estilo Color',
        example: '',
    })
    state: boolean;

    @ApiProperty({
        description: 'Shippings Units',
        example: '',
    })
    shippings: ColorShippingUnits[];

    @ApiProperty({
        description: 'Nombre Color',
        example: '',
    })
    colorName: string;

    @ApiProperty({
        description: 'Rgb Color',
        example: '',
    })
    colorRgb: string;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    status: StatusPurchaseColor;


    constructor(data: PurchaseStyleColor, colorsData: any = null) {
        this.id = data.id;
        this.styleColorId = data.styleColorId;
        this.state = data.state;
        this.status = data.status;
        this.shippings = data?.shippings?.map(s => new ColorShippingUnits(s, this.id, this.state, s.id)) || [];
        const colorData = colorsData?.find(s => s.id === this.styleColorId) ?? null;
        if (colorData) {
            this.colorName = colorData.colorName;
            this.colorRgb = colorData.colorRgb;
        }
    }
}