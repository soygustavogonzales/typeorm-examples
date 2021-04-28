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
import { PackagingService } from './service/packaging.service';
import { PackagingDto } from './dtos/packaging.dto';
import { PackagingEditDto } from './dtos/packaging-edit.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { Query } from '@nestjs/common';
import { FindPackagingDto } from './dtos/fingPackaging.dto';
import { PackagingOrderBy } from './dtos/packagingOrderBy.enum.dto';

@Controller('packaging')
@ApiTags('Packaging')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class PackagingController {
  // Create a logger instance
  private logger = new Logger('PackagingController');

  constructor(private packagingService: PackagingService) {}

  @Get()
  @ApiOkResponse({
    description: 'Servicio para obtener Packaging methods',
  })
  async get() {
    return await this.packagingService.getAll();
  }

  @Get('/filterPackaging')
  @ApiQuery({
      name: 'orderBy',
      enum: ['Name', 'None'],
      required: false,
  })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiOkResponse({
      description: 'Servicio para obtener packaging',
  })
  async getFilterSeasonCommercial(
      @Query('page') page: number,
      @Query('size') size: number,
      @Query() filter: FindPackagingDto,
      @Query('orderBy') orderBy?: PackagingOrderBy,
      @Query('order') order?: 'ASC' | 'DESC' | undefined) {
      return await this.packagingService.getAllFilterPackaging(filter, page,
          size,
          orderBy,
          order);
  }

  @Get('filter')
  @ApiOkResponse({
    description: 'Servicio para obtener Packaging methods',
  })
  async getFilter() {
    return await this.packagingService.getAllFilter();
  }

  @Get('/:id')
  @ApiBody({type: PackagingEditDto})
  @ApiOkResponse({
      description: 'Servicio para obtener una Packaging methods',
  })
  async getPackaging(@Param('id') id) {
    return await this.packagingService.getPackaging(id);
  }

  @Put('edit')
  @ApiBody({ type: PackagingEditDto })
  @ApiOkResponse({
      description: 'Servicio para actualizar una Packaging methods',
  })
  @UsePipes(ValidationPipe)
  async update(@Body() updateDto: PackagingEditDto) {
    const response = await this.packagingService.editPackaging(updateDto);
    return response;
  }

  @Put()
  @ApiBody({ type: PackagingDto })
  @ApiOkResponse({
    description: 'Servicio para desactivar un Packaging methods',
  })
  @UsePipes(ValidationPipe)
  async updateDisabled(@Body() deleteDto: PackagingDto): Promise<any> {
    const response = await this.packagingService.updateById(deleteDto);
    return response;
  }
}
