import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { StatusPurchaseColor } from '../../entities/statusPurchaseColor.entity';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';

export class GetPurchaseStyleToAdjustDto {


    @ApiProperty({
        description: 'Id de compra estilo',
        example: '',
    })
    purchaseStyleStoreId: number;

    @ApiProperty({
        description: 'Id de Estilo Color',
        example: '',
    })
    purchaseStyleColorStoreId: number;


    @ApiProperty({
        description: 'Id de compra estilo detalles',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    status: StatusPurchaseColor;

    @ApiProperty({
        description: 'Id de unidad de negocio',
        example: '',
    })
    storeId: number;

    @ApiProperty({
        description: 'Id de Estilo',
        example: '',
    })
    styleId: number;

    @ApiProperty({
        description: 'Campos a editar',
        example: '',
    })
    fields: any[];

    @ApiProperty({
        description: 'Temporada',
        example: '',
    })
    seasonName: string;

    @ApiProperty({
        description: 'Id Temporada',
        example: '',
    })
    seasonId: number;

    @ApiProperty({
        description: 'Id Division',
        example: '',
    })
    divisionId: number;

    @ApiProperty({
        description: 'Marca',
        example: '',
    })
    brandName: string;

    @ApiProperty({
        description: 'Profile',
        example: '',
    })
    profileName: string;

    @ApiProperty({
        description: 'Departamento',
        example: '',
    })
    departmentName: string;

    @ApiProperty({
        description: 'SubDepartamento',
        example: '',
    })
    subDepartmentName: string;

    @ApiProperty({
        description: 'Codigo Referencial',
        example: '',
    })
    code: string;

    @ApiProperty({
        description: 'Unidad de Negocio',
        example: '',
    })
    storeName: string;

    @ApiProperty({
        description: 'Orden Unidad de Negocio',
        example: '',
    })
    storePriority: number;

    @ApiProperty({
        description: 'Color',
        example: '',
    })
    colorName: string;

    @ApiProperty({
        description: 'StyleColorId',
        example: '',
    })
    styleColorId: number;

    @ApiProperty({
        description: 'Color',
        example: '',
    })
    colorList: Color[];

    @ApiProperty({
        description: 'Codigo Estilo',
        example: '',
    })
    codeNumber: string;

    @ApiProperty({
        description: 'Id Pais de Origen',
        example: '',
    })
    idOriginCountry: number;

    @ApiProperty({
        description: 'Nombre Pais de Origen',
        example: '',
    })
    origin: string;

    @ApiProperty({
        description: 'Fecha de viaje de compra',
        example: '',
    })
    tripDate: Date;
    /**
     *
     */
    constructor(purchaseStyle: PurchaseStyle, fields: any[], styleData: any, id: number,  status: StatusPurchaseColor, details: PurchaseStyleDetails) {
        this.id = id;
        this.purchaseStyleStoreId = purchaseStyle.id;
        this.styleId = purchaseStyle.styleId;
        this.storeId = purchaseStyle.purchaseStore.store.id;
        this.storePriority = purchaseStyle.purchaseStore.store.priority;
        this.storeName = purchaseStyle.purchaseStore.store.name;
        this.fields = fields;
        this.tripDate = purchaseStyle.purchaseStore?.purchase?.tripDate;

        this.idOriginCountry = details?.origin?.id;
        this.origin = details?.origin?.name;

        this.seasonName = purchaseStyle.purchaseStore?.purchase?.seasonCommercial?.name || '';
        this.seasonId = purchaseStyle.purchaseStore?.purchase?.seasonCommercial?.id || -1;
        this.brandName = styleData?.brand;
        this.profileName = styleData?.profileJdaCode;
        this.departmentName = styleData?.department;
        this.divisionId = styleData?.divisionId;
        this.subDepartmentName = styleData?.subDepartment;
        this.code = styleData?.code;
        this.codeNumber = styleData?.codeNumber;
        this.status = status;
    }
    public updateColor(colorName: string, styleColorId: number) {
        this.styleColorId = styleColorId;
        this.colorName = colorName;
    }

    updateColorList(colors: any, colorName: string, styleColorId: number) {
        this.styleColorId = styleColorId;
        this.colorName = colorName;
        this.colorList = colors.map(c => ({ id: c?.id, name: c?.colorName }));
    }


}

interface Color {
    id: number;
    name: string;
}
