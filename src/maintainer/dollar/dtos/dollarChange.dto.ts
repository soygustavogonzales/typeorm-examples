import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DollarChangeDto {
    @ApiProperty({
        description: 'Id del tipo de cambio',
        example: 1,
        required: false,
    })
    @IsOptional()
    id: number;

    @ApiProperty({
        description: 'Id del país Destino',
        example: 1,
        required: true,
    })
    destinyCountryId: number;

    @ApiProperty({
        description: 'Id de la temporada',
        example: 1,
        required: true,
    })
    seasonId: number;

    @ApiProperty({
        description: 'Valor del cambio',
        example: 1,
        required: true,
    })
    changeValue: number;

}