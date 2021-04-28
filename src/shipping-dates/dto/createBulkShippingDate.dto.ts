import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsAlphanumeric, IsEnum } from 'class-validator';
import { CreateBulkShippingDateDtoShippings } from './createBulkShippingDateDtoShippings.dto';
import { SeasonCommercial } from '../../entities/seasonCommercial.entity';
import { OriginCountry } from '../../entities/originCountry.entity';

export class CreateBulkShippingDateDto {
    @ApiProperty({
        description: 'Id Division',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    divisionId: number;

    @ApiProperty({
        description: 'Id Temporada comercial',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    seasonCommercialId: SeasonCommercial;

    @ApiProperty({
        description: 'Id Pais de origen',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    originCountryId: OriginCountry;

    @ApiProperty({
        description: 'Lista de Envios para crear',
        example: '{ E1: 2020-04-29, E2: 2020-05-29 }',
    })
    @IsNotEmpty()
    shippings: CreateBulkShippingDateDtoShippings[];
}
