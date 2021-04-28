import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';
import { ProviderDto } from '../../provider/dtos/provider.dto';
import { ExitPortsDto } from '../../exitports/dtos/exitports.dto';

export class NegotiationDto {
    @ApiProperty({
        description: 'Id de negociacion',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Fob',
        example: '',
    })
    fob: number;

    @ApiProperty({
        description: 'Proveedor',
        example: '',
    })
    provider: ProviderDto;

    @ApiProperty({
        description: 'Puerto de Salida',
        example: '',
    })
    exitPort: ExitPortsDto;

    @ApiProperty({
        description: 'Comentarios',
        example: '',
    })
    comments: string;

    @ApiProperty({
        description: 'Seleccionado',
        example: '',
    })
    selected: boolean;

    @ApiProperty({
        description: 'Id de usuario de merchant',
        example: '',
    })
    userMerchantId: number;

    @ApiProperty({
        description: 'Proveedor sugerido',
    })
    suggestedVendor: boolean;

    /*
     *
     */
    constructor(data: PurchaseStyleNegotiation) {
        this.id = data?.id;
        this.fob = data?.fob;
        this.provider = new ProviderDto();
        this.provider.id = data?.provider?.id;
        this.provider.name = data?.provider?.name;
        this.exitPort = new ExitPortsDto();
        this.exitPort.id = data?.exitPort?.id;
        this.exitPort.name = data?.exitPort?.name;
        this.comments = data?.comments;
        this.selected = data?.selected;
        this.userMerchantId = data?.userMerchantId;
        this.suggestedVendor = data?.suggestedVendor;
    }
}
