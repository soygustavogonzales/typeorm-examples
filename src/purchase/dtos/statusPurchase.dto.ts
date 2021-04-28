import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class StatusPurchaseDto {

    @ApiProperty({
        description: 'Id',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    @IsNotEmpty()
    statusId: number;

}
