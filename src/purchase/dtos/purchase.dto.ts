import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStoreDto } from './purchaseStore.dto';
import { Purchase } from '../../entities/purchase.entity';
import { SeasonCommercial } from '../../entities/seasonCommercial.entity';

export class PurchaseDto {

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
    brands: number[];

    @ApiProperty({
        description: 'Departamento',
        example: '',
    })
    departments: number [];

    @ApiProperty({
        description: 'Fecha de viaje',
        example: new Date(),
    })
    tripDate: Date;

    @ApiProperty({
        description: 'Temporada comercial',
        example: '',
    })
    seasonCommercialId: number;

    @ApiProperty({
        description: 'Temporada comercial',
        example: '',
    })
    seasonCommercial: SeasonCommercial;

    @ApiProperty({
        description: 'Usuario',
        example: '',
    })
    userId: number;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    statusId: number;

    @ApiProperty({
        description: 'Unidad de negocio',
        example: '',
    })
    stores: PurchaseStoreDto[];

    @ApiProperty({
        description: 'Ids SeasonProduct',
        example: '20, 21'
    })
    seasonProducts?: number[];

    /**
     *
     */
    constructor(data: Purchase, stylesData: any = null) {
        this.id = data.id;
        this.name = data.name;
        this.departments = data.departments;
        this.brands = data.brands;
        this.statusId = data.status.id;
        this.seasonCommercialId = data.seasonCommercialId;
        this.seasonCommercial = data.seasonCommercial;
        this.tripDate = data.tripDate;
        this.stores = data.stores.map(s => new PurchaseStoreDto(s, stylesData)).sort((a, b) => {
            if (a.store.priority < b.store.priority) { return -1; } if (a.store.priority > b.store.priority) { return 1; } { return 0; }
        });
        this.seasonProducts = data.seasonProducts;
    }
}
