import { ApiProperty } from "@nestjs/swagger";

export class SavePurchaseStyleDetailDto {

    @ApiProperty({
        description: 'Id de styleDetail',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Id de purchaseStyle',
        example: 1,
    })
    purchaseStyleId: number;

    @ApiProperty({
        description: 'Id de origen',
        example: 1,
    })
    origin: number;

    @ApiProperty({
        description: 'atc',
        example: true,
    })
    atc: boolean;

    @ApiProperty({
        description: 'Id de size',
        example: 1,
    })
    size: number;

    @ApiProperty({
        description: 'Id de ratio',
        example: 1,
    })
    ratio: number;

    @ApiProperty({
        description: 'Id de shippingMethod',
        example: 1,
    })
    shippingMethod: number;

    @ApiProperty({
        description: 'Id de packingMethod',
        example: 1,
    })
    packingMethod: number;

    @ApiProperty({
        description: 'hanger',
        example: true,
    })
    hanger: boolean;

    @ApiProperty({
        description: 'vstTag',
        example: true,
    })
    vstTag: boolean;

    @ApiProperty({
        description: 'Id de sticker',
        example: 1,
    })
    seasonSticker: number;

    @ApiProperty({
        description: 'Composición',
        example: '',
    })
    composition: string;

    @ApiProperty({
        description: 'Tejido de fabrica',
        example: '',
    })
    fabricWeaving: string;

    @ApiProperty({
        description: 'Construccion de fabrica',
        example: '',
    })
    fabricConstruction: string;

    @ApiProperty({
        description: 'Peso de fabrica',
        example: '',
    })
    fabricWight: string;

    @ApiProperty({
        description: 'Galga',
        example: '',
    })
    gauge: string;

    @ApiProperty({
        description: 'Id de RSE',
        example: 1,
    })
    rse: number;

    @ApiProperty({
        description: 'Accesorio adicional',
        example: 'colgador',
    })
    additionalAccesory: string;

    @ApiProperty({
        description: 'Id de CSO',
        example: 1,
    })
    cso: number;

    @ApiProperty({
        description: 'Id de category',
        example: 1,
    })
    category: number;

    @ApiProperty({
        description: 'Merchant',
        example: '',
    })
    merchandiser: string;

    @ApiProperty({
        description: 'BrandManager',
        example: '',
    })
    brandManager: string;

    @ApiProperty({
        description: 'Diseñador',
        example: '',
    })
    designer: string;

    @ApiProperty({
        description: 'ProductManager',
        example: '',
    })
    productManager: string;

    @ApiProperty({
        description: 'Negociador',
        example: '',
    })
    negotiatior: string;

    @ApiProperty({
        description: 'TechFile',
        example: true,
    })
    techFile: boolean;

    @ApiProperty({
        description: 'SizeSpec',
        example: true,
    })
    sizeSpec: boolean;

    @ApiProperty({
        description: 'ID de proveedor',
        example: 1,
    })
    provider: number;

    @ApiProperty({
        description: 'Proveedor referencial',
        example: '',
    })
    referencialProvider: string;

    @ApiProperty({
        description: 'ID exitPort',
        example: 1,
    })
    exitPort: number;

    @ApiProperty({
        description: 'Descripción de internet',
        example: '',
    })
    internetDescription: string;

    @ApiProperty({
        description: 'Colección',
        example: '',
    })
    collection: string;

    @ApiProperty({
        description: 'Evento',
        example: '',
    })
    event: string;

    @ApiProperty({
        description: 'ID segmento',
        example: 1,
    })
    segment: number;

    @ApiProperty({
        description: 'FOB',
        example: 1,
    })
    fob: number;

    @ApiProperty({
        description: 'FOB Referencual',
        example: 1,
    })
    fobReferencial: number;

    @ApiProperty({
        description: 'Precio',
        example: 1990,
    })
    price: number;

    @ApiProperty({
        description: 'Sato',
        example: 1,
    })
    sato: number;

}
