import { ApiProperty } from '@nestjs/swagger';

export class ColorShippingDto {

    @ApiProperty({
        description: 'Id del envío compra estilo color',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Id de compra estilo color',
        example: 1,
    })
    purchaseStyleColorId: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 1',
        example: 200,
    })
    unitsE1: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 2',
        example: 200,
    })
    unitsE2: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 3',
        example: 200,
    })
    unitsE3: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 4',
        example: 200,
    })
    unitsE4: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 5',
        example: 200,
    })
    unitsE5: number;

    @ApiProperty({
        description: 'Cantidad de unidades de envío 6',
        example: 200,
    })
    unitsE6: number;

    @ApiProperty({
        description: 'Fecha del envío 1',
        example: '',
    })
    dateE1: Date;

    @ApiProperty({
        description: 'Fecha del envío 2',
        example: '',
    })
    dateE2: Date;

    @ApiProperty({
        description: 'Fecha del envío 3',
        example: '',
    })
    dateE3: Date;

    @ApiProperty({
        description: 'Fecha del envío 4',
        example: '',
    })
    dateE4: Date;

    @ApiProperty({
        description: 'Fecha del envío 5',
        example: '',
    })
    dateE5: Date;

    @ApiProperty({
        description: 'Fecha del envío 6',
        example: '',
    })
    dateE6: Date;

}