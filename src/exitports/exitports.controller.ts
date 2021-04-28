import { Controller, Logger, Get, Param, Post, UsePipes, ValidationPipe, Body, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { ExitportsService } from './service/exitports.service';
import { ExitPortsDto } from './dtos/exitports.dto';
import { ExitPortsEditDto } from './dtos/exitports-edit.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FindExitPortsDto } from './dtos/findExitPorts.dto';
import { ExitPortsOrderBy } from './dtos/exitPortsOrderBy.enum.dto';

@Controller('exitports')
@ApiTags('ExitPorts')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ExitportsController {
  private logger = new Logger('CsoController');

  constructor(private exitPortsService: ExitportsService) {
  }

  @Get()
  @ApiOkResponse({
      description: 'Servicio para obtener ExitPorts',
  })
  async get() {
    return await this.exitPortsService.getAll();
  }

  @Get('/filterExitPorts')
    @ApiQuery({
        name: 'orderBy',
        enum: ['Name', 'None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener Categorias',
    })
    async getFilterExitPorts(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindExitPortsDto,
        @Query('orderBy') orderBy?: ExitPortsOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.exitPortsService.getAllFilterExitPort(filter, page,
            size,
            orderBy,
            order);
    }


  @Get('filter')
  @ApiOkResponse({
    description: 'Servicio para obtener obtener ExitPorts',
  })
  async getFilter() {
    return await this.exitPortsService.getAllFilter();
  }

  @Get('/:id')
  @ApiBody({type: ExitPortsEditDto})
  @ApiOkResponse({
      description: 'Servicio para obtener una Temporada',
  })
  async getShipMethod(@Param('id') id) {
    return await this.exitPortsService.getExitPort(id);
  }

  @Put('edit')
  @ApiBody({ type: ExitPortsEditDto })
  @ApiOkResponse({
      description: 'Servicio para actualizar una Temporada',
  })
  @UsePipes(ValidationPipe)
  async update(@Body() updateDto: ExitPortsEditDto) {
    const response = await this.exitPortsService.editExitPort(updateDto);
    return response;
  }

  @Put()
  @ApiBody({ type: ExitPortsDto })
  @ApiOkResponse({
    description: 'Servicio para desactivar metodos de envío',
  })
  @UsePipes(ValidationPipe)
  async updateDisabled(@Body() deleteDto: ExitPortsDto): Promise<any> {
    const response = await this.exitPortsService.updateById(deleteDto);
    return response;
  }

}
