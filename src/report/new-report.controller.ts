import { Controller, Body, Post, Logger, UseGuards } from '@nestjs/common';
import { ReportService } from './service/report.service';
import { ApiOkResponse, ApiTags, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { FilterApprovalDto } from '../purchase/dtos/filterApproval.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { UserDecode } from '../shared/dtos/userDecode.entity';

@Controller('new-report')
@ApiTags('Report')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class NewReportController {
    private logger = new Logger('ReportController');

    constructor(private reportService: ReportService) {
    }

    @Post('approved')
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Compra de estilos aprobados',
    })
    @ApiBody({ type: FilterApprovalDto })
    getReportApproved(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): any {
        
        this.reportService.generateApprovedReport(dto, user?.id || 0);
        return {status: 200, data: true};
    }
}
