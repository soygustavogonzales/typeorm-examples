import { Controller, Logger, Get, Post, Body, UsePipes, ValidationPipe, Delete, Patch, Query, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ShippingDatesService } from './service/shipping-dates.service';
import { ShippingDates } from '../entities/shippingDates.entity';
import { DeleteShippingDateDto } from './dto/deleteShippingDate.dto';
import { UpdateShippingDateDto } from './dto/updateShippingDate.dto';
import { FilterDto } from './dto/filter.dto';
import { CreateBulkShippingDateDto } from './dto/createBulkShippingDate.dto';
import { ChildFilterDto } from './dto/childFilter.dto';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';
import { ChildUpdateDto } from './dto/childUpdate.dto';
import { ChildDeleteDto } from './dto/childDelete.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('shipping-dates')
@ApiTags('Shipping-dates')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ShippingDatesController {
    // Create a logger instance
    private logger = new Logger('ShippingDatesController');

    constructor(private shippingDatesService: ShippingDatesService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Shipping dates',
    })
    async get() {
        return await this.shippingDatesService.getAll();
    }

    @Post()
    @ApiBody({ type: ShippingDates })
    @ApiOkResponse({
        description: 'Servicio para crear Shipping Date',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() shipDateDto: ShippingDates): Promise<ShippingDates> {
        const response = await this.shippingDatesService.create(shipDateDto);
        return response;
    }

    @Post('bulk')
    @ApiBody({ type: ShippingDates })
    @ApiOkResponse({
        description: 'Servicio para crear Shipping Date masivo para una division, país (CN), temporada',
    })
    @UsePipes(ValidationPipe)
    async postBulk(@Body() shipDateDto: CreateBulkShippingDateDto): Promise<ShippingDates[]> {
        const response = await this.shippingDatesService.createBulk(shipDateDto);
        return response;
    }

    @Put('bulk')
    @ApiBody({ type: ShippingDates })
    @ApiOkResponse({
        description: 'Servicio para actualizar Shipping Date masivo para una division, país (CN), temporada',
    })
    @UsePipes(ValidationPipe)
    async putBulk(@Body() shipDateDto: CreateBulkShippingDateDto): Promise<ShippingDates[]> {
        const response = await this.shippingDatesService.updateBulk(shipDateDto);
        return response;
    }

    @Delete()
    @ApiBody({ type: DeleteShippingDateDto })
    @ApiOkResponse({
        description: 'Servicio para eliminar un Shipping Date',
    })
    @UsePipes(ValidationPipe)
    async delete(@Body() deleteDto: DeleteShippingDateDto): Promise<any> {
        return await this.shippingDatesService.deleteById(deleteDto);
    }

    @Delete('bulk')
    @ApiOkResponse({
        description: 'Servicio para eliminar Shipping Date masivo para una division, temporada',
    })
    @UsePipes(ValidationPipe)
    async deleteBulk(@Query() filter: FilterDto): Promise<any> {
        return await this.shippingDatesService.deleteByDivisionIdSeasonId(filter);
    }

    @Patch()
    @ApiBody({ type: UpdateShippingDateDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar un Shipping Date',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: UpdateShippingDateDto): Promise<number> {
        return await this.shippingDatesService.update(updateDto);
    }

    @Get('by-season')
    @ApiOkResponse({
        description: 'Servicio para obtener Shipping dates Por Temporada',
    })
    async getBySeason(@Query() filter: FilterDto) {
        const response = await this.shippingDatesService.getBySeason(filter);
        return response;
    }

    @Get('by-filter')
    @ApiOkResponse({
        description: 'Servicio para obtener Shipping dates Por Division y Temporada',
    })
    async getByFilter(@Query() filter: FilterDto) {
        const response = await this.shippingDatesService.getByFilter(filter);
        return response;
    }

    // Child country dates

    @Get('child-country')
    @ApiOkResponse({
        description: 'Servicio para obtener Shipping Dates hijos',
    })
    async getChildByFilter(@Query() filter: ChildFilterDto): Promise<ShippingDatesChild[]> {
        return await this.shippingDatesService.getChildByFilter(filter);
    }

    @Get('child-country-dates')
    @ApiOkResponse({
        description: 'Servicio para obtener fechas calculadas de Shipping Dates hijos',
    })
    async getChildDatesByFilter(@Query() filter: ChildFilterDto): Promise<ShippingDates[]> {
        return await this.shippingDatesService.getChildDatesByFilter(filter);
    }

    @Post('child-country')
    @ApiBody({ type: ShippingDatesChild })
    @ApiOkResponse({
        description: 'Servicio para crear un Shipping Date hijo',
    })
    @UsePipes(ValidationPipe)
    async createChild(@Body() childDate: ShippingDatesChild): Promise<ShippingDatesChild> {
        return await this.shippingDatesService.createChild(childDate);
    }

    @Put('child-country')
    @ApiBody({ type: ChildUpdateDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar un Shipping Date hijo',
    })
    @UsePipes(ValidationPipe)
    async updateChild(@Body() childDate: ChildUpdateDto): Promise<number> {
        return await this.shippingDatesService.updateChild(childDate);
    }

    @Delete('child-country')
    @ApiBody({ type: ChildDeleteDto })
    @ApiOkResponse({
        description: 'Servicio para eliminar un Shipping Date hijo',
    })
    @UsePipes(ValidationPipe)
    async deleteChild(@Query() childDate: ChildDeleteDto): Promise<any> {
        return await this.shippingDatesService.deleteChild(childDate);
    }
}
