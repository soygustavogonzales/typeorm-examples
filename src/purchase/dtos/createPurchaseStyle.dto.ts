import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class CreatePurchaseStyleDto {
    @ApiProperty({
        description: 'Id de Estilo Compra',
        example: '',
    })
    purchaseStyleId: number;


    @ApiProperty({
        description: 'Id de Compra - Unidad de Negocio',
        example: '',
    })
    @IsNotEmpty()
    purchaseStoreId: number;

    @ApiProperty({
        description: 'Id de Estilo',
        example: '',
    })
    @IsNotEmpty()
    styleId: number;

    @ApiProperty({
        description: 'Ids de Estilo Color',
        example: '',
    })
    @IsNotEmpty()
    styleColorsId: string;

}
