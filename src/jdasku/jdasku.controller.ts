import { Controller, Get, Param, BadRequestException, Post, UseGuards, Delete } from '@nestjs/common';
import { JdaskuService } from './service/jdasku.service';
import { ApiOkResponse, ApiParam, ApiBody, ApiTags, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { FilterApprovalDto } from './dtos/filterApproval.dto';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { JdaskusyncService } from './service/jdaskusync.service';
import { ResponseApi } from '../shared/dtos/responseApi.dto';
import { UserDecode } from '../shared/dtos/userDecode.entity';
import { SkuSummaryGroup } from './dtos/skuSummaryGroup.dto';
import { CleanSkuDto } from './dtos/cleanSku.dto';
import { Any } from 'typeorm';

@Controller('jdasku')
@ApiTags('JdaSku')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class JdaskuController {
    constructor(private jdaskuService: JdaskuService, private jdaskusyncService: JdaskusyncService) { }

    @Post()
    @ApiBody({ type: FilterApprovalDto })
    @ApiOkResponse({
        description: 'Servicio para obtener compras aprobadas y su estado de generación de SKU',
    })
    async getFilteredPurchase(@Body() dto: FilterApprovalDto): Promise<any> {
        return await this.jdaskuService.getFilteredPurchase(dto);
    }

    @Post('createsku')
    @ApiBody({ type: SkuSummaryGroup })
    @ApiOkResponse({
        description: 'Servicio para crear skus de una compra',
    })
    async getById(@Body() dto: SkuSummaryGroup, @GetUser() user): Promise<ResponseApi<number>> {
        const createdSku = await this.jdaskuService.createsku(dto, user);
        return { status: 200, data: createdSku };
    }

    @Post('/clean-sku-by-styleId/:id/:cause')
    @ApiParam({ name: 'id', type: Number })
    @ApiParam({ name: 'cause', type: Number })
    @ApiBody({ type: UserDecode })
    @ApiOkResponse({
        description: 'Servicio para limpiar skus si se modifican los estilos',
    })
    @ApiBody({ type: 'number' })
    async checkApprovedStylesColors(@Param('id') id, @Param('cause') cause, @Body() user: UserDecode): Promise<ResponseApi<boolean>> {
        await this.jdaskuService.cleanSkus([parseInt(id, null)], parseInt(cause, null), user);
        return { status: 200, data: true };
    }

    @Post('clean-skus')
    @ApiBody({ type: CleanSkuDto })
    @ApiOkResponse({
        description: 'Servicio para limpiar skus de forma masiva',
    })
    async cleanMany(@Body() dto: CleanSkuDto): Promise<ResponseApi<boolean>> {
        const { styles, cleanCause, user } = dto;
        await this.jdaskuService.cleanSkus(styles, cleanCause, user);
        return { status: 200, data: true };
    }

    @Post('delete-skus')
    @ApiBody({type:Array})
    @ApiOkResponse({
        description:'Servicio para eliminar SKUs',
    })
    async deleteMany(@Body() req:number[]):Promise<ResponseApi<boolean>>{
        const amountSkusDeleted = await this.jdaskuService.deleteSkusByStyleIds(req);
        return {status:200, data:true, message:amountSkusDeleted};
    }
 

    @Post('jdasync')
    @ApiOkResponse({
        description: 'Servicio para sincronizar SKU generados en JDA',
    })
    async jdasync(): Promise<any> {
        return await this.jdaskusyncService.jdasync();
    }

}
