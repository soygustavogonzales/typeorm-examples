import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { JdaOcSyncService } from './service/jdaocsync.service';

@Controller('jdaoc')
@ApiTags('JdaOc')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class JdaocController {
    constructor(private jdaskusyncService: JdaOcSyncService){ }

    @Post('jdasync')
    @ApiOkResponse({
        description: 'Servicio para sincronizar OC generados en JDA',
    })
    async jdasync(): Promise<any> {
        return await this.jdaskusyncService.jdasync();
    }

    @Post('jdaocresync/:piName')
    @ApiOkResponse({
        description: 'Servicio para sincronizar de forma completa una PI con JDA, incluido OC que se pudieron haber cancelado',
    })
    async jdaOcResync(@Param('piName') piName: string): Promise<any> {
        return await this.jdaskusyncService.jdaOcResync(piName);
    }
}
