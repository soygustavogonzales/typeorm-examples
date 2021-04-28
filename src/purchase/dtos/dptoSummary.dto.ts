import { ApiProperty } from '@nestjs/swagger';
import { SubDepartmentSumaryDto } from './subDepartmentSumary.dto';

export class DepartamentSummaryDto {

    @ApiProperty({
        description: 'Id departamento',
        example: '',
    })
    id: number;
    @ApiProperty({
        description: 'Nombre departamento',
        example: '',
    })
    name: string;

    @ApiProperty({
        description: 'Resumen por SubDepartamentos',
        example: '',
    })
    subDepartmentsSummary: SubDepartmentSumaryDto[];

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
        this.subDepartmentsSummary = [];
    }

}
