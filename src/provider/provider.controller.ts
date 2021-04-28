import { Controller, Logger, Get, UseGuards, Param, Put, UsePipes, ValidationPipe, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiSecurity, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProviderService } from './service/provider.service';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { ProviderDto } from './dtos/provider.dto';
import { ProviderUpdateDto } from './dtos/providerUpdate.dto';
import { FindProviderDto } from './dtos/findProvider.dto';
import { ProviderOrderBy } from './dtos/providerOrderBy.enum';
@Controller('provider')
@ApiTags('Provider')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ProviderController {
    // Create a logger instance
    private logger = new Logger('ProviderController');

    constructor(private providerService: ProviderService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Proveedores',
    })
    async get() {
        return await this.providerService.getAll();
    }

    @Get('filter')
    @ApiQuery({
        name: 'orderBy',
        enum: ['codeJda', 'Name','PaymentTerm1','PaymentTerm2','None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener Proveedores',
    })
    async getFilter(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindProviderDto,
        @Query('orderBy') orderBy?: ProviderOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.providerService.getAllFilter(filter, page,
            size,
            orderBy,
            order);
    }

    @Get('/:id')
    @ApiBody({type: ProviderDto})
    @ApiOkResponse({
        description: 'Servicio para obtener un proveedor',
    })
    async getCategory(@Param('id') id) {
        return await this.providerService.getProvider(id);
    }

    @Put('upload')
    @ApiBody({ type: ProviderUpdateDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar un proveedor',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: ProviderUpdateDto) {
        const response = await this.providerService.updateProvider(updateDto);
        return response;
    }

    @Put()
    @ApiBody({ type: ProviderUpdateDto })
    @ApiOkResponse({
      description: 'Servicio para desactivar proveedores',
    })
    @UsePipes(ValidationPipe)
    async updateDisabled(@Body() deleteDto: ProviderUpdateDto): Promise<any> {
      const response = await this.providerService.updateById(deleteDto);
      return response;
    }
}
