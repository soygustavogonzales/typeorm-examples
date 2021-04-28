import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, Validator } from 'class-validator';

export class ChildFilterDto {
    @ApiProperty({
        description: 'Id',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    id?: number;

    @ApiProperty({
        description: 'Id de la Division',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    divisionId?: number;

    @ApiProperty({
        description: 'Id de la Temporada Comercial',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    seasonCommercialId?: number;

    @ApiProperty({
        description: 'Id pais origen',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    originCountryId?: number;

    @ApiProperty({
        description: 'Cantidad de dias',
        example: 1,
    })
    @IsOptional()
    @IsString()
    days?: number;
}
