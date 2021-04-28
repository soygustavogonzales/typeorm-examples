import { Controller, Get, UseGuards } from '@nestjs/common';
import { PaymentTermsService } from './service/payment-terms/payment-terms.service';
import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('payment-terms')
@ApiTags('PaymentTerms')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class PaymentTermsController {
  constructor(private paymentTermService: PaymentTermsService) {}

  @Get()
  @ApiOkResponse({
      description: 'Servicio para obtener Terminos de pagos',
  })
  async get() {
    return await this.paymentTermService.getAll();
  }
}
