import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteShippingDateDto {

    @ApiProperty({
        description: 'Id',
        example: 1,
    })
    @IsNumber()
    id: number;
}
