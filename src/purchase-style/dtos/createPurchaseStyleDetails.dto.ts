import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';

export class CreatePurchaseStyleDetailsDto {



    @ApiProperty({
        description: 'Atc',
        example: '',
    })
    atc: boolean;

    @ApiProperty({
        description: 'Fob',
        example: '',
    })
    fob: number;

    @ApiProperty({
        description: 'Fob Referencial',
        example: '',
    })
    fobReferencial: number;

    @ApiProperty({
        description: 'Precio',
        example: '',
    })
    price: number;

    @ApiProperty({
        description: 'Colgador',
        example: '',
    })
    hanger: boolean;

    @ApiProperty({
        description: 'VstTag',
        example: '',
    })
    vstTag: boolean;

    @ApiProperty({
        description: 'Merchandiser',
        example: '',
    })
    merchandiser: string;
    
    @ApiProperty({
        description: 'Product Manager',
        example: '',
    })
    productManager: string;
  
    @ApiProperty({
        description: 'Brand Manager',
        example: '',
    })
    brandManager: string;

    @ApiProperty({
        description: 'TechFile',
        example: '',
    })
    techFile: boolean;

    @ApiProperty({
        description: 'Size Spec',
        example: '',
    })
    sizeSpec: boolean;

    @ApiProperty({
        description: 'Descripcion de Internet',
        example: '',
    })
     internetDescription: string;

    @ApiProperty({
        description: 'Product Manager',
        example: '',
    })
    @IsNotEmpty()
    productManagerId: number;

    @ApiProperty({
        description: 'Brand Manager',
        example: '',
    })
    @IsNotEmpty()
    brandManagerId: number;


    @ApiProperty({
        description: 'Perfil',
        example: '',
    })
    @IsNotEmpty()
    profileId: number;

    @ApiProperty({
        description: 'Proveedor',
        example: '',
    })
    @IsNotEmpty()
    providerId: number;

    @ApiProperty({
        description: 'Cso',
        example: '',
    })
    @IsNotEmpty()
    csoId: number;

    @ApiProperty({
        description: 'Pais de Origen',
        example: '',
    })
    @IsNotEmpty()
    originId: number;

    @ApiProperty({
        description: 'Metodo de Empaque',
        example: '',
    })
    @IsNotEmpty()
    packingMethodId: number;

    @ApiProperty({
        description: 'Categoria',
        example: '',
    })
    @IsNotEmpty()
    categoryId: number;

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
        description: 'Target',
        example: '',
    })
    target: number;

    @ApiProperty({
        description: 'Sato',
        example: '',
    })
    sato: number;

    @ApiProperty({
        description: 'Proveedor Referencial',
        example: '',
    })
    referencialProviderId: string;

    @ApiProperty({
        description: 'Accesorio Adicional',
        example: '',
    })
    additionalAccesory: string;

    @ApiProperty({
        description: 'Puerto de Salida',
        example: '',
    })
    exitPortId: number;

    @ApiProperty({
        description: 'Segmentacion Referencial',
        example: '',
    })
    segmentId: number;

    @ApiProperty({
        description: 'Composicion',
        example: '',
    })
    composition: string;

    @ApiProperty({
        description: 'Peso de fabrica',
        example: '',
    })
    fabricWight: string;

    @ApiProperty({
        description: 'Construcción de tela',
        example: '',
    })
    fabricConstruction: string;

    @ApiProperty({
        description: 'Tejido de tela',
        example: '',
    })
    fabricWeaving: string;

    @ApiProperty({
        description: 'Id Rse',
        example: '',
    })
    rseId: number;

    @ApiProperty({
        description: 'Gauge',
        example: '',
    })
    gauge: string;

    toEntity(purchaseStyleId): PurchaseStyleDetails {
        const purchaseStyle = new PurchaseStyleDetails();
        purchaseStyle.purchaseStyleId = purchaseStyleId;
        purchaseStyle.internetDescription = this.internetDescription;
        purchaseStyle.gauge = this.gauge;
        purchaseStyle.merchandiser = this.merchandiser;
        // purchaseStyle.originId = this.originId;
        purchaseStyle.packingMethodId = this.packingMethodId;
        purchaseStyle.price = this.price;
        // purchaseStyle.profileId = this.profileId;
        // purchaseStyle.providerId = this.providerId;
        // purchaseStyle.referencialProviderId = this.referencialProviderId;
        // purchaseStyle.referencialSegmentationId = this.referentialSegmentationId;
        purchaseStyle.rseId = this.rseId;
        purchaseStyle.sizeSpec = this.sizeSpec;
        purchaseStyle.sato = this.sato;
        purchaseStyle.target = this.target;
        purchaseStyle.techFile = this.techFile;
        purchaseStyle.vstTag = this.vstTag;
        return purchaseStyle;
    }


}
