import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class UpdatePurchaseStyleStatusDto {
    @ApiProperty({
        description: 'Ids de los estilos compra',
        example: [3, 4],
        isArray: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    purchaseStyles: number[];

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    @IsNotEmpty()
    statusId: number;
}
