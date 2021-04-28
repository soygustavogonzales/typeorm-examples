import { ApiProperty } from '@nestjs/swagger';
import { NegotiationDto } from './negotiation.dto';

export class CreateNegotiationDto {
    @ApiProperty({
        description: 'Id del estilo',
    })
    styleId: number;

    @ApiProperty({
        description: 'Id de la compra',
    })
    purchaseId: number;

    @ApiProperty({
        description: 'Cotizaciones',
    })
    negotiations: NegotiationDto[];

    @ApiProperty({
        description: 'Id de usuario de merchant',
    })
    userMerchantId: number;
}
