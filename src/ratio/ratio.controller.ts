import { Controller, Logger, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { RatioService } from './service/ratio.service';
import { Ratio } from '../entities/ratio.entity';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('ratio')
@ApiTags('Ratio')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class RatioController {
    // Create a logger instance
    private logger = new Logger('RatioController');

    constructor(private ratioService: RatioService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener curvas',
    })
    async get() {
        return await this.ratioService.getAll();
    }

    @Post()
    @ApiOkResponse({
        description: 'Servicio para crear ratios',
    })
    @ApiBody({ type: Ratio, isArray: true })
    async post(@Body() data: Ratio[]) {
        return await this.ratioService.addRange(data);
    }
}
