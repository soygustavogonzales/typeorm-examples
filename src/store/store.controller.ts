import { Controller, Logger, Get, UseGuards, Query } from '@nestjs/common';
import { StoreService } from './service/store.service';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('store')
@ApiTags('Store')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class StoreController {
  // Create a logger instance
  private logger = new Logger('StoreController');

  constructor(private storeService: StoreService) {}

  @Get()
  @ApiOkResponse({
    description: 'Servicio para obtener Unidades de Negocio',
  })
  async get(@Query('destinyCountry') destinyCountry: string) {
    return await this.storeService.getAll(destinyCountry || null);
  }
}
