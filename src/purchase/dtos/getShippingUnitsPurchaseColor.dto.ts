import { ApiProperty } from '@nestjs/swagger';

export class GetShippingUnitsPurchaseColor {
    @ApiProperty({
        description: 'Ids de compra estilo color',
        example: '',
        isArray: true,
    })
    purchaseColorsStyleIds: number[];

    @ApiProperty({
        description: 'Id de la division de la compra',
        example: '',
    })
    divisionId: number;

    @ApiProperty({
        description: 'Id de la temporada comercial de la compra',
        example: '',
    })
    seasonCommercialId: number;
}