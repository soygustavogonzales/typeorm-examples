import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';
import { NegotiationDto } from './negotiation.dto';

export class GetPurchaseStyleToNegotiate {

    @ApiProperty({
        description: 'Id de compra estilo',
        example: '',
    })
    purchaseStyleId: number;

    @ApiProperty({
        description: 'Id de compra estilo detalles',
        example: '',
    })
    purchaseStyleDetailsId: number;

    @ApiProperty({
        description: 'Status',
        example: '',
    })
    status: string;

    @ApiProperty({
        description: 'Id de Estilo',
        example: '',
    })
    styleId: number;

    @ApiProperty({
        description: 'Id de Compra',
        example: '',
    })
    purchaseId: number;

    @ApiProperty({
        description: 'Temporada',
        example: '',
    })
    seasonName: string;

    @ApiProperty({
        description: 'Marca',
        example: '',
    })
    brandName: string;

    @ApiProperty({
        description: 'Id Marca',
        example: '',
    })
    brandId: number;

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
        description: 'Id Departamento',
        example: '',
    })
    departmentId: number;

    @ApiProperty({
        description: 'SubDepartamento',
        example: '',
    })
    subDepartmentName: string;

    @ApiProperty({
        description: 'Id SubDepartamento',
        example: '',
    })
    subDepartmentId: number;

    @ApiProperty({
        description: 'Clase',
        example: '',
    })
    className: string;
    @ApiProperty({
        description: 'Id Clase',
        example: '',
    })
    classId: number;

    @ApiProperty({
        description: 'Categoria',
        example: '',
    })
    category: string;

    @ApiProperty({
        description: 'Fecha de viaje',
        example: '',
    })
    tripDate: Date;

    @ApiProperty({
        description: 'Composicion',
        example: '',
    })
    composition: string;

    @ApiProperty({
        description: 'Fabric Weaving',
    })
    fabricWeaving: string;

    @ApiProperty({
        description: 'Fabric Construction',
    })
    fabricConstruction: string;

    @ApiProperty({
        description: 'Fabric Weight',
    })
    fabricWight: string;

    @ApiProperty({
        description: 'Gauge',
    })
    gauge: string;

    @ApiProperty({
        description: 'fob',
    })
    fob: number;

    @ApiProperty({
        description: 'hanger',
    })
    hanger: boolean;

    @ApiProperty({
        description: 'vstTag',
    })
    vstTag: boolean;

    @ApiProperty({
        description: 'referencialProvider',
    })
    referencialProvider: string;

    @ApiProperty({
        description: 'Price',
    })
    price: number;

    @ApiProperty({
        description: 'Sato',
    })
    sato: number;

    @ApiProperty({
        description: 'Imu',
    })
    imu: number;

    @ApiProperty({
        description: 'Packing Method',
    })
    packingMethod: string;

    @ApiProperty({
        description: 'Codigo Referencial',
        example: '',
    })
    code: string;

    @ApiProperty({
        description: 'Unidades Totales'
    })
    totalUnits: number;

    @ApiProperty({
        description: 'Ecommerce',
        example: '',
    })
    ecommerce: boolean;

    @ApiProperty({
        description: 'Cantidad Color',
        example: '',
    })
    colorCount: number;

    @ApiProperty({
        description: 'Cotizaciones',
    })
    negotiations: NegotiationDto[];

    /**
     *
     */
    constructor(purchaseStyle: PurchaseStyle, styleData: any, ecommerce: boolean, negotiations: PurchaseStyleNegotiation[]) {
        this.purchaseStyleId = purchaseStyle.id;
        this.status = purchaseStyle.status.name;

        this.purchaseId = purchaseStyle.purchaseStore.purchase.id;
        this.styleId = purchaseStyle.styleId;
        this.seasonName = purchaseStyle.purchaseStore.purchase.seasonCommercial.name;
        // TODO from style data
        this.code = styleData?.code;

        this.brandName = styleData?.brand;
        this.brandId = styleData?.brandId;
        this.profileName = styleData?.profileJdaCode;
        this.departmentName = styleData?.department;
        this.departmentId = styleData?.departmentId;
        this.subDepartmentName = styleData?.subDepartment;
        this.subDepartmentId = styleData?.subDepartmentId;

        this.className = styleData?.className;
        this.classId = styleData?.classTypeId;

        this.tripDate = purchaseStyle.purchaseStore.purchase.tripDate;
        if (purchaseStyle.details && purchaseStyle.details.length > 0) {
            const details = purchaseStyle.details[0];
            this.purchaseStyleDetailsId = details.id;
            this.composition = details.composition;
            this.fabricWeaving = details.fabricWeaving;
            this.fabricWight = details.fabricWight;
            this.fabricConstruction = details.fabricConstruction;
            this.gauge = details.gauge;
            this.fob = details.fob;
            this.hanger = details.hanger;
            this.vstTag = details.vstTag;
            this.referencialProvider = details.referencialProvider;
            this.price = details.price;
            this.sato = details.sato;
            this.imu = details.imu;
            this.packingMethod = details.packingMethod?.name;
            this.category = details.category?.name;
        }

        this.totalUnits = purchaseStyle.getTotalUnits();
        this.ecommerce = ecommerce;
        this.colorCount = purchaseStyle.colors.length;
        this.negotiations = negotiations.filter(n => n.styleId === this.styleId).map(n => new NegotiationDto(n));

    }
}
