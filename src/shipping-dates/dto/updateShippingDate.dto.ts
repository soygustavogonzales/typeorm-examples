import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsNotEmpty, IsAlphanumeric, IsEnum, IsDate } from 'class-validator';
import {Type} from 'class-transformer';
import { SeasonCommercial } from '../../entities/seasonCommercial.entity';
import { OriginCountry } from '../../entities/originCountry.entity';

export class UpdateShippingDateDto {

    @ApiProperty({
        description: 'Id',
        example: 1,
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'Id Division',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    divisionId: number;

    @ApiProperty({
        description: 'Id Temporada comercial',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    seasonCommercialId: SeasonCommercial;

    @ApiProperty({
        description: 'Id Pais de origen',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    originCountryId: OriginCountry;

    @ApiProperty({
        description: 'Envio E1,E2....E6',
        example: 'E1',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsAlphanumeric()
    @IsEnum({sd1 : 'E1', sd2 : 'E2', sd3 : 'E3', sd4 : 'E4', sd5 : 'E5', sd6 : 'E6'})
    shipping: string;

    @ApiProperty({
        description: 'Fecha envío YYYY-MM-DD',
        example: '2020-04-29',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    date: Date;
}
