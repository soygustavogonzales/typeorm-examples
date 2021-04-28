import { Controller, Logger, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { DesignerService } from './service/designer.service';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('designer')
@ApiTags('Designer')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class DesignerController {
    // Create a logger instance
    private logger = new Logger('DesignerController');

    constructor(private designerService: DesignerService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Diseñadores',
    })
    async get() {
        return await this.designerService.getAll();
    }
}
