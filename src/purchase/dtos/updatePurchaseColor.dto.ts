import { ApiProperty } from '@nestjs/swagger';
export class UpdatePurchaseColorDto {
    @ApiProperty({
        description: 'Id de Estilo Color Compra',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Estado Estilo Color',
        example: '',
    })
    state: boolean;
}