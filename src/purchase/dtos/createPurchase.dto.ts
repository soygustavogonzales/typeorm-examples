import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class CreatePurchaseDto {

    @ApiProperty({
        description: 'Id',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Name',
        example: '',
    })
    name: string;

    @ApiProperty({
        description: 'Marcas',
        example: '',
    })
    @IsNotEmpty()
    brandIds: string;

    @ApiProperty({
        description: 'Departamento',
        example: '',
    })
    @IsNotEmpty()
    departmentIds: string;

    @ApiProperty({
        description: 'Fecha de viaje',
        example: new Date(),
    })
    @IsNotEmpty()
    tripDate: Date;

    @ApiProperty({
        description: 'Temporada comercial',
        example: '',
    })
    @IsNotEmpty()
    seasonCommercialId: number;

    @ApiProperty({
        description: 'Usuario',
        example: '',
    })
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    @IsNotEmpty()
    statusId: number;

    @ApiProperty({
        description: 'Unidad de negocio',
        example: '',
    })
    @IsNotEmpty()
    storesId: string;

    @ApiProperty({
        description: 'Temporadas de producto',
        example: '',
    })
    @IsNotEmpty()
    seasonProductsIds: string;
}
