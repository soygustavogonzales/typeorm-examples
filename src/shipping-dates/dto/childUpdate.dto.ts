import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsNumber } from 'class-validator';

export class ChildUpdateDto {
    @ApiProperty({
        description: 'Id',
        example: 1,
        required: false,
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'Cantidad de dias',
        example: 1,
    })
    @IsNumber()
    days: number;
}
