import { Controller, Logger, Get, Param, Post, UsePipes, ValidationPipe, Body, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CsoService } from './service/cso.service';
import { CsoDto } from './dtos/cso.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FindCsoDto } from './dtos/findCso.dto';
import { CsoOrderBy } from './dtos/csoOrderBy.enum.dto';

@Controller('cso')
@ApiTags('Cso')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class CsoController {
  // Create a logger instance
  private logger = new Logger('CsoController');

  constructor(private csoService: CsoService) {
  }

  @Get()
  @ApiOkResponse({
      description: 'Servicio para obtener CSO',
  })
  async get() {
    return await this.csoService.getAll();
  }

  @Get('/filterCso')
  @ApiQuery({
      name: 'orderBy',
      enum: ['Name', 'None'],
      required: false,
  })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiOkResponse({
      description: 'Servicio para obtener cso',
  })
  async getFilterSeasonCommercial(
      @Query('page') page: number,
      @Query('size') size: number,
      @Query() filter: FindCsoDto,
      @Query('orderBy') orderBy?: CsoOrderBy,
      @Query('order') order?: 'ASC' | 'DESC' | undefined) {
      return await this.csoService.getAllFilterCso(filter, page,
          size,
          orderBy,
          order);
  }

  @Get('/:id')
  @ApiBody({type: CsoDto})
  @ApiOkResponse({
      description: 'Servicio para obtener un CSO',
  })
  async getCso(@Param('id') id) {
      return await this.csoService.getCso(id);
  }

  @Post()
  @ApiBody({type: CsoDto})
  @ApiOkResponse({
      description: 'Servicio para crear CSO',
  })
  @UsePipes(ValidationPipe)
  async post(@Body() createCsoDto: CsoDto) {
      const response = await this.csoService.create(createCsoDto);
      return response;
  }

  @Put('upload')
  @ApiBody({ type: CsoDto })
  @ApiOkResponse({
      description: 'Servicio para actualizar un CSO',
  })
  @UsePipes(ValidationPipe)
  async update(@Body() updateDto: CsoDto) {
      const response = await this.csoService.update(updateDto);
      return response;
  }

  @Put()
  @ApiBody({ type: CsoDto })
  @ApiOkResponse({
      description: 'Servicio para desactivar un CSO',
  })
  @UsePipes(ValidationPipe)
  async updateActive(@Body() deleteDto: CsoDto): Promise<any> {
    const response = await this.csoService.deleteById(deleteDto);
    return response
  }
}
