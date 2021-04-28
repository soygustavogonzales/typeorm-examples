import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { StyleColorPurchaseDto } from './stylesColorPurchase.dto';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';

export class StylePurchaseSummaryDto {
    @ApiProperty({
        description: 'Id de Estilo Compra',
        example: '',
    })
    id: number;


    @ApiProperty({
        description: 'Id de Estilo',
        example: '',
    })
    styleId: number;

    @ApiProperty({
        description: 'Ids de Estilo Color',
        example: '',
    })
    colors: StyleColorPurchaseDto[];

    @ApiProperty({
        description: 'Departamento',
        example: '',
    })
    department: string;

    @ApiProperty({
        description: 'Id Departamento',
        example: '',
    })
    departmentId: number;

    @ApiProperty({
        description: 'Brand',
        example: '',
    })
    brand: string;

    @ApiProperty({
        description: 'ClassType',
        example: '',
    })
    classType: string;

    @ApiProperty({
        description: 'SubDepartment',
        example: '',
    })
    subDepartment: string;

    @ApiProperty({
        description: 'Tipo de producto',
        example: '',
    })
    articleType: string;

    @ApiProperty({
        description: 'Code',
        example: '',
    })
    code: string;

    @ApiProperty({
        description: 'Temporada de producto',
        example: '',
    })
    seasonProduct: string;
    

    @ApiProperty({
        description: 'Total de unidades',
        example: '',
    })
    totalUnits: number;

    @ApiProperty({
        description: 'Unidad de negocio',
        example: '',
    })
    store: string;

    @ApiProperty({
        description: 'Id Unidad de negocio',
        example: '',
    })
    storeId: number;

    @ApiProperty({
        description: 'Prioridad Unidad de negocio',
        example: '',
    })
    storePriority: number;

    destinyCountryId: number;

    destinyCountryIVA: number;



    details: PurchaseStyleDetails;


    constructor(data: PurchaseStyle, stylesData: any = null) {
        this.id = data.id;
        this.styleId = data.styleId;
        this.store = data.purchaseStore?.store.name;
        this.storeId = data.purchaseStore?.store.id;
        this.storePriority = data.purchaseStore?.store.priority;
        this.destinyCountryId = data.purchaseStore?.store.destinyCountryId;
        this.destinyCountryIVA = data.purchaseStore?.store.destinyCountry?.iva / 100;
        const styleData = stylesData?.find(s => s.id === this.styleId) ?? null;
        if (styleData) {
            // TODO: properties needs
            this.department = styleData.department;
            this.departmentId = styleData.departmentId;
            this.brand = styleData.brand;
            this.classType = styleData.classType;
            this.subDepartment = styleData.subDepartment;
            this.articleType = styleData.articleType;
            this.code = styleData.code;
            this.seasonProduct = styleData.seasonProduct;
        }
        this.colors = data?.colors.map(s => new StyleColorPurchaseDto(s, styleData?.colors)) || [];
        this.totalUnits = this.colors.length > 0 ? this.colors.map(c => {
            if (c.shippings.length > 0) {
                return c.shippings.map(s => s.units).reduce((a, b) => a + b);
            } else { return 0; }
        }).reduce((a, b) => a + b) : 0;
        this.details = data?.details?.length > 0 ? data.details[0] : null;
    }

    // getTotalUnits() {
    //     const units = this.colors.map(c => c.shippings.map(c => c.units).reduce((a, b) => a + b)).reduce((a, b) => a + b);
    // }
}