import { Controller, Get, Res, Req, Body, Param, Post, Logger, UseGuards } from '@nestjs/common';
import { ReportService } from './service/report.service';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Response } from 'nestjs-sse';
import { FilterApprovalDto } from '../jdasku/dtos/filterApproval.dto';
import { v4 as uuidv4 } from 'uuid';
import { timer, Subscription } from 'rxjs';
import { ReportType } from '../shared/enums/reportType.enum';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { UserDecode } from '../shared/dtos/userDecode.entity';

@Controller('report')
@ApiTags('Report')
@ApiBearerAuth()
@ApiSecurity('api_key')
export class ReportController {
    private logger = new Logger('ReportController');

    private instanceService = uuidv4();
    private mapApprovementSubscriptions = new Map<string, Subscription>();
    private mapOrderRecapSubscriptions = new Map<string, Subscription>();
    private mapProformSubscriptions = new Map<string, Subscription>();
    private mapPurchaseOrderSubscriptions = new Map<string, Subscription>();
    private mapProductEnhancementSubscriptions = new Map<string, Subscription>();

    constructor(private reportService: ReportService) {
    }

    @Post('approved')
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Compra de estilos aprobados',
    })
    @ApiBody({ type: FilterApprovalDto })
    @UseGuards(ComposeGuard)
    async getReportApproved(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<void> {
        this.reportService.generateApprovedReport(dto, user?.id || 0);
    }

    @Post('sku')
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de SKU',
    })
    @ApiBody({ type: FilterApprovalDto })
    @UseGuards(ComposeGuard)
    async getReportSKU(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<void> {
        this.reportService.generateSKUReport(dto, user?.id || 0);
    }

    @Get('getReportUrl/:userId/:reportType/:subscriptionId')
    getReportUrl(@Res() res: Response, @Param('userId') userIdParam, @Param('reportType') reportTypeParam, @Param('subscriptionId') subsIdParam) {
        const subsId = subsIdParam as string;
        const reportType = parseInt(reportTypeParam, null) as ReportType;
        const userId = parseInt(userIdParam, null) as ReportType;
        const subscription = timer(0, 5000).subscribe(async (iterations) => {
            if (iterations === 20) {
                switch (reportType) {
                    case ReportType.Approvement:
                        this.mapApprovementSubscriptions.get(subsId).unsubscribe();
                        this.mapApprovementSubscriptions.delete(subsId);
                        break;
                    case ReportType.OrderRecap:
                        this.mapOrderRecapSubscriptions.get(subsId).unsubscribe();
                        this.mapOrderRecapSubscriptions.delete(subsId);
                        break;
                    case ReportType.ProformPI:
                        this.mapProformSubscriptions.get(subsId).unsubscribe();
                        this.mapProformSubscriptions.delete(subsId);
                        break;
                    case ReportType.PurchaseOrder:
                        this.mapPurchaseOrderSubscriptions.get(subsId).unsubscribe();
                        this.mapPurchaseOrderSubscriptions.delete(subsId);
                        break;
                    case ReportType.ProductEnhancement:
                        this.mapProductEnhancementSubscriptions.get(subsId).unsubscribe();
                        this.mapProductEnhancementSubscriptions.delete(subsId);
                        break;
                    default:
                        break;
                }
            }
            const dataReports = await this.reportService.getReportUrl(subsId);
            this.logger.debug(`Get Report url type: ${reportType} from user: ${userId}, subsId: ${subsId}, instanceService: ${this.instanceService}, dataReports: ${JSON.stringify(dataReports)}`, 'getReportUrl');
            res.sse(`data: ${JSON.stringify({ instanceService: this.instanceService, dataReports, subscriptionId: subsId })}\n\n`);
        });
        switch (reportType) {
            case ReportType.Approvement:
                this.mapApprovementSubscriptions.set(subsId, subscription);
                break;
            case ReportType.OrderRecap:
                this.mapOrderRecapSubscriptions.set(subsId, subscription);
                break;
            case ReportType.ProformPI:
                this.mapProformSubscriptions.set(subsId, subscription);
                break;
            case ReportType.PurchaseOrder:
                this.mapPurchaseOrderSubscriptions.set(subsId, subscription);
                break;
            case ReportType.ProductEnhancement:
                this.mapProductEnhancementSubscriptions.set(subsId, subscription);
                break;
            default:
                break;
        }
    }
    @Get('stopGetReportUrl/:userId/:subscriptionId/:serviceId/:reportType')
    @ApiParam({ name: 'subscriptionId', type: String })
    @ApiParam({ name: 'serviceId', type: String })
    @ApiParam({ name: 'reportType', type: String })
    @ApiParam({ name: 'userId', type: String })
    stopGetReportUrl(@Param('userId') userIdParam, @Param('subscriptionId') subsId, @Param('serviceId') serviceId, @Param('reportType') reportTypeParam): void {
        if (this.instanceService === serviceId) {
            const reportType = parseInt(reportTypeParam, null) as ReportType;
            const userId = parseInt(userIdParam, null);
            this.reportService.stopGetReportUrl(subsId);
            switch (reportType) {
                case ReportType.Approvement:
                    if (this.mapApprovementSubscriptions.has(subsId)) {
                        this.mapApprovementSubscriptions.get(subsId).unsubscribe();
                        this.mapApprovementSubscriptions.delete(subsId);
                    }
                    break;
                case ReportType.OrderRecap:
                    if (this.mapOrderRecapSubscriptions.has(subsId)) {
                        this.mapOrderRecapSubscriptions.get(subsId).unsubscribe();
                        this.mapOrderRecapSubscriptions.delete(subsId);
                    }
                    break;
                case ReportType.ProformPI:
                    if (this.mapProformSubscriptions.has(subsId)) {
                        this.mapProformSubscriptions.get(subsId).unsubscribe();
                        this.mapProformSubscriptions.delete(subsId);
                    }
                    break;
                case ReportType.PurchaseOrder:
                    if (this.mapPurchaseOrderSubscriptions.has(subsId)) {
                        this.mapPurchaseOrderSubscriptions.get(subsId).unsubscribe();
                        this.mapPurchaseOrderSubscriptions.delete(subsId);
                    }
                    break;
                case ReportType.ProductEnhancement:
                    if (this.mapProductEnhancementSubscriptions.has(subsId)) {
                        this.mapProductEnhancementSubscriptions.get(subsId).unsubscribe();
                        this.mapProductEnhancementSubscriptions.delete(subsId);
                    }
                    break;
                default:
                    break;
            }
            this.logger.debug(`Stop Get Report type: ${reportType} from user: ${userId}, subsId: ${subsId}, serviceId: ${serviceId}`, 'stopGetReportUrl');
        }
    }

    @Post('orderRecap')
    @UseGuards(ComposeGuard)
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Order Recap',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getReportOrderRecap(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<void> {
        this.reportService.generateOrderRecapReport(dto, user);
    }

    @Post('pi')
    @UseGuards(ComposeGuard)
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Proform Invoice',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getReportPI(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<void> {
        this.reportService.generatePIReport(dto, user);
    }

    @Post('purchaseOrder')
    @UseGuards(ComposeGuard)
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Ordenes de compra',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getPurchaseOrderReport(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<any> {
        this.reportService.generatePurchaseOrderReport(dto, user?.id || 0);
    }

    @Post('productEnhancement')
    @UseGuards(ComposeGuard)
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Enriquecimiento de Productos',
    })
    @ApiBody({ type: FilterApprovalDto })
    async getProductEnhancementReport(@Body() dto: FilterApprovalDto, @GetUser() user: UserDecode): Promise<any> {
        this.reportService.generateProductEnhancementReport(dto, user?.id || 0);
    }

}
