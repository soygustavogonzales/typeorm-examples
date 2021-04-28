import { Controller, Logger, Post, UsePipes, Body, ValidationPipe, Param, Get, Query, UseGuards, Put } from '@nestjs/common';
import { PurchaseStyleService } from './services/purchase-style.service';
import { ApiBody, ApiOkResponse, ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { FilterStyleModDto } from './dtos/filterStyleMod.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FilterStylesToNegotiationDto } from './dtos/filterStylesToNegotiation.dto';
import { CreateNegotiationDto } from './dtos/createNegotiation.dto';
import { ResponseApi } from '../purchase/dtos/responseApi.entity';
import { FilterPurchaseToExportNegotiationDto } from './dtos/filterPurchaseToExportNegotiation.dto';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { UserDecode } from '../shared/dtos/userDecode.entity';
import { UpdatePurchaseStyleStatusDto } from './dtos/updatePurchaseStyleStatus.dto';
import { GetUserDto } from '../external-services/security-proxy/dtos/getUser.dto';
import { SavePurchaseStyleDetailDto } from './dtos/savePurchaseStyleDetail.dto';

@Controller('purchase-style')
@ApiTags('PurchaseStyle')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class PurchaseStyleController {
    // Create a logger instance
    private logger = new Logger('PurchaseStyleController');
    constructor(private purchaseStyleService: PurchaseStyleService) {
    }

    @Get('styles-codes')
    @ApiOkResponse({
        description: 'Servicio para obtener Codigos de Estilos Compra en proceso',
    })
    async get() {
        return await this.purchaseStyleService.getAllStylesActiveToAdjustList();
    }

    @Post('get-by-filter')
    @ApiOkResponse({
        description: 'Servicio para obtener Estilos Compra por filtro',
    })
    @ApiBody({ type: FilterStyleModDto })
    async postGetStyleModByFilter(@Body() dto: FilterStyleModDto) {
        return await this.purchaseStyleService.getAllStylesActiveToAdjustByFilter(dto);
    }

    @Post('get-to-cotization')
    @ApiOkResponse({
        description: 'Servicio para obtener Estilos Compra por ids de compras y por estado',
    })
    @ApiBody({ type: FilterStylesToNegotiationDto })
    async postGetStylesToNegotiateByFilter(@Body() dto: FilterStylesToNegotiationDto) {
        return await this.purchaseStyleService.getStylesToNegotiateByFilter(dto);
    }

    @Post('negotiation')
    @ApiOkResponse({
        description: 'Servicio para crear negociaciones a un compra',
    })
    @ApiBody({ type: CreateNegotiationDto})
    async postNegotiation(@Body() dto: CreateNegotiationDto) {
        return await this.purchaseStyleService.saveNegotiations(dto);
    }

    @Post('export-negotiation')
    @ApiBody({ type: FilterPurchaseToExportNegotiationDto })
    @ApiOkResponse({
        description: 'Servicio para obtener el excel con los estilos de la negociación',
    })
    async exportNegotiation(@Body() filter: FilterPurchaseToExportNegotiationDto): Promise<ResponseApi<string>> {
        const response = await this.purchaseStyleService.exportNegotiation(filter);
        return {status: 200, data: response};
    }

    @Post('import-negotiation')
    @ApiOkResponse({
        description: 'Servicio para importar negociaciones a una o varias compras',
    })
    @ApiBody({ type: CreateNegotiationDto, isArray: true})
    async importNegotiation(@Body() dto: CreateNegotiationDto[]): Promise<any> {
        await this.purchaseStyleService.importNegotiation(dto);
        return {status: 200};
    }

    @Put('update-status')
    @ApiOkResponse({
        description: 'Servicio para actualizar el estatus de los estilos compras',
    })
    @ApiBody({ type: UpdatePurchaseStyleStatusDto})
    async updateStatus(@Body() dto: UpdatePurchaseStyleStatusDto, @GetUser() user: GetUserDto): Promise<any> {
        await this.purchaseStyleService.updateStatus(dto, user);
        return {status: 200};
    }

    @Post('details')
    @ApiBody({ type: SavePurchaseStyleDetailDto, isArray: true })
    @ApiOkResponse({
        description: 'Servicio para guardar los detalles de los estilos para una compra',
    })
    async postStylesDetails(@Body() dto: SavePurchaseStyleDetailDto[], @GetUser() user) {
        try {
            const response = await this.purchaseStyleService.saveStyleDetails(dto, user);
            return { status: 200, data: { styles: response } };
        } catch (error) {
            return { status: 500, data: { styles: [] } };
        }
    }
}
