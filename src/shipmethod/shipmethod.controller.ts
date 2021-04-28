import {
  Controller,
  Logger,
  Get,
  Put,
  ValidationPipe,
  UsePipes,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { ShipmethodService } from './service/shipmethod.service';
import { ShipmethodDto } from './dtos/shipmethod.dto';
import { ShipmethodEditDto } from './dtos/shipmethod-edit.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { Query } from '@nestjs/common';
import { FindShipMethodDto } from './dtos/finShipMethod.dto';
import { ShipMethodOrderBy } from './dtos/shipMethodOrderBy.enum';

@Controller('shipmethod')
@ApiTags('Shipmethod')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ShipmethodController {
  private logger = new Logger('ShipmethodController');

  constructor(private shipmethodService: ShipmethodService) {}

  @Get()
  @ApiOkResponse({
    description: 'Servicio para obtener metodos de envío',
  })
  async get() {
    return await this.shipmethodService.getAll();
  }

  @Get('/filterShipMethod')
  @ApiQuery({
      name: 'orderBy',
      enum: ['Name', 'None'],
      required: false,
  })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiOkResponse({
      description: 'Servicio para obtener temporadas',
  })
  async getFilterShipMethod(
      @Query('page') page: number,
      @Query('size') size: number,
      @Query() filter: FindShipMethodDto,
      @Query('orderBy') orderBy?: ShipMethodOrderBy,
      @Query('order') order?: 'ASC' | 'DESC' | undefined) {
      return await this.shipmethodService.getAllFilterShipMethod(filter, page,
          size,
          orderBy,
          order);
  }

  @Get('filter')
  @ApiOkResponse({
    description: 'Servicio para obtener metodos de envío',
  })
  async getFilter() {
    return await this.shipmethodService.getAllFilter();
  }

  @Get('/:id')
  @ApiBody({type: ShipmethodEditDto})
  @ApiOkResponse({
      description: 'Servicio para obtener una Temporada',
  })
  async getShipMethod(@Param('id') id) {
    return await this.shipmethodService.getShiping(id);
  }

  @Put('edit')
  @ApiBody({ type: ShipmethodEditDto })
  @ApiOkResponse({
      description: 'Servicio para actualizar una Temporada',
  })
  @UsePipes(ValidationPipe)
  async update(@Body() updateDto: ShipmethodEditDto) {
    const response = await this.shipmethodService.editShiping(updateDto);
    return response;
  }

  @Put()
  @ApiBody({ type: ShipmethodDto })
  @ApiOkResponse({
    description: 'Servicio para desactivar metodos de envío',
  })
  @UsePipes(ValidationPipe)
  async updateDisabled(@Body() deleteDto: ShipmethodDto): Promise<any> {
    const response = await this.shipmethodService.updateById(deleteDto);
    return response;
  }
}
