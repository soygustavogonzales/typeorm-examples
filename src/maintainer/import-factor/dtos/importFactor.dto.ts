import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImportFactorDto {
    @ApiProperty({
        description: 'Id del factor de importación',
        example: 1,
        required: false,
    })
    @IsOptional()
    id: number;

    @ApiProperty({
        description: 'Id del país Origen',
        example: 1,
        required: true,
    })
    originCountryId: number;

    @ApiProperty({
        description: 'Id del país Destino',
        example: 1,
        required: true,
    })
    destinyCountryId: number;

    @ApiProperty({
        description: 'Id del metodo de envio',
        example: 1,
        required: true,
    })
    shipmethodId: number;

    @ApiProperty({
        description: 'Id del departamento',
        example: 1,
        required: true,
    })
    departmentId: number;

    @ApiProperty({
        description: 'Valor del factor',
        example: 1,
        required: true,
    })
    factor: number;

    @ApiProperty({
        description: 'Activo',
        example: true,
        required: false,
    })
    active: boolean;
}