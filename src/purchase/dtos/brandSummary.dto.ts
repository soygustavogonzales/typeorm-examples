import { ApiProperty } from '@nestjs/swagger';
import { DepartamentSummaryDto } from './dptoSummary.dto';

export class BrandSummaryDto {

    @ApiProperty({
        description: 'Id Marca',
        example: '',
    })
    id: number;
    @ApiProperty({
        description: 'Nombre Marca',
        example: '',
    })
    name: string;

    @ApiProperty({
        description: 'Resumen por Departamento',
        example: '',
    })
    departmentsSummary: DepartamentSummaryDto[];

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
        this.departmentsSummary = [];

    }
}
