import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsAlphanumeric, IsEnum, IsDate, IsOptional } from 'class-validator';
import {Type} from 'class-transformer';

export class CreateBulkShippingDateDtoShippings {
    @ApiProperty({
        description: 'Envio E1,E2....E6',
        example: 'E1',
    })
    @IsNotEmpty()
    @IsAlphanumeric()
    @IsEnum({sd1 : 'E1', sd2 : 'E2', sd3 : 'E3', sd4 : 'E4', sd5 : 'E5', sd6 : 'E6'})
    shipping: string;

    @ApiProperty({
        description: 'Fecha envío YYYY-MM-DD',
        example: '2020-04-29',
    })
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    date: Date;
}
