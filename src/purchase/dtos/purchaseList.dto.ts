import { ApiProperty } from '@nestjs/swagger';
import { Purchase } from '../../entities/purchase.entity';

export class PurchaseListDto {

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
        description: 'Marca',
        example: '',
    })
    brand: string;

    @ApiProperty({
        description: 'Departamento',
        example: '',
    })
    department: string;

    @ApiProperty({
        description: 'Fecha de viaje',
        example: new Date(),
    })
    tripDate: Date;

    @ApiProperty({
        description: 'Temporada comercial',
        example: '',
    })
    seasonCommercial: string;

    @ApiProperty({
        description: 'Usuario',
        example: '',
    })
    user: string;

    @ApiProperty({
        description: 'Status Id',
        example: '',
    })
    statusId: number;

    @ApiProperty({
        description: 'Descripcion Estado',
        example: '',
    })
    status: string;

    @ApiProperty({
        description: 'Unidad de negocio',
        example: '',
    })
    stores: string;

    /**
     *
     */
    constructor(data: Purchase, brands: any[], departments: any[]) {
        this.id = data?.id;
        this.brand = brands?.filter(b => data?.brands.indexOf(b.id) != -1).map(b => b.name).join(',');
        this.department = departments?.filter(b => data?.departments.indexOf(b.id) != -1).map(b => b.name).join(',');
        this.tripDate = data?.tripDate;
        this.status = data?.status.name;
        this.name = data?.name;

    }

}
