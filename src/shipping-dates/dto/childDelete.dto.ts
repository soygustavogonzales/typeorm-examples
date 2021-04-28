import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChildDeleteDto {
    @ApiProperty({
        description: 'Id de la Division',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    divisionId: number;

    @ApiProperty({
        description: 'Id de la Temporada Comercial',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    seasonCommercialId: number;

    @ApiProperty({
        description: 'Id pais origen',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsString()
    originCountryId: number;
}
