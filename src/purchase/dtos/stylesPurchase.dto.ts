import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { StyleColorPurchaseDto } from './stylesColorPurchase.dto';
import { Store } from '../../entities/store.entity';
export class StylePurchaseDto {
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
        description: 'Id del Departamento',
        example: '',
    })
    departmentId: number;

    @ApiProperty({
        description: 'Brand',
        example: '',
    })
    brand: string;

    @ApiProperty({
        description: 'Id Brand',
        example: '',
    })
    brandId: number;

    @ApiProperty({
        description: 'ClassType',
        example: '',
    })
    classType: string;

    @ApiProperty({
        description: 'Id ClassType',
        example: '',
    })
    classTypeId: number;

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
        description: 'Perfil',
        example: '',
    })
    profile: string;

    @ApiProperty({
        description: 'Id Perfil',
        example: '',
    })
    profileId: number;

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
        description: 'Descripcion de producto',
        example: '',
    })
    description: string;



    constructor(data: PurchaseStyle, stylesData: any = null) {
        this.id = data.id;
        this.styleId = data.styleId;
        const styleData = stylesData?.find(s => s.id === this.styleId) ?? null;
        if (styleData) {
            // TODO: properties needs
            this.department = styleData.department;
            this.departmentId = styleData.departmentId;
            this.brand = styleData.brand;
            this.profile = styleData.profileJdaCode;
            this.classType = styleData.classType;
            this.brandId = styleData.brandId;
            this.profileId = styleData.profileId;
            this.classTypeId = styleData.classTypeId;
            this.subDepartment = styleData.subDepartment;
            this.articleType = styleData.articleType;
            this.code = styleData.code;
            this.seasonProduct = styleData.seasonProduct;
            this.description = styleData.description;
        }
        this.colors = data?.colors.map(s => new StyleColorPurchaseDto(s, styleData?.colors)) || [];
        this.totalUnits = this.colors.length > 0 ? this.colors.map(c => {
            if (c.shippings.length > 0) {
                return c.shippings.map(s => s.units).reduce((a, b) => a + b);
            } else { return 0; }
        }).reduce((a, b) => a + b) : 0;
    }

    // getTotalUnits() {
    //     const units = this.colors.map(c => c.shippings.map(c => c.units).reduce((a, b) => a + b)).reduce((a, b) => a + b);
    // }
}