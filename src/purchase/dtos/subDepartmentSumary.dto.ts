import { ApiProperty } from '@nestjs/swagger';
import { String } from 'aws-sdk/clients/apigateway';

export class SubDepartmentSumaryDto {
    @ApiProperty({
        description: 'Subdepartamento',
        example: '',
    })
    name: string;

    @ApiProperty({
        description: 'Cantidad Estilos',
        example: '',
    })
    stylesPurchaseCount: number;

    @ApiProperty({
        description: 'Cantidad de Unidades compradas',
        example: '',
    })
    unitsTotalCount: number;

    @ApiProperty({
        description: 'Total Retail', // (SUMATORIA (Unidades*Precio Normal, por cada estilo))',
        example: '',
    })
    totalRetail: number;

    @ApiProperty({
        description: 'Total Promotion', // (SUMATORIA (Unidaldes*Precio Sato, por cada Estilo)),
        example: '',
    })
    totalPromotion: number;

    @ApiProperty({
        description: 'Total Cost', // (SUMATORIA(Unidades*Costo*, por cada estilo))',
        example: '',
    })
    totalCost: string;

    @ApiProperty({
        description: 'Precio promedio', // (Promedio Precio Sato) - PVP Promedio,
        example: '',
    })
    pvpPrice: number;

    @ApiProperty({
        description: 'Costo promedio', // (Promedio Costo*) - Costo Promedio,
        example: '',
    })
    averageCost: string;

    @ApiProperty({
        description: 'IMU', // IMU (((PRECIO NORMAL / (1 + MANTENEDOR IMPUESTO PAIS ) - COSTO*)/ (PRECIO NORMAL (/ (1 + MANTENEDOR IMPUESTO PAIS ) ),
        example: '',
    })
    imu: string;

    @ApiProperty({
        description: 'IMU Sato', // IMU SATO ((PRECIO SATO / (1 + MANTENEDOR IMPUESTO PAIS ) - COSTO*/ (PRECIO SATO / (1 + MANTENEDOR IMPUESTO PAIS ) )
        example: '',
    })
    imuSato: string;

    @ApiProperty({
        description: 'FOB Promedio', // (Promedio FOB) - FOB Promedio,
        example: '',
    })
    averageFob: string;

    @ApiProperty({
        description: 'Unidades por entrega', // (se apertura de E1 A E6 con unidades de cada entrega,
        example: '',
    })
    unitsByShipping: any;

    @ApiProperty({
        description: 'Costo por entrega', // (se apertura de E1 A E6 con unidades de cada entrega,
        example: '',
    })
    costByShipping: any;

    @ApiProperty({
        description: 'Lista de estilos', // (se apertura de E1 A E6 con unidades de cada entrega,
        example: '',
    })
    stylesList: any[];


    /**
     *
     */
    constructor(name: string) {
        this.name = name;

    }

}
