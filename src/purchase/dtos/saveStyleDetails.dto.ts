import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import { ShippingDates } from '../../entities/shippingDates.entity';
import { ApiProperty } from '@nestjs/swagger';
import { StyleDetailDto } from './styleDetails.dto';
import { IsEnum } from 'class-validator';
import { DetailsType } from './detailsType.enum';
import { isArray } from 'util';

export class SaveStyleDetailDto {


    @ApiProperty({ enum: ['Profile', 'Fob', 'Price', 'Atc'] })
    detailsType: DetailsType;

    @ApiProperty({
        description: 'Valores de detalle',
        example: [
            {
                purchaseStyleStoreId: 1,
                id: -1,
                detailsValue: ' ',
            }
        ],
        isArray: true,
        type: StyleDetailDto,
    })
    valuesList: StyleDetailDto[];

}
