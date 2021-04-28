import { ApiProperty } from '@nestjs/swagger';

export class generateArrivalDatesDto {
    @ApiProperty({
        description: 'id de estilo-compras',
        example: [1,2,3],
    })
    purchaseStyleIds?: number[];
    
    @ApiProperty({
        description: 'id de estilo-color-compra',
        example: '',
    })
    purchaseStyleColorIds?: number[];

    @ApiProperty({
        description: 'id de compras',
        example: '',
    })
    purchaseIds?: number[];

    constructor(purchaseStyleIds?: number[], purchaseStyleColorIds?: number[], purchase?: number[]) {
        this.purchaseStyleIds = purchaseStyleIds;
        this.purchaseStyleColorIds = purchaseStyleColorIds;
        this.purchaseIds = purchase;
    }
}
