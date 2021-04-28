import { Controller, Logger, Post, UsePipes, ValidationPipe, Body, Put, Param, Get, BadRequestException, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOkResponse, ApiParam, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PurchaseService } from './service/purchase.service';
import { CreatePurchaseDto } from './dtos/createPurchase.dto';
import { StatusPurchaseDto } from './dtos/statusPurchase.dto';
import { CreatePurchaseStyleDto } from './dtos/createPurchaseStyle.dto';
import { PurchaseDto } from './dtos/purchase.dto';
import { AssociateStylesResponseDto } from './dtos/associateStylesResponse.dto';
import { UpdatePurchaseColorDto } from './dtos/updatePurchaseColor.dto';
import { ResponseApi } from './dtos/responseApi.entity';
import { GetShippingUnitsPurchaseColor } from './dtos/getShippingUnitsPurchaseColor.dto';
import { ColorShippingUnits } from './dtos/colorShippingUnits.dto';
import { SaveStyleDetailDto } from './dtos/saveStyleDetails.dto';
import { StoreSummaryDto } from './dtos/storeSummary.dto';
import { FilterApprovalDto } from './dtos/filterApproval.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FilterNegotiationDto } from './dtos/filterNegotiation.dto';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { UserDecode } from '../shared/dtos/userDecode.entity';
import { FilterStyleModDto } from '../purchase-style/dtos/filterStyleMod.dto';
import { SaveQuotationSelectionDataDto } from './dtos/saveQuotationSelectionData.dto';
import { generateArrivalDatesDto } from './dtos/generateArrivalDates.dto';
import { ExportPurchaseStep3Dto } from './dtos/exportPurchaseStep3.dto';
import { ColorShippingDto } from './dtos/colorShipping.dto';

@Controller('purchase')
@ApiTags('Purchase')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class PurchaseController {
    // Create a logger instance
    private logger = new Logger('PurchaseController');

    constructor(private purchaseService: PurchaseService) {
    }

    @Post()
    @ApiBody({ type: CreatePurchaseDto })
    @ApiOkResponse({
        description: 'Servicio para crear Compras',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() purchaseDto: CreatePurchaseDto): Promise<PurchaseDto> {
        const response = await this.purchaseService.create(purchaseDto);
        // this.logger.log('Compra creada ' + response);
        return response;
    }

    @Put()
    @ApiBody({ type: StatusPurchaseDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar status Compras',
    })
    @UsePipes(ValidationPipe)
    async putStatus(@Body() statusPurchaseDto: StatusPurchaseDto) {
        const response = await this.purchaseService.updateStatus(statusPurchaseDto);
        this.logger.log('Estado Compra actualizado' + response);
        return response;
    }

    @Put('styles/:purchaseId')
    @ApiBody({ type: CreatePurchaseStyleDto, isArray: true })
    @ApiParam({ name: 'purchaseId', type: String })
    @ApiOkResponse({
        description: 'Servicio para asociar estilos y estilos color a una Compra',
    })
    @UsePipes(ValidationPipe)
    async putStyles(@Body() stylesDtos: CreatePurchaseStyleDto[], @Param('purchaseId') purchaseId): Promise<AssociateStylesResponseDto[]> {
        const response = await this.purchaseService.associateStyles(stylesDtos, purchaseId);
        return response;
    }

    @Put('colors/stores/:purchaseId')
    @ApiBody({ type: UpdatePurchaseColorDto, isArray: true })
    @ApiParam({ name: 'purchaseId', type: String })
    @ApiOkResponse({
        description: 'Servicio para actualizar colores para sus destinos',
    })
    @UsePipes(ValidationPipe)
    async putColorsStores(@Body() stylesColorDtos: UpdatePurchaseColorDto[], @Param('purchaseId') purchaseId): Promise<PurchaseDto> {
        const purchaseIdParse = parseInt(purchaseId, null);
        const response = await this.purchaseService.updateColorsStore(stylesColorDtos, purchaseIdParse);
        return response;
    }

    @Get('trip-dates')
    @ApiOkResponse({
        description: 'Servicio para fechas de viaje de las Compras',
    })
    async getTripDates() {
        return await this.purchaseService.getTripDates();
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Compras',
    })
    async getAll() {
        return await this.purchaseService.getAll();
    }

    @Post('notify')
    @ApiOkResponse({
        description: 'Servicio para obtener Compras',
    })
    async notify(@Body() dtos: any[], @GetUser() user) {
        return await this.purchaseService.notifyOnDemand(dtos, user);
    }

    @Post('notify-by-filter')
    @ApiOkResponse({
        description: 'Servicio para notificar stylemod por filtro',
    })
    @ApiBody({ type: FilterStyleModDto })
    async postNotifyStyleModByFilter(@Body() dto: FilterStyleModDto, @GetUser() user) {
        //console.log('dto >> ',dto);
        return await this.purchaseService.postNotifyStyleModByFilter(dto, user);
    }

    @Post('by-filter-negotiation')
    @ApiBody({ type: FilterNegotiationDto })
    @ApiOkResponse({
        description: 'Servicio para obtener Compras para negociar',
    })
    async getByFilterNegotiation(@Body() dto: FilterNegotiationDto, @GetUser() user) {
        return await this.purchaseService.getAllByFilterNegotiation(dto, user);
    }

    @Get('owners')
    @ApiOkResponse({
        description: 'Servicio para obtener los usuarios dueños de compras',
    })
    async getPurchaseOwners() {
        return await this.purchaseService.getPurchaseOwners();
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: String })
    @ApiOkResponse({
        description: 'Servicio para obtener una Compra',
    })
    async getById(@Param('id') id): Promise<ResponseApi<PurchaseDto>> {
        const purchaseIdParse = parseInt(id, null);
        const response = await this.purchaseService.get(purchaseIdParse);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Compra no encontrada');
        }
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: String })
    @ApiOkResponse({
        description: 'Servicio para eliminar una Compra',
    })
    async deleteById(@Param('id') id): Promise<ResponseApi<boolean>> {
        const purchaseIdParse = parseInt(id, null);
        const response = await this.purchaseService.delete(purchaseIdParse);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Compra no encontrada');
        }
    }

    @Get('summary/:id')
    @ApiParam({ name: 'id', type: String })
    @ApiOkResponse({
        description: 'Servicio para obtener una Compra',
    })
    async getSummaryById(@Param('id') id): Promise<ResponseApi<StoreSummaryDto[]>> {
        const purchaseIdParse = parseInt(id, null);
        const response = await this.purchaseService.getSummary(purchaseIdParse);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Compra no encontrada / Datos de estilos no encontrados / Factores de importación no encontrados / Cambio de dollar no econtrado ');
        }
    }

    @Post('summary-approved/')
    @ApiBody({ type: FilterApprovalDto })
    @ApiOkResponse({
        description: 'Servicio para obtener resument de varias compras para aprobacion',
    })
    async getSummaryApprovalByFilter(@Body() dto: FilterApprovalDto): Promise<ResponseApi<StoreSummaryDto[]>> {
        const response = await this.purchaseService.getApprovalSummary(dto);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Compra no encontrada / Datos de estilos no encontrados');
        }
    }

    @Post('approve')
    @ApiBody({ type: FilterApprovalDto })
    @ApiOkResponse({
        description: 'Servicio para aprobar varios estilos compra por filtro',
    })
    async approveByFilter(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<ResponseApi<any>> {
        const response = await this.purchaseService.markAsApproveByFilter(dto, user);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Compra no encontrada / Datos de estilos no encontrados / Los datos FOB y PRECIO deben estar completados y distintos de 0')
        }
    }

    @Post('/shippings-units')
    @ApiBody({ type: GetShippingUnitsPurchaseColor })
    @ApiOkResponse({
        description: 'Servicio para obtener unidades de entrega para una Compra',
    })
    async getShippingUnits(@Body() dto: GetShippingUnitsPurchaseColor) {
        const { purchaseColorsStyleIds, divisionId, seasonCommercialId } = dto;
        const response = await this.purchaseService.getShippingsUnits(purchaseColorsStyleIds, divisionId, seasonCommercialId);
        return { status: 200, data: response };
    }

    @Post('/save-shippings-units')
    @ApiBody({ type: ColorShippingUnits, isArray: true })
    @ApiOkResponse({
        description: 'Servicio para guardar unidades de entrega para una Compra',
    })
    async postShippingUnits(@Body() dto: ColorShippingUnits[]) {
        const response = await this.purchaseService.updateShippingsUnits(dto);
        await this.purchaseService.adjustUTUnits(dto.map(s => s.purchaseColorStoreId));
        const body: generateArrivalDatesDto = {
            purchaseStyleColorIds: dto.map(item => item.purchaseColorStoreId)
        }
        this.purchaseService.updateArrivalDates(body);
        return { status: 200, data: response };
    }

    @Post('/save-shipping-units')
    @ApiBody({ type: ColorShippingUnits, isArray: true })
    @ApiOkResponse({
        description: 'Servicio para guardar unidades de entrega para una Compra',
    })
    async saveShippingUnits(@Body() dto: ColorShippingDto[]) {
        const response = await this.purchaseService.saveShippingUnits(dto);
        this.purchaseService.adjustUTUnits(dto.map(s => s.purchaseStyleColorId));
        const body: generateArrivalDatesDto = {
            purchaseStyleColorIds: dto.map(s => s.purchaseStyleColorId)
        }
        this.purchaseService.updateArrivalDates(body);
        return { status: 200, data: response };
    }

    @Post('/save-styles-details')
    @ApiBody({ type: SaveStyleDetailDto })
    @ApiOkResponse({
        description: 'Servicio para guardar los detalles de los estilos para una compra',
    })
    async postStylesDetails(@Body() dto: SaveStyleDetailDto, @GetUser() user) {
        const response = await this.purchaseService.saveStylesDetails(dto, user);
        return { status: 200, data: { detailsType: dto.detailsType, styles: response } };
    }

    @Post('/save-quotation-selection-data')
    @ApiBody({ type: SaveStyleDetailDto })
    @ApiOkResponse({
        description: 'Servicio para guardar información de cotización seleccionada',
    })
    async saveQuotationSelectionData(@Body() dto: SaveQuotationSelectionDataDto, @GetUser() user) {
        const response = await this.purchaseService.saveQuotationSelectionData(dto, user);
        return { status: 200, data: response };
    }

    @Post('/get-styles-details')
    @ApiBody({ isArray: true })
    @ApiOkResponse({
        description: 'Servicio para obtener los detalles de los estilos para una compra',
    })
    async getStylesDetails(@Body() dto: number[]) {
        const response = await this.purchaseService.getStylesDetails(dto);
        return { status: 200, data: response };
    }

    @Post('/check-approved-styles-colors')
    @ApiOkResponse({
        description: 'Servicio para checkear si están aprobados los estilos color',
    })
    @ApiBody({ isArray: true, type: 'number' })
    async checkApprovedStylesColors(@Body() dto: number[]): Promise<ResponseApi<number[]>> {
        const response = await this.purchaseService.checkApprovedStylesColors(dto);
        return { status: 200, data: response };
    }

    @Get('confirm-negotiation/:purchaseId')
    @ApiParam({ name: 'purchaseId', type: String })
    @ApiOkResponse({
        description: 'Servicio para obtener información de una compra para aprobar su negociación',
    })
    async getPurchaseConfirmNegotiation(@Param('purchaseId') purchaseId: string) {
        if (isNaN(parseInt(purchaseId, 10))) {
            throw new BadRequestException('ID de compra no válido');
        }
        const response = await this.purchaseService.getPurchaseConfirmNegotiation(parseInt(purchaseId, 10));
        return { status: 200, data: response };
    }

    @Post('revert-status/:purchaseId')
    @ApiParam({ name: 'purchaseId', type: String })
    @ApiOkResponse({
        description: 'Servicio para revertir el status de una compra',
    })
    async revertStatus(@Param('purchaseId') purchaseId: string, @GetUser() user) {
        if (isNaN(parseInt(purchaseId, 10))) {
            throw new BadRequestException('ID de compra no válido');
        }
        const response = await this.purchaseService.revertStatus(parseInt(purchaseId, 10), user);
        return { status: 200, data: response };
    }

    @Post('arrivalDates')
    @ApiOkResponse({
        description: 'Servicio para actualizar las fechas de llegada de las entregas',
    })
    async generateArrivalDates(@Body() body: generateArrivalDatesDto) {
        const response = await this.purchaseService.updateArrivalDates(body);
        return { status: 200, data: response };
    }

    @Post('subtitutionDates')
    @ApiOkResponse({
        description: 'Servicio para subtituir las fechas de Paris Ecom con las de Paris',
    })
    async subtitutionDates() {
        const response = await this.purchaseService.subtitutionDatesPurchaseStyleColorShippings();
        return { status: 200, data: response }
    }

    @Post('export-purchase-step-three')
    @ApiOkResponse({
        description: 'Servicio para exportar los datos del paso 3 de una compra',
    })
    async exportPurchaseStepFive(@Body() body: ExportPurchaseStep3Dto) {
        const response = await this.purchaseService.exportStepThree(body);
        return {status: 200, data: response};
    }
    
    @Post('purchase-orders-list')
    @ApiOkResponse({
        description: 'Servicio para obtener listado de ordenes de compra',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getPurchaseOrdersList(@Body() dto: FilterApprovalDto): Promise<any> {
        const response = await this.purchaseService.getPurchaseOrdersList(dto);
        return {status: 200, data: response};
    }

    @Post('purchase-list')
    @ApiOkResponse({
        description: 'Servicio para obtener un listado de compras filtrado',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getFilteredPurchaseList(@Body() dto: FilterApprovalDto): Promise<any> {
        const response = await this.purchaseService.getFilteredPurchaseList(dto);
        return {status: 200, data: response};
    }
    
    @Post('export-purchase-step-four')
    @ApiOkResponse({
        description: 'Servicio para exportar los datos del paso 4 (Detalles comerciales) de una compra',
    })
    async exportPurchaseStepFour(@Body() body: ExportPurchaseStep3Dto) {
        const response = await this.purchaseService.exportStepFour(body);
        return {status: 200, data: response};
    }
}
