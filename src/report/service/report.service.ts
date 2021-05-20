import { Injectable, InternalServerErrorException, Logger, Req, Res } from '@nestjs/common';
import { PurchaseStyleService } from '../../purchase-style/services/purchase-style.service';
import * as _ from 'lodash';
import { ConfigService } from 'nestjs-config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { FilterApprovalDto } from '../../purchase/dtos/filterApproval.dto';
import { DollarService } from '../../maintainer/dollar/service/dollar.service';
import { ReportType } from '../../shared/enums/reportType.enum';
import { RoleType } from '../../shared/enums/role.enum';
import moment = require('moment');
import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import * as XLSX from '@sheet/image';
import { Repository } from 'typeorm';
import { RequestReport } from '../../entities/requestReport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusPurchaseColorEnum } from '../../shared/enums/statusPurchaseColor.enum';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { UserDecode } from '../../shared/dtos/userDecode.entity';
import { PurchaseStyleOrderRecapDto, headerOrderRecap } from '../dtos/purchaseStyleOrderRecap.dto';
import { SecurityProxyService } from '../../external-services/security-proxy/security-proxy.service';
import { JdaskuService } from '../../jdasku/service/jdasku.service';
import { PaymentTermsService } from '../../payment-terms/service/payment-terms/payment-terms.service';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { PurchaseBuyingReportEstilo } from '../dtos/purchaseBuyingReportEstilo.dto';
import { PurchaseBuyingReport } from '../dtos/purchaseBuyingReport.dto';
import { PurchaseBuyingReportSku } from '../dtos/purchaseBuyingReportSku.dto';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { StoreService } from '../../store/service/store.service';
@Injectable()
export class ReportService {
    private logger = new Logger('ReportService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;
    // approvedUrl: Map<number, IDataReport[]> = new Map<number, IDataReport[]>();
    // orderRecapUrl: Map<number, IDataReport[]> = new Map<number, IDataReport[]>();
    // proformsInvoiceUrls: Map<number, IDataReport[]> = new Map<number, IDataReport[]>();

    constructor(
        private purchaseStyleService: PurchaseStyleService,
        private securityProxyService: SecurityProxyService,
        private styleProxyService: StyleProxyService,
        private paymentTermsProxyService: PaymentTermsService,
        @InjectRepository(RequestReport)
        private readonly requestReporRepository: Repository<RequestReport>,
        private config: ConfigService,
        private skuService: JdaskuService,
        private dollarService: DollarService,
        private notificationPublisherService: NotificationPublisherService,
        @InjectRepository(PurchaseStyle)
        private readonly purchaseStyleRepository: Repository<PurchaseStyle>,
        private storeService: StoreService,
        ) {
        this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
        AWS.config.update({
            accessKeyId: this.config.get('aws').aws_access_key_id,
            secretAccessKey: this.config.get('aws').aws_secret_access_key,
        });
        this.s3 = new AWS.S3();
    }
    async getReportUrl(subscriptionId: string): Promise<RequestReport[]> {
        //this.logger.debug(`Get Report ${reportType} from user ${userId}`, 'getReportUrl');
        const requestReports = await this.requestReporRepository.find({ where: { subscriptionId } });
        if (requestReports.length > 0) {
            return requestReports;
        } else {
            return null;
        }
    }
    async stopGetReportUrl(subscriptionId: string) {
        // this.logger.debug('init stopGetReportUrl ');
        await this.requestReporRepository.softDelete({ subscriptionId });
        // this.logger.debug('end stopGetReportUrl ');
    }
    getNewRequestReport(data: { status: string; url: string; name: string; subscriptionId: string; userId?: number; reportType: ReportType; }): RequestReport {
        const requestReport = new RequestReport();
        requestReport.reportType = data.reportType;
        requestReport.status = data.status;
        requestReport.url = data.url;
        requestReport.subscriptionId = data.subscriptionId;
        requestReport.name = data.name;
        requestReport.userId = data.userId || null;
        return requestReport;
    }

    async generateSKUReport(dto: FilterApprovalDto, userId: number) { 
        this.logger.debug(`Generate SKU Report from user ${userId}`, 'generateSKUReport: start');
        const subscriptionId = dto.subscriptionId;
        const requestReport = this.getNewRequestReport({ status: 'Pending', url: '', name: '', subscriptionId, userId, reportType: ReportType.Sku });
        await this.requestReporRepository.save(requestReport);
        const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.ConfirmedOrCanceled, true);

        if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
            requestReport.status = 'No Data';
            requestReport.url = '';
            requestReport.name = 'Reporte SKU';
            await this.requestReporRepository.save(requestReport);
            return null;
        }

        const headersSku = {
            ocJda: 'OC',
            department: 'DEPARTMENT',
            styleCode: 'STYLE',
            ean: 'BAR CODES',
            sku: 'SKU',
            description: 'DESCRIPTION',
            color: 'COLOR',
            size: 'SIZE',
            totalQty: 'ORDER QUANTITY',
            price: 'RETAIL PRICE',
            sato: 'PROMOTIONAL PRICE',
            impNum: 'IMP NUM',
            piNumber: 'PI',
            atcId: 'ATC',
            ratio: 'RATIO', // add to join,
            provider: 'VENDOR',
            lsd: 'LSD',
            unit: 'UNIT',
            skuSyncDate: 'SKU SYNC DATE'
        };
        const styleIds = _.uniq(purchaseStyles.map(p => p.styleId)) as number[];
        const styleSkus = await this.skuService.getSkuByStyle(styleIds);

        let dataToExportSku = [];
        _.flatten(purchaseStyles.map(purchaseStyle => {
            return purchaseStyle.colors.map(color => {
                const styleData = stylesData.find(s => s.id === purchaseStyle.styleId);
                const styleDetails = purchaseStyle.details[0];
                const colorData = styleData.colors.find(c => c.id === color.styleColorId);
                const sku = styleSkus.find(sku => sku.styleId === styleData.id);
                const skuColor = sku?.skuColor.find(skuColor => skuColor.styleColorId === colorData.id);
                if (styleData && styleDetails && colorData && skuColor) {
                    for (const colorSize of skuColor.skuColorSize) {

                        const size = colorSize.sizeJda?.shortName || 'N/A';
                        const atcId = (purchaseStyle.purchaseStore.store.shortName !== 'PW' && purchaseStyle.purchaseStore.store.shortName !== 'TP') ? colorSize.atc : '';
                        const unit = purchaseStyle.purchaseStore.store.name;
                        const packingMethod = styleDetails.packingMethod.name;

                        if (!((unit === 'PARIS E-COMMERCE' || unit === 'TIENDAS PROPIAS') && size === 'SURT') &&
                            !(unit === 'PARIS' && atcId != '' && size === 'SURT') &&
                            !(unit === 'PARIS' && atcId == '' && (size !== 'SURT' && size !== 'TU' && packingMethod !== 'GOH / SOLID COLOR / SOLID SIZE|6' && packingMethod !== 'GOH/SOLID COLOR/ASSORTED SIZE|7')) &&
                            !(unit === 'PARIS' && atcId == '' && (size === 'SURT' && (packingMethod === 'GOH / SOLID COLOR / SOLID SIZE|6' || packingMethod === 'GOH/SOLID COLOR/ASSORTED SIZE|7')))) {
                              
                            for (const shipping of color.shippings) {
                                const unitsPerInner = styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b);
                                const totalQty = (shipping.units / unitsPerInner) * colorSize.ratio;
                                dataToExportSku.push({
                                    department: styleData.departmentCode,
                                    styleCode: styleData.code,
                                    ean: colorSize.ean,
                                    sku: colorSize.sku,
                                    description: `${styleData.code} ${styleData.articleType}`,
                                    color: colorData.colorShortName,
                                    size,
                                    totalQty: totalQty,
                                    price: styleDetails.price,
                                    sato: styleDetails.sato,
                                    piNumber: shipping.piName,
                                    atcId,
                                    ratio: colorSize.ratio,
                                    provider: styleDetails.provider.name,
                                    lsd: moment(shipping.date).format('DD-MMM-yyyy'),
                                    unit,
                                    skuSyncDate: colorSize.datejda,
                                    ocJda: shipping['oc'].map(oc => oc.ponumb).join('/'),
                                    impNum: shipping['oc'][0] ? `${purchaseStyle.purchaseStore.store.impnumpfx}${shipping['oc'][0].poedat.toString().substring(0, 4)}${shipping['oc'][0].ponumb}` : null,
                                });
                            }
                        }
                    }
                }
            });
        }));

        // dataToExportSku = dataToExportSku.filter(row => !((row.unit === 'PARIS E-COMMERCE' || row.unit === 'TIENDAS PROPIAS') && row.size === 'SURT'));
        // dataToExportSku = dataToExportSku.filter(row => !(row.unit === 'PARIS' && row.atcId != '' && row.size === 'SURT'));
        // dataToExportSku = dataToExportSku.filter(row => !(row.unit === 'PARIS' && row.atcId == '' && (row.size !== 'SURT' && row.size !== 'TU' && row.packingMethod !== 'GOH / SOLID COLOR / SOLID SIZE|6' && row.packingMethod !== 'GOH/SOLID COLOR/ASSORTED SIZE|7')));
        // dataToExportSku = dataToExportSku.filter(row => !(row.unit === 'PARIS' && row.atcId == '' && (row.size === 'SURT' && (row.packingMethod === 'GOH / SOLID COLOR / SOLID SIZE|6' || row.packingMethod === 'GOH/SOLID COLOR/ASSORTED SIZE|7'))));

        /* make the worksheet */
        const ws = XLSX.utils.json_to_sheet([headersSku, ...dataToExportSku], { skipHeader: true });
        // const stream = XLSX.stream.to_csv(ws);

        /* write workbook (use type 'binary') */
        const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\r\n' });
        const bufferFile = Buffer.from(csv, 'utf8');
        const name = `SKUReport_${uuidv4()}.csv`;
        this.s3.putObject(
            {
                Bucket: this.AWS_S3_BUCKET_NAME,
                Body: bufferFile,
                Key: `reports/${name}`,
                ContentType: 'text/csv',
            },
            async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                if (error) {
                    this.logger.error(`Error cargando el archivo de reporte: ${error}`);
                    return '';
                } else {
                    const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${name}`, Expires: 10800 }; // 3 HR
                    const url = this.s3.getSignedUrl('getObject', params);
                    requestReport.status = 'Complete';
                    requestReport.url = url;
                    requestReport.name = 'Reporte SKU';
                    await this.requestReporRepository.save(requestReport);
                    this.logger.debug(`Generate SKU Report from user ${userId} url: ${url}`, 'generateSKUReport:end');
                }
            },
        );

        return true;
    }

    // Require purchases on Approved Status
    async generateApprovedReport(dto: FilterApprovalDto, userId: number) {
        this.logger.debug(`Generate Report Approved from user ${userId}`, 'generateApprovedReport: start');
        const subscriptionId = dto.subscriptionId;
        const requestReport = this.getNewRequestReport({ status: 'Pending', url: '', name: '', subscriptionId, userId, reportType: ReportType.Approvement });
        await this.requestReporRepository.save(requestReport);
        const { purchaseStyles, stylesData, users } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.ConfirmedOrCanceled, true);

        if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
            requestReport.status = 'No Data';
            requestReport.url = '';
            requestReport.name = 'Reporte Aprobación';
            await this.requestReporRepository.save(requestReport);
            return null;
        }

        const seasonCommercialIds = _.uniq(purchaseStyles.map(p => p.purchaseStore.purchase.seasonCommercialId)) as number[];
        const styleIds = _.uniq(purchaseStyles.map(p => p.styleId)) as number[];

        const styleSkus = await this.skuService.getSkuByStyle(styleIds);
        const dollarChanges = await this.dollarService.getBySeason(seasonCommercialIds);
        if (!dollarChanges || dollarChanges.length === 0) {
            this.logger.error(`Cambio de dollar no econtrado para las temporadas ${seasonCommercialIds.join(',')}`);
            return null;
        }

        let reportObject: PurchaseBuyingReport;
        switch (dto.level) {
            case 'CompraEstilo':
                reportObject = new PurchaseBuyingReportEstilo(this.purchaseStyleRepository, purchaseStyles, stylesData, styleSkus, users, userId);
                reportObject.reportName = 'BuyingReport_Estilo';
                break;
            
            case 'CompraSku':
                reportObject = new PurchaseBuyingReportSku(purchaseStyles, stylesData, styleSkus, users, userId);
                reportObject.reportName = 'BuyingReport_SKU';
                break;
        
            default:
                break;
        }

        reportObject.config = this.config;
        reportObject.xlsxReport()
        await reportObject.uploadReport();
        reportObject.sendNotification(userId);

        requestReport.status = 'Complete';
        requestReport.url = 'url';
        requestReport.name = 'Reporte Compra nivel Estilo';
        await this.requestReporRepository.save(requestReport);
        this.logger.debug(`Generate Report Approved from user ${userId} url: ${reportObject.reportUrl}`, 'generateApprovedReport:end');

        return true;
    }

    // Require purchases on Approved Status
    async generateOrderRecapReport(dto: FilterApprovalDto, user: UserDecode) {
        const userId = user.id;
        this.logger.debug(`Generate Report Order Recap from user ${userId}`, 'generateOrderRecapReport: start');
        const subscriptionId = dto.subscriptionId;

        const { purchaseStyles, stylesData, users } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);

        if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
            const requestReport = this.getNewRequestReport({ status: 'No Data', url: '', name: `Order Recap`, subscriptionId, userId: user.id, reportType: ReportType.OrderRecap });
            requestReport.status = 'No Data';
            requestReport.url = '';
            requestReport.name = 'Order Recap';
            await this.requestReporRepository.save(requestReport);
            return null;
        };

        const dataToExport = [];
        purchaseStyles.map(purchaseStyle => {
            purchaseStyle.colors.map(color => {
                const styleData = stylesData.find(s => s.id === purchaseStyle.styleId);
                console.log('styleData >>',styleData);
                const styleDetails = purchaseStyle.details[0]; // TODO: filter by detail type
                const colorData = styleData.colors.find(c => c.id === color.styleColorId);
                if (styleData && styleDetails && colorData) {
                    for (const shipping of color.shippings) { 
                        dataToExport.push(new PurchaseStyleOrderRecapDto(styleData, styleDetails, purchaseStyle, color, colorData, users, shipping));
                    }
                }
            });
        });

        const group = _.groupBy(dataToExport, (data) => `${data.departmentId}_${data.brandId}_${data.providerId}`);
        for (const groupKey of Object.keys(group)) {
            const dataStyles = group[groupKey];
            const purchaseName = `${dataStyles[0].department}-${dataStyles[0].brand.replace(/[^a-zA-Z ]/g, '')}-${dataStyles[0].provider.replace(/[^a-zA-Z ]/g, '')}`;
            const fileName = `${purchaseName}.xlsx`;

            const requestReport = this.getNewRequestReport({ status: 'Pending', url: '', name: fileName, subscriptionId, userId, reportType: ReportType.OrderRecap });
            await this.requestReporRepository.save(requestReport);

            const dataToExcel = dataStyles.map(style => {
                const {brandId, departmentId, providerId, purchaseId, departmentsRelated, purchaseUserId, merchantsUserId, ...dataToExcel} = style;    
                return dataToExcel;
            })

            const workBook = XLSX.utils.book_new();
            const workBookName = XLSX.utils.json_to_sheet([headerOrderRecap, ...dataToExcel], { skipHeader: true });
            XLSX.utils.book_append_sheet(workBook, workBookName, 'Order Recap');
            const file = XLSX.write(workBook, {
                bookType: 'xlsx', bookSST: false,
                type: 'buffer',
                cellStyles: true,
            });
            const bufferFile = Buffer.from(file, 'utf8');
            this.s3.putObject(
                {
                    Bucket: this.AWS_S3_BUCKET_NAME,
                    Body: bufferFile,
                    Key: `reports/${fileName}`,
                    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
                async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                    if (error) {
                        this.logger.error(`Error cargando el archivo de reporte: ${error}`);
                        requestReport.status = 'Error';
                        // requestReport.name = 'Order Recap';
                        await this.requestReporRepository.save(requestReport);
                        return '';
                    } else {
                        const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${fileName}`, Expires: 10800 }; // 3 HR
                        const url = this.s3.getSignedUrl('getObject', params);
                        requestReport.status = 'Complete';
                        requestReport.url = url;
                        // Notification dada
                        const noticationData = _.uniqBy(dataStyles.map(p =>  ({
                            description: `Order Recap generado para la Compra ${purchaseName}`,
                            notificationType: NotificationTypeEnum.OrderRecapCreation,
                            creatorPurchaseUserId: p.purchaseUserId,
                            merchantUserId: p.merchantsUserId,
                            departmentsRelated: p.departmentsRelated,
                        })), 'purchaseId');
                        requestReport.notificationData = JSON.stringify(noticationData);
                        // Save request_report
                        await this.requestReporRepository.save(requestReport);
                        this.logger.debug(`Generate Report Order Recap from user ${userId} url: ${url}`, 'generateOrderRecapReport: end');
                    }
                },
            );
        }
        return true;
    }

    // Require purchases on Approved Status
    async generatePIReport(dto: FilterApprovalDto, user: UserDecode) {
        this.logger.debug(`Generate Report PI from user ${user.id}`, 'generatePIReport: start');
        const userId = user.id;
        const subscriptionId = dto.subscriptionId;
        const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);

        if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
            this.logger.debug(`Generate Report PI from user ${user.id} no styles result `, 'generatePIReport: end')
            const requestReport = this.getNewRequestReport({ status: 'No Data', url: '', name: `PI_NODATA`, subscriptionId, userId: user.id, reportType: ReportType.ProformPI });
            await this.requestReporRepository.save(requestReport);
        }
        const piNames = _.uniq(_.flatten(purchaseStyles.map(p => p.colors.map(c => c.piName)))) as string[];

        for (const piName of piNames) {
            this.logger.debug(`Generate PiName: ${piName} from user ${userId}`, 'generatePIReport: start');
            const requestReport = this.getNewRequestReport({ status: 'Pending', url: '', name: `PI_${piName}`, subscriptionId, userId, reportType: ReportType.ProformPI });
            await this.requestReporRepository.save(requestReport);


            const workBook = XLSX.utils.book_new();
            const summaryRows = [];
            const summaryFunctions = [];
            const summaryStyles = [];
            const summaryCellsFormats = [];
            const summarySheetColumns = [
                { wpx: 200 }, // {wch: 26}, wch = "characters"
                { wpx: 150 },
                { wpx: 150 },
                { wpx: 150 },
            ];
            const mainTitle = [
                { title: '', mapfn: '', type: 'empty_line' },
                { title: 'PROFORMA INVOICE', mapfn: '', type: 'mainTitle' },
                { title: '', mapfn: '', type: 'empty_line' },
            ];
            const generalHeaders = [
                { title: 'PROFORMA INVOICE #:', mapfn: 'piNameShipment' },
                { title: 'PROFORMA DATE:', mapfn: 'piDate' },
                { title: 'COLLECTION:', mapfn: 'piCollection' },
                { title: 'SELLER INFORMATION:', mapfn: '', type: 'separator' },
                { title: 'Name:', mapfn: 'providerName' },
                { title: 'Address:', mapfn: 'providerAddress' },
                { title: 'E-Mail:', mapfn: 'providerEMail' },
                { title: 'CONSIGNEE TO:', mapfn: '', type: 'separator' },
                { title: 'Name:', mapfn: 'cencosudName' },
                { title: 'Address:', mapfn: 'cencosudAddress' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: 'SIZE QUANTYTIES', mapfn: '', type: 'separator2' },
            ];

            const logisticHeaders = [
                { title: 'LOGISTICS', mapfn: '', type: 'title' },
                { title: 'COUNTRY OF ORIGIN:', mapfn: 'countryOrigin' },
                { title: 'TYPE OF TRANSPORT:', mapfn: 'typeTransport' },
                { title: 'PORT OF LOADING:', mapfn: 'portLoading' },
                { title: 'SHIPMENT TERM:', mapfn: 'shipmentTerm' },
                { title: 'DESTINATION PORT:', mapfn: 'destinationPort' },
                { title: 'EARLIEST SHIPPING DATE:', mapfn: 'earliestShippingDate' },
                { title: 'LAST SHIPPING DATE:', mapfn: 'lastShippingDate' },
            ];

            const bodyHeaders = [
                // { title: '', mapfn: 'emptyColumn' },
                { title: 'N°', mapfn: 'index' },
                { title: 'Style No', mapfn: 'style_code' },
                { title: 'Description', mapfn: 'description' },
                { title: 'Fabric Composition', mapfn: 'fabric_q' },
                { title: 'Brand', mapfn: 'brand_name' },
                { title: 'Color', mapfn: 'color_name' },
                { title: 'Size Breakdown', mapfn: 'size_ratio' },
                { title: 'Size', mapfn: 'size_curve' },
                { title: 'Size 1', mapfn: 'size1', footerTotal: true },
                { title: 'Size 2', mapfn: 'size2', footerTotal: true },
                { title: 'Size 3', mapfn: 'size3', footerTotal: true },
                { title: 'Size 4', mapfn: 'size4', footerTotal: true },
                { title: 'Size 5', mapfn: 'size5', footerTotal: true },
                { title: 'Size 6', mapfn: 'size6', footerTotal: true },
                { title: 'Size 7', mapfn: 'size7', footerTotal: true },
                { title: 'Size 8', mapfn: 'size8', footerTotal: true },
                { title: 'Size 9', mapfn: 'size9', footerTotal: true },
                { title: 'Size 10', mapfn: 'size10', footerTotal: true },
                {
                    title: 'Order Quantity',
                    mapfn: 'orderQtys',
                    footerTotal: true,
                    alias: 'totalOrderQuantity',
                },
                { title: 'QTY pcs. per INNER PACK', mapfn: 'qtyXInner' },
                { title: 'QTY pcs. per MASTER CARTON', mapfn: 'qtyXMaster' },
                {
                    title: 'TOTAL QTY of MASTER CARTONS',
                    mapfn: 'qtyTotalXMaster',
                    footerTotal: true,
                },
                { title: 'CBM per Master Carton', mapfn: 'cbm' },
                {
                    title: 'TOTAL CBM',
                    mapfn: 'total_cbm',
                    footerTotal: true,
                    alias: 'totalCBM',
                },
                { title: 'UNIT FOB PRICE (USD)', mapfn: 'fobValue' },
                {
                    title: 'TOTAL FOB amount (USD)',
                    mapfn: 'total_fob',
                    footerTotal: true,
                    alias: 'totalFOB',
                },
            ];

            const paymentHeaders = [
                { title: '', mapfn: '', type: 'empty_line' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: 'INSTRUMENT OF PAYMENT:', mapfn: 'instrumentPayment' },
                { title: 'PAYMENT TERM:', mapfn: 'paymentTerm' },
            ];

            const conditionsHeaders = [
                { title: '', mapfn: '', type: 'empty_line' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: 'Shipment Conditions:', mapfn: '', type: 'title' },
                { title: 'Quantity tolerance + 0% /- 3% is allowed', mapfn: '' },
                { title: 'Partial Shipments are not allowed', mapfn: '' },
            ];

            const supplierAuthorizedHearder = [
                { title: '', mapfn: '', type: 'empty_line' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: '', mapfn: '', type: 'empty_line' },
                { title: 'SUPPLIER\'S AUTHORIZED SIGNATURE', mapfn: '', type: 'title' },
            ];

            const cencosudAuthorizedHearder = [
                { title: 'CENCOSUD AUTHORIZED SIGNATURE', mapfn: '', type: 'title' },
            ];

            const summaryHeaders = [
                { title: 'Nombre PI', mapfn: 'piNameAlias' },
                { title: 'Total Fob', mapfn: 'totalFOB', ref: true, format: true },
                {
                    title: 'Total QTY\'s',
                    mapfn: 'totalOrderQuantity',
                    ref: true,
                    format: true,
                },
                { title: 'Total CBM\'s', mapfn: 'totalCBM', ref: true },
            ];
            const purchaseStylesByPiName = purchaseStyles.filter(p => p.colors.filter(c => c.piName === piName).length > 0);
            const styleDetailReference = purchaseStylesByPiName[0].details[0];
            const functionAliases = {};
            const sheets = [];
            const piNamesSheets = _.uniq(_.flatten(_.flatten(purchaseStylesByPiName.map(s => s.colors.map(c => c.shippings.map(sh => sh.piName))))));
            for (const piNameShipment of piNamesSheets) {

                // }
                //_.groupBy(purchaseStylesByPiName, 'store');
                //_.range(1, 7).forEach(shippmentNumber => {
                let sheetTotal: number = 0; //
                const deliverysDates = (_.flatten(_.flatten(purchaseStylesByPiName.map(s => s.colors.map(c => c.shippings.filter(sh => sh.piName === piNameShipment))))) as PurchaseStyleColorShipping[]);
                const lastShippingDate = deliverysDates.map(s => s.date).sort((a, b) => a.getTime() - b.getTime())[0];
                const earliestShippingDate = moment(lastShippingDate).subtract(15, 'days').format('DD-MM-YYYY');
                // const piNameShipment = `${piName}E${shippmentNumber}`;
                const dataGeneralHeaders = {
                    piNameShipment,
                    piDate: moment().format('DD-MM-YYYY'),
                    piCollection: purchaseStylesByPiName[0].purchaseStore.store.shortName,
                    providerName: styleDetailReference.provider?.name || 'No Ingresado',
                    providerAddress: styleDetailReference.provider?.address || 'No Ingresado',
                    providerEMail: styleDetailReference.provider?.email || 'No Ingresado',
                    cencosudName: purchaseStylesByPiName[0].purchaseStore.store.destinyCountry.shortName === 'PE' ?
                        'CENCOSUD RETAIL PERU S.A.' : 'CENCOSUD RETAIL S.A.',
                    cencosudAddress: purchaseStylesByPiName[0].purchaseStore.store.destinyCountry.shortName === 'PE' ?
                        'CALLE AUGUSTO ANGULO #130, SAN ANTONIO MIRAFLORES, LIMA, PERÚ.' : 'AV. KENNEDY 9001, PISO 4, LAS CONDES, SANTIAGO, CHILE.',
                };
                const dataLogisticHeaders = {
                    countryOrigin: styleDetailReference.origin?.name.toUpperCase() || 'No Ingresado',
                    typeTransport: `BY ${styleDetailReference.shippingMethod?.name.toUpperCase() || 'No Ingresado'}`,
                    portLoading: styleDetailReference.exitPort?.name.toUpperCase() || 'No Ingresado',
                    shipmentTerm: 'FOB',
                    destinationPort: 'SAN ANTONIO',
                    earliestShippingDate,
                    lastShippingDate: lastShippingDate ? moment(lastShippingDate).format('DD-MM-YYYY') : '',
                };

                const dataPaymentHearders = {
                    instrumentPayment: `  ${styleDetailReference.provider?.paymentTerm1 || 'No Ingresado'}`,
                    paymentTerm: `  ${styleDetailReference.provider?.paymentTerm2 || 'No Ingresado'}`,
                };
                const rows = [];
                const cellFormats = [];
                const sheetStyles = [];
                const sheetMerges = [];
                const sheetFunctions = [];
                const sheetColumns = [
                    { wpx: 50 }, // {wch: 26}, wch = "characters"
                    { wpx: 150 },
                    { wpx: 180 },
                    { wpx: 220 },
                    { wpx: 180 },
                    { wpx: 180 },
                    { wpx: 180 },
                ];
                const sheetRows = [
                    { hpt: 16 }, // {hpx: 12}, hpx = "pixeles" (1 pt = 1 px)
                    { hpt: 37 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 16 },
                    { hpt: 25 },
                    { hpt: 80 },
                ];

                // MAIN TITLE
                mainTitle.forEach((header, headerIndex) => {
                    const currentRow = rows.length;
                    if (header.type === 'mainTitle') {
                        rows.push([
                            header.title,
                            ..._.range(0, 24).map(x => ''),
                        ]);
                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                        _.range(0, 24).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { c: columnIdx, r: currentRow },
                                style: {
                                    bold: true,
                                    sz: 30,
                                    alignment: { horizontal: 'center' },
                                },
                            });
                        });
                    } else if (header.type === 'empty_line') {
                        rows.push(_.range(0, 24).map(x => ''));
                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                    }
                });

                // GENERAL HEADERS
                generalHeaders.forEach((header, headerIndex) => {
                    const currentRow = rows.length;
                    const value = _.property(header.mapfn)(dataGeneralHeaders);

                    if (header.type === 'separator') {
                        rows.push([header.title, '', '', '', '', '']);
                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 5 },
                        });

                        _.range(0, 7).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { c: columnIdx, r: currentRow },
                                style: {
                                    bold: true,
                                    sz: 15,
                                    fgColor: { rgb: 0xafc0db },
                                    // alignment: { horizontal: 'left' },
                                    alignment: { vertical: 'center', horizontal: 'left' },
                                    bottom: { style: 'thick' },
                                    top: { style: 'thick' },
                                    right: { style: 'thick' },
                                },
                            });
                        });
                    } else if (header.type === 'separator2') {
                        rows.push([..._.range(0, 24).map(x => { if (x === 7) { return header.title; } else { return ''; } })]);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 6 },
                        });

                        sheetMerges.push({
                            s: { r: currentRow, c: 7 },
                            e: { r: currentRow, c: 16 },
                        });

                        _.range(7, 17).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { c: columnIdx, r: currentRow },
                                style: {
                                    bold: true,
                                    sz: 14,
                                    fgColor: { rgb: 0xafc0db },
                                    alignment: {
                                        vertical: 'center',
                                        horizontal: 'center',
                                        wrapText: '1',
                                    },
                                    top: { style: 'thick' },
                                    left: { style: 'thick' },
                                    right: { style: 'thick' },
                                },
                            });
                        });

                        sheetMerges.push({
                            s: { r: currentRow, c: 17 },
                            e: { r: currentRow, c: 24 },
                        });
                    } else if (header.type === 'empty_line') {
                        rows.push(_.range(0, 24).map(x => ''));

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                    } else {
                        rows.push([header.title, '', '', value || '', '', '']);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 2 },
                        });

                        sheetMerges.push({
                            s: { r: currentRow, c: 3 },
                            e: { r: currentRow, c: 5 },
                        });

                        _.range(0, 3).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    bold: true,
                                    sz: 12,
                                    fgColor: { rgb: 0xafc0db },
                                    alignment: { horizontal: 'left' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });

                        _.range(3, 7).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    // bold: true,
                                    sz: 12,
                                    alignment: { horizontal: 'center' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });
                    }

                    sheetStyles.push({
                        range: {
                            s: { r: 3, c: 0 },
                            e: { r: 12, c: 7 },
                        },
                        style: {
                            top: { style: 'thick' },
                            left: { style: 'thick' },
                            bottom: { style: 'thick' },
                            right: { style: 'thick' },
                        },
                    });
                });

                // LOGISTIC HEADERS
                let startRow = 3;
                const startColumn = 17;
                logisticHeaders.forEach((header, headerIndex) => {
                    const value = _.property(header.mapfn)(dataLogisticHeaders);
                    // console.log('Value: ', value)

                    if (header.type === 'title') {
                        _.range(0, 8).forEach(i => {
                            if (i === 0) {
                                rows[startRow][startColumn] = header.title;
                            } else {
                                rows[startRow][startColumn + i] = '';
                            }
                        });
                        sheetMerges.push({
                            s: { r: startRow, c: startColumn },
                            e: { r: startRow, c: startColumn + 7 },
                        });

                        _.range(startColumn, startColumn + 8).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { c: columnIdx, r: startRow },
                                style: {
                                    bold: true,
                                    sz: 12,
                                    fgColor: { rgb: 0xafc0db },
                                    alignment: { horizontal: 'center' },
                                    top: { style: 'thick' },
                                    right: { style: 'thick' },
                                    left: { style: 'thick' },
                                },
                            });
                        });
                    } else {
                        _.range(0, 8).forEach(i => {
                            if (i === 0) {
                                rows[startRow][startColumn] = header.title;
                            } else if (i === 3) {
                                rows[startRow][startColumn + 3] = value || '';
                            } else {
                                rows[startRow][startColumn + i] = '';
                            }
                        });
                        sheetMerges.push({
                            s: { r: startRow, c: startColumn },
                            e: { r: startRow, c: startColumn + 2 },
                        });

                        sheetMerges.push({
                            s: { r: startRow, c: startColumn + 3 },
                            e: { r: startRow, c: startColumn + 7 },
                        });

                        _.range(startColumn, startColumn + 3).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: startRow, c: columnIdx },
                                style: {
                                    bold: true,
                                    sz: 12,
                                    fgColor: { rgb: 0xafc0db },
                                    alignment: { horizontal: 'left' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });

                        _.range(startColumn + 3, startColumn + 8).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: startRow, c: columnIdx },
                                style: {
                                    // bold: true,
                                    alignment: { horizontal: 'center' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });
                    }
                    sheetStyles.push({
                        range: {
                            s: { r: 4, c: startColumn },
                            e: { r: 10, c: startColumn + 7 },
                        },
                        style: {
                            top: { style: 'thick' },
                            left: { style: 'thick' },
                            bottom: { style: 'thick' },
                            right: { style: 'thick' },
                        },
                    });
                    startRow++;
                });

                // BODY HEADERS
                rows.push(bodyHeaders.map(h => h.title));

                // thick border in body headers
                sheetStyles.push({
                    range: {
                        s: { r: rows.length - 1, c: 0 },
                        e: { r: rows.length - 1, c: bodyHeaders.length - 1 },
                    },
                    style: {
                        bold: true,
                        sz: 12,
                        fgColor: { rgb: 0xafc0db },
                        alignment: {
                            vertical: 'center',
                            horizontal: 'center',
                            wrapText: '1',
                        },
                        bottom: { style: 'thick' },
                        top: { style: 'thick' },
                        left: { style: 'thick' },
                        right: { style: 'thick' },
                    },
                });

                // BODY
                let indx = 0;
                for (const purchaseStyle of purchaseStylesByPiName) {
                    const styleData = stylesData.find(s => s.id === purchaseStyle.styleId);
                    const styleDetails = purchaseStyle.details[0];
                    const ratio = styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null));
                    for (const color of purchaseStyle.colors) {
                        const colorData = styleData.colors.find(c => c.id === color.styleColorId);
                        const currentShipping = color.shippings.find(s => s.piName === piNameShipment);
                        if (!currentShipping) {
                            continue;
                        }
                        const row = [];
                        const rowData: any = {};
                        indx += 1;
                        rowData.index = indx;
                        rowData.style_code = styleData.code;
                        rowData.description = `${styleData.code} ${styleData.classType}`;
                        rowData.fabric_q = styleDetails.composition;
                        rowData.brand_name = styleData.brand;
                        rowData.size_curve = styleDetails.size.size;
                        rowData.size_ratio = styleDetails.ratio.ratio;
                        rowData.qtyXInner = styleDetails.ratio.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b); // calculate by ratio,
                        rowData.qtyXMaster = styleData.divisionMaster;
                        rowData.color_name = colorData.colorName;
                        rowData.orderQtys = 0;
                        _.forEach(ratio, (r, k) => {
                            rowData[`size${k + 1}`] = Math.round((currentShipping.units * r) / rowData.qtyXInner);
                            rowData.orderQtys += rowData[`size${k + 1}`];
                        });
                        rowData.qtyTotalXMaster = Math.round(rowData.orderQtys / (rowData.qtyXInner * rowData.qtyXMaster));
                        rowData.cbm = styleData.cbm ? styleData.cbm * rowData.qtyXMaster * rowData.qtyXInner : 0;
                        rowData.total_cbm = rowData.cbm !== 0 ? rowData.cbm * rowData.qtyTotalXMaster : 0;
                        rowData.fobValue = `USD ${parseFloat(styleDetails.fob.toString())?.toFixed(2).replace('.', ',') || 'No Ingresado'}`;
                        rowData.total_fob = styleDetails.fob ? parseFloat((rowData.orderQtys * styleDetails.fob).toFixed(2)) : 'No ingresado';
                        sheetTotal += rowData.orderQtys;

                        sheetStyles.push({
                            range: {
                                s: { r: rows.length, c: 0 },
                                e: { r: rows.length, c: bodyHeaders.length },
                            },
                            style: {
                                alignment: { horizontal: 'center' },
                                top: { style: 'thin' },
                                right: { style: 'thick' },
                            },
                        });

                        bodyHeaders.forEach((header, headerIndex) => {
                            row.push(_.property(header.mapfn)(rowData));
                            // format to cells
                            if (header.footerTotal) {
                                cellFormats.push({
                                    address: { r: rows.length, c: headerIndex },
                                    /*format: {
                                        z: '#,##0',
                                    },*/
                                });
                            }
                        });
                        // Si total quantity es > 0 agregamos fila al reporte
                        if (row[18] > 0) { rows.push(row); }
                    }
                }
                // thick border in body
                sheetStyles.push({
                    range: {
                        s: { r: 16, c: 0 },
                        e: { r: rows.length, c: bodyHeaders.length - 1 },
                    },
                    style: {
                        bottom: { style: 'thick' },
                        top: { style: 'thick' },
                        left: { style: 'thick' },
                        right: { style: 'thick' },
                    },
                });

                // BODY TOTALS
                rows.push([
                    ...bodyHeaders.map((header, headerIndex) => {
                        const currentRow = rows.length;
                        const startDataRowIndex = 16;
                        const range = {
                            s: { c: headerIndex + 1, r: startDataRowIndex },
                            e: { c: headerIndex + 1, r: currentRow - 1 },
                        };

                        if (header.footerTotal) {
                            // format to cells
                            cellFormats.push({
                                address: { r: currentRow, c: headerIndex },
                                /*format: {
                                    z: '#,##0',
                                },*/
                            });
                            // sum of values
                            sheetFunctions.push({
                                address: { c: headerIndex + 1, r: currentRow },
                                fn: (sheetTotal > 0) ? `+SUM(${XLSX.utils.encode_range(range)})` : `=0`,
                            });
                        }
                        if (header.alias) {
                            if (!functionAliases[piNameShipment]) {
                                functionAliases[piNameShipment] = {};
                            }
                            functionAliases[piNameShipment][header.alias] = XLSX.utils.encode_cell({ c: headerIndex + 1, r: currentRow });
                        }

                        sheetStyles.push({
                            address: { c: headerIndex, r: currentRow },
                            style: {
                                bold: true,
                                sz: 12,
                                alignment: { horizontal: 'center' },
                                fgColor: { rgb: 0xafc0db },
                                top: { style: 'thick' },
                                bottom: { style: 'thick' },
                            },
                        });
                        return '';
                    }),
                ]);

                // PAYMENT HEADERS
                paymentHeaders.forEach((header, headerIndex) => {
                    const currentRow = rows.length;
                    const value = _.property(header.mapfn)(dataPaymentHearders);

                    if (header.type === 'empty_line') {
                        rows.push(_.range(0, 24).map(x => ''));

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                    } else {
                        rows.push([header.title, '', '', value || '', '', '']);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 2 },
                        });

                        sheetMerges.push({
                            s: { r: currentRow, c: 3 },
                            e: { r: currentRow, c: 5 },
                        });

                        _.range(0, 3).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    bold: true,
                                    sz: 12,
                                    fgColor: { rgb: 0xafc0db },
                                    alignment: { horizontal: 'left' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });

                        _.range(3, 6).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    // bold: true,
                                    sz: 12,
                                    alignment: { horizontal: 'left' },
                                    top: { style: 'thin' },
                                    right: { style: 'thick' },
                                },
                            });
                        });
                    }
                });

                sheetStyles.push({
                    range: {
                        s: { r: rows.length - 2, c: 0 },
                        e: { r: rows.length - 1, c: 5 },
                    },
                    style: {
                        top: { style: 'thick' },
                        left: { style: 'thick' },
                        bottom: { style: 'thick' },
                        right: { style: 'thick' },
                    },
                });

                // SHIPMENT CONDITIONS HEADERS
                conditionsHeaders.forEach((header, headerIndex) => {
                    const currentRow = rows.length;

                    if (header.type === 'empty_line') {
                        rows.push([..._.range(0, 24).map(x => '')]);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                    } else if (header.type === 'title') {
                        rows.push([header.title, '', '']);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 2 },
                        });

                        _.range(0, 3).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    bold: true,
                                    sz: 12,
                                    alignment: { horizontal: 'left' },
                                },
                            });
                        });
                    } else {
                        rows.push([header.title, '', '']);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 2 },
                        });

                        _.range(0, 3).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    sz: 12,
                                    alignment: { horizontal: 'left' },
                                },
                            });
                        });
                    }
                });

                // SUPPLIER'S AUTHORIZED HEARDES
                supplierAuthorizedHearder.forEach((header, headerIndex) => {
                    const currentRow = rows.length;

                    if (header.type === 'empty_line') {
                        rows.push([..._.range(0, 24).map(x => '')]);
                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 24 },
                        });
                    } else if (header.type === 'title') {
                        rows.push(['', '', '', header.title, '', '']);

                        sheetMerges.push({
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 2 },
                        });

                        sheetMerges.push({
                            s: { r: currentRow, c: 3 },
                            e: { r: currentRow, c: 5 },
                        });

                        _.range(3, 6).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { r: currentRow, c: columnIdx },
                                style: {
                                    bold: true,
                                    sz: 14,
                                    alignment: { horizontal: 'center' },
                                    top: { style: 'thick' },
                                },
                            });
                        });
                    }
                });

                // CENCOSUD AUTHORIZED HEADERS
                let startRowAuthorized = rows.length - 1;
                const startColumnAuthorized = 16;
                cencosudAuthorizedHearder.forEach((header, headerIndex) => {
                    if (header.type === 'title') {
                        _.range(0, 7).forEach(i => {
                            if (i === 0) {
                                rows[startRowAuthorized][startColumnAuthorized] = header.title;
                            } else {
                                rows[startRowAuthorized][startColumnAuthorized + i] = '';
                            }
                        });
                        sheetMerges.push({
                            s: { r: startRowAuthorized, c: startColumnAuthorized },
                            e: { r: startRowAuthorized, c: startColumnAuthorized + 6 },
                        });

                        _.range(
                            startColumnAuthorized,
                            startColumnAuthorized + 7,
                        ).forEach(columnIdx => {
                            sheetStyles.push({
                                address: { c: columnIdx, r: startRowAuthorized },
                                style: {
                                    bold: true,
                                    sz: 14,
                                    alignment: { horizontal: 'center' },
                                    top: { style: 'thick' },
                                },
                            });
                        });
                    }

                    startRowAuthorized++;
                });

                const rowsAdd = rows.reduce((acc, row) => {
                    row.unshift('');
                    acc.push(row);
                    return acc;
                }, []);

                // CREATING WORKBOOK
                const workbookSheet = XLSX.utils.aoa_to_sheet(rowsAdd);

                // apply styles to sheet
                sheetStyles.forEach(item => {
                    if (item.range) {
                        item.range.e.c += 1;
                        item.range.s.c += 1;
                        const rangeAddress = XLSX.utils.encode_range(item.range);
                        XLSX.utils.sheet_set_range_style(workbookSheet, rangeAddress, item.style);
                    } else if (item.address) {
                        item.address.c += 1;
                        const cellAddress = XLSX.utils.encode_cell(item.address);
                        XLSX.utils.sheet_set_range_style(
                            workbookSheet,
                            cellAddress,
                            item.style,
                        );
                    } else if (item.row) {
                        // if (!sheet['!rows']) {
                        workbookSheet['!rows'] = [];
                        // }
                        workbookSheet['!rows'][item.row] = item.style;
                    }
                });

                // apply functions to sheet
                sheetFunctions.forEach(item => {
                    // console.log('Item: ', item)
                    // item.address.c += 1;
                    workbookSheet[XLSX.utils.encode_cell(item.address)].f = item.fn;
                });

                // apply format to cells
                cellFormats.forEach(cellFormat => {
                    cellFormat.address.c += 1;
                    const cellName = XLSX.utils.encode_cell(cellFormat.address);

                    if (workbookSheet[cellName]) {
                        workbookSheet[cellName] = {
                            ...workbookSheet[cellName],
                            ...cellFormat.format,
                        };
                    } else {
                        workbookSheet[cellName] = { v: 0, t: 'n', ...cellFormat.format };
                    }
                });

                // merge rows and/or columns
                const sheetMergesAdd = sheetMerges.map(sh => ({ e: { r: sh.e.r, c: sh.e.c + 1 }, s: { r: sh.s.r, c: sh.s.c + 1 } }));
                workbookSheet['!merges'] = sheetMergesAdd;

                // column props
                workbookSheet['!cols'] = sheetColumns;

                // row props
                workbookSheet['!rows'] = sheetRows;

                sheets.push({ book: workBook, sheet: workbookSheet, name: piNameShipment });
            } //);

            /***********************************
                *          SUMMARY SHEET          *
                ***********************************/

            // add headers to summary
            summaryRows.push(summaryHeaders.map(x => x.title));

            // add styles to headers
            summaryStyles.push({
                range: {
                    s: { r: 0, c: 0 },
                    e: { r: 0, c: 3 },
                },
                style: {
                    bold: true,
                    sz: 14,
                    alignment: { horizontal: 'center' },
                    fgColor: { rgb: 0xafc0db },
                    top: { style: 'thick' },
                    right: { style: 'thick' },
                    bottom: { style: 'thick' },
                    left: { style: 'thick' },
                },
            });

            // summary references to sheets
            _.each(functionAliases, (aliases, piNameAlias) => {
                const row = [];
                const currentRow = summaryRows.length;
                summaryHeaders.forEach((header, headerIndex) => {
                    const value = _.property(header.mapfn)({ piNameAlias, ...aliases });

                    if (header.ref) {
                        row.push('');
                        summaryFunctions.push({
                            address: { c: headerIndex, r: summaryRows.length },
                            fn: `${piNameAlias}!${value}`,
                        });

                        summaryStyles.push({
                            range: {
                                s: { r: currentRow, c: 0 },
                                e: { r: currentRow, c: 3 },
                            },
                            style: {
                                sz: 12,
                                alignment: { horizontal: 'center' },
                                top: { style: 'thin' },
                                right: { style: 'thick' },
                                left: { style: 'thick' },
                            },
                        });

                        if (header.format) {
                            summaryCellsFormats.push({
                                address: { r: currentRow, c: headerIndex },
                                /*format: {
                                    z: '#,##0',
                                },*/
                            });
                        }
                    } else {
                        row.push(value);
                    }
                });

                summaryRows.push(row);
            });

            // summary totals
            summaryRows.push([
                ...summaryHeaders.map((header, headerIndex) => {
                    const currentRow = summaryRows.length;
                    const startDataRowIndex = 1;
                    const range = {
                        s: { c: headerIndex, r: startDataRowIndex },
                        e: { c: headerIndex, r: currentRow - 1 },
                    };

                    if (header.ref) {
                        summaryFunctions.push({
                            address: { c: headerIndex, r: currentRow },
                            fn: `+SUM(${XLSX.utils.encode_range(range)})`,
                        });

                        if (header.format) {
                            summaryCellsFormats.push({
                                address: { r: currentRow, c: headerIndex },
                            });
                        }
                    }

                    summaryStyles.push({
                        range: {
                            s: { r: currentRow, c: 0 },
                            e: { r: currentRow, c: 3 },
                        },
                        style: {
                            bold: true,
                            sz: 14,
                            alignment: { horizontal: 'center' },
                            fgColor: { rgb: 0xafc0db },
                            top: { style: 'thick' },
                            right: { style: 'thick' },
                            bottom: { style: 'thick' },
                            left: { style: 'thick' },
                        },
                    });
                    return '';
                }),
            ]);

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);

            // apply styles to summary
            summaryStyles.forEach(item => {
                if (item.range) {
                    const rangeAddress = XLSX.utils.encode_range(item.range);
                    XLSX.utils.sheet_set_range_style(
                        summarySheet,
                        rangeAddress,
                        item.style,
                    );
                } else if (item.address) {
                    const cellAddress = XLSX.utils.encode_cell(item.address);
                    XLSX.utils.sheet_set_range_style(
                        summarySheet,
                        cellAddress,
                        item.style,
                    );
                } else if (item.row) {
                    summarySheet['!rows'] = [];
                    summarySheet['!rows'][item.row] = item.style;
                }
            });

            // apply functions to summary
            summaryFunctions.forEach(item => {
                summarySheet[XLSX.utils.encode_cell(item.address)].f = item.fn;
            });

            // apply format to cells summary
            summaryCellsFormats.forEach(cellFormat => {
                const summaryCellName = XLSX.utils.encode_cell(cellFormat.address);

                if (summarySheet[summaryCellName]) {
                    summarySheet[summaryCellName] = {
                        ...summarySheet[summaryCellName],
                        ...cellFormat.format,
                    };
                } else {
                    summarySheet[summaryCellName] = {
                        v: 0,
                        t: 'n',
                        ...cellFormat.format,
                    };
                }
            });

            // column props
            summarySheet['!cols'] = summarySheetColumns;

            XLSX.utils.book_append_sheet(workBook, summarySheet, 'RESUMEN');
            sheets.map(sheet => {
                XLSX.utils.book_append_sheet(sheet.book, sheet.sheet, sheet.name);
            });
            const file = XLSX.write(workBook, {
                bookType: 'xlsx', bookSST: false,
                type: 'buffer',
                cellStyles: true,
            });

            const bufferFile = Buffer.from(file, 'utf8');
            const name = `PI_${piName}_${uuidv4()}.xlsx`;
            this.s3.putObject(
                {
                    Bucket: this.AWS_S3_BUCKET_NAME,
                    Body: bufferFile,
                    Key: `reports/${name}`,
                    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
                async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                    if (error) {
                        this.logger.error(`Error cargando el archivo de reporte: ${error}`);
                        // return '';
                    } else {
                        const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${name}`, Expires: 10800 }; // 3 HR
                        const url = this.s3.getSignedUrl('getObject', params);
                        requestReport.status = 'Complete';
                        requestReport.url = url;
                        requestReport.name = `PI_${piName}`;
                        await this.requestReporRepository.save(requestReport);

                        // if (!this.proformsInvoiceUrls.has(userId)) {
                        //     this.proformsInvoiceUrls.set(userId, [{ status: 'Complete', url, name: `PI_${piName}` }]);
                        // } else {
                        //     const dataPIReport = this.proformsInvoiceUrls.get(userId).find(p => p.name === `PI_${piName}`);
                        //     dataPIReport.status = 'Complete';
                        //     dataPIReport.url = url;
                        // }
                        this.logger.debug(`Generate Report PI name: ${piName} from user: ${userId} url: ${url}`, 'generatePIReport:end');

                    }
                },
            );
        }

        // SEND Notification By Purchase
        const purchaseCreatorsIds = _.uniqBy(purchaseStyles.map(p => ({ purchaseId: p.purchaseStore.purchase.id, purchaseDescription: p.purchaseStore.purchase.name, departments: p.purchaseStore.purchase.departments, userId: p.purchaseStore.purchase.userId, merchantsUsersId: p.details[0].merchandiser })), 'purchaseId');
        for (const purchase of purchaseCreatorsIds) {
            const notification =
            {
                description: `PI generada para la compra ${purchase.purchaseDescription}`,
                notificationType: NotificationTypeEnum.PiCreation,
                originUserId: user.id,
                creatorPurchaseUserId: purchase.userId,
                merchantUserId: parseInt(purchase.merchantsUsersId, null),
                departmentsRelated: purchase.departments.join(','),
            };
            this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification),);
        }
    }

    // Require purchases on Approved Status
    async generatePurchaseOrderReport(dto: FilterApprovalDto, userId: number) {
        try
        {
            this.logger.debug(`Generate Report Purchase Orders from user ${userId}`, 'generatePurchaseOrders: start');
            const subscriptionId = dto.subscriptionId;
            const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);
            
            // Metodo para generar los arrivalDates
            // const body : generateArrivalDatesDto = {
            //     purchaseStyleIds: purchaseStyles.map(ps => ps.id)
            // }
            // const purchaseStyleColorShippments = await this.purchaseService.updateArrivalDates(body);
    
            if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
                const requestReport = this.getNewRequestReport({ status: 'No Data', url: '', name: '', subscriptionId, userId, reportType: ReportType.PurchaseOrder });
                await this.requestReporRepository.save(requestReport);
                return null;
            }
    
            const shippingsGrouped = _.groupBy(_.flatten(_.flatten(purchaseStyles.map(p => p.colors.map(c => c.shippings.map(sh => ({
                ...sh,
                // arrivalDate: purchaseStyleColorShippments.find(item => item.id === sh.id).arrivalDate,
                styleId: p.styleId,
                styleColorId: c.styleColorId,
                userId: p.purchaseStore.purchase.userId,
                store: p.purchaseStore.store,
                // details: p.details[0],
                ratio: p.details[0].ratio.ratio,
                providerId: p.details[0].provider.id,
                providerJdaCode: p.details[0].provider.codeJda,
                providerName: p.details[0].provider.name,
                providerPaymentTerms: p.details[0].provider.paymentTerm1,
                dollarChange: p.details[0].dollarChange,
                importFactor: p.details[0].importFactor,
                transitDays: p.details[0].origin.transitDays,
                exitPortJda: p.details[0].exitPort.jdaCode,
                shippingMethodJda: p.details[0].shippingMethod.jdaCode,
                codeOC: p.purchaseStore.purchase.seasonCommercial.codeOC,
            })))))), 'piName');
    
            const usersIds = _.uniq(purchaseStyles.map(p => p.purchaseStore.purchase.userId)) as number[];
            const departments = _.uniq(_.flatten(purchaseStyles.map(p => p.purchaseStore.purchase.departments))) as number[];
            const styleIds = stylesData.map(s => s.id) as number[];
            const users = await this.securityProxyService.getUsers({ ids: usersIds, roles: null, departments: null });
            const usersManagers = await this.securityProxyService.getUsers({ ids: null, roles: [RoleType.DivisionManager], departments });
            const stylesSkus = await this.skuService.getSkuByStyle(styleIds);
            const paymentTerms = await this.paymentTermsProxyService.getAll();
            const response = [];
    
            const tpStore = await this.storeService.getByShortName('TP');
            const brandJdaCodes = ['FOSTER','LEGACY','UMBRAL','UMBRBE','UWOMAN','JJO'];
            for (const piName of Object.keys(shippingsGrouped)) {
                const stylesShippings = shippingsGrouped[piName];
                const styleProviderNameReference = stylesShippings[0].providerName;
                const styleDataReference = stylesData.find(s => s.id === stylesShippings[0].styleId);
    
                const ocNameFile = `OIA${styleDataReference.brandCode}${stylesShippings[0].shipping}${(Math.random() * 1000).toFixed().padStart(3, '0')}`;
                response.push({ piName, ocNameFile });
    
                const requestReport = this.getNewRequestReport({ 
                    status: 'Pending', url: '', 
                    name: `${ocNameFile} - ${styleDataReference.brand} - ${styleDataReference.department} - ${styleProviderNameReference}`,
                    subscriptionId,
                    userId, reportType: ReportType.PurchaseOrder 
                });
                await this.requestReporRepository.save(requestReport);
    
                const dataToExport = _.flatten(stylesShippings.map(style => {
                    const userPurchase = users.find(u => u.id === style.userId);
                    const styleData = stylesData.find(s => s.id === style.styleId);
                    const divisionalManager = usersManagers.find(u => u.departments.indexOf(styleData.departmentId) !== -1);
                    const paymentTerm = paymentTerms.find(pt => pt.name === style.providerPaymentTerms);
                    const totalUnits = style.units;
                    const sumRatio = style.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b) as number;
                    const sku = stylesSkus.find(sku => sku.styleId === style.styleId && sku.provider.id === style.providerId);
                    if(!sku){
                        this.logger.debug(`styleId ${style.styleId} and providerId ${style.providerId} doesn't match with any SKU`, 'generatePurchaseOrder');
                    }
                    const skuColor = sku?.skuColor.find(color => color.styleColorId === style.styleColorId);
                    
                    let channel = 1;
                    let localCode = style.store.localCode;
                    if (tpStore && tpStore.length > 0 && style.store.shortName === 'PW' && brandJdaCodes.filter(c => c === styleData.brandJdaCode).length > 0) {
                        localCode = _.first(tpStore)?.localCode;
                        channel = 4;
                    }
                    if (style.store.shortName === 'TP') {
                        channel = 4;
                    }
                    if (skuColor) {
                        return skuColor.skuColorSize.map(skuColorSize => {
                            if (skuColorSize) {
                            const units = (totalUnits/sumRatio)*skuColorSize.ratio;
                            return {
                                channel,
                                localCode,
                                providerJdaCode: style.providerJdaCode,
                                sku: skuColorSize.sku,
                                ean: '',
                                units: units,
                                dollarChange: style.dollarChange,
                                importFactor: style.importFactor.replace('.', ','), // jda required format
                                SWTQA: 'R',
                                shipmentDate: moment(style.date).format('YYYYMMDD'),
                                arrivalDate: moment(style.arrivalDate).format('YYYYMMDD'),
                                paymentMethodProviderCode: paymentTerm ? paymentTerm.jdaCode : '',
                                codeTermns: '002', // FOB always
                                exitPortJdaCode: style.exitPortJda,
                                shipmentDate2: moment(style.date).format('YYYYMMDD'),
                                purchaserUserName: userPurchase ? `${userPurchase.firstName} ${userPurchase.lastName}` : 'no define',
                                purchaseUserGteDivision: divisionalManager ? `${divisionalManager.firstName} ${divisionalManager.lastName}` : 'no define',
                                conctactName: 'CONTACTO',
                                contactEmail: 'contacto@contacto.com',
                                chargeVolume: (units * styleData.cbm).toFixed(2).replace('.', ','), // jda required format
                                measureUnit: 'M3', // M3
                                containerType1: '',
                                containerDesc1: '',
                                containerType2: '',
                                containerDesc2: '',
                                containerType3: '',
                                containerDesc3: '',
                                quantity1: '',
                                quantity2: '',
                                quantity3: '',
                                ocMother: '',
                                piName: style.piName,
                                shippingMethodJDACode: style.shippingMethodJda,
                                coinsType: '01', // 01 DOLLAR
                                seasonOCCode: style.codeOC,
                                lastSeparator: '',
                            };
                        }
                        });
                    } else {
                        return null;
                    }
                }));
                if (dataToExport.length > 0) {
                    /* make the worksheet */
                    const cleanData = [...dataToExport].filter(item => item !== null);
                    const ws = XLSX.utils.json_to_sheet([...cleanData], { skipHeader: true });
                    
                    /* write workbook (use type 'binary') */
                    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\r\n' });
                    const bufferFile = Buffer.from(csv, 'utf8');
                    const name = `${ocNameFile}.csv`;
                    await this.s3.putObject(
                        {
                            Bucket: this.AWS_S3_BUCKET_NAME,
                            Body: bufferFile,
                            Key: `reports/${name}`,
                            ContentType: 'text/csv',
                        },
                        async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                            try {
                                    const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${name}`, Expires: 10800 }; // 3 HR
                                    const url = await this.s3.getSignedUrl('getObject', params);
                                    requestReport.status = 'Complete';
                                    requestReport.url = url;
                                    //requestReport.name = `${ocNameFile}-${piName}`;
                                    await this.requestReporRepository.save(requestReport);
                                    // this.logger.debug(`Generate Purchase Order: ${piName} from user: ${userId} url: ${url}`, 'generatePurchaseOrder:end');
                                    //
                            } catch (error) {
                                this.logger.error(`CATCH Error cargando el archivo de reporte: ${error}`);    
                            }
                        },
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Ha ocurrido un error: ${error}`);
            throw new InternalServerErrorException();
        }
    }

    async generateProductEnhancementReport(dto: FilterApprovalDto, userId: number) {
        try {
            this.logger.debug(`Generate Report Product Enhancement from user ${userId}`, 'generateProductEnhancementReport: start');
            const subscriptionId = dto.subscriptionId;
            const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStyleEnhancementByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);
            
            const styleIds = _.uniq(purchaseStyles.map(p => p.styleId)) as number[];
            const allStyleSkus = await this.skuService.getSkuByStyle(styleIds);
            const attributes = await this.styleProxyService.getAttributes();

            if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) {
                const requestReport = this.getNewRequestReport({ status: 'No Data', url: '', name: '', subscriptionId, userId, reportType: ReportType.ProductEnhancement });
                await this.requestReporRepository.save(requestReport);
                return null;
            }
            const requestReport = this.getNewRequestReport({ status: 'Pending', url: '', name: '', subscriptionId, userId, reportType: ReportType.ProductEnhancement});

            const headers = {
                division: 'DIVISION',
                style: 'DESC ESTILO',
                entrance: 'ENTRADA - LC WEB',
                id: 'ID',
                name: 'NOMBRE DEL PRODUCTO',
                shortDescription: 'DESCRIPCION CORTA',
                brand: 'MARCA CORRECTA',
                product: 'PRODUCTO',
                tipoProducto: 'TIPO DE PRODUCTO',
                material: 'MATERIAL',
                composicionMaterial: 'COMPOSICION MATERIAL',
                genero: 'GENERO',
                diseno: 'DISEÑO',
                garantia: 'GARANTIA',
                tipoCierre: 'TIPO DE CIERRE',
                corteCuelloHombro: 'CORTE CUELLO-HOMBRO',
                tipoManga: 'TIPO DE MANGA',
                estiloCalceFit: 'ESTILO CALCE-FIT',
                estiloTiroBottom: 'ESTILO TIRO BOTTOMS',
                largoFaldaVestido: 'LARGO FALDA-VESTIDO',
                largoPierna: 'LARGO DE PIERNA (CM)',
                largoManga: 'LARGO DE MANGA (CM)',
                largoTops: 'LARGO DE TOPS (CM)',
                origen: 'ORIGEN',
                cantidadDePiezas: 'CANTIDAD DE PIEZAS',
                incluye: 'INCLUYE',
                descripcionTecnologica: 'DESCRIPCION TECNOLOGICA',
                resistenciaAlViento: 'RESISTENCIA AL VIENTO',
                consejosDeUso: 'CONSEJOS DE USO',
                informacionDestacada: 'INFORMACION DESTACADA O ADICIONAL',
                productoSustentable: 'PRODUCTO SUSTENTABLE',
                caracteristicaSustentable: 'CARACTERISTICA SUSTENTABLE',
                fibraSustentable: 'FIBRA SUSTENTABLE',
                size: 'SIZE CHILE',
                waterproof: 'WATERPROOF',
                capellada: 'CAPELLADA',
                forro: 'FORRO',
                suela: 'SUELA',
                tipoTaco: 'TIPO TACO',
                altoDelTaco: 'ALTO DEL TACO (CM)',
                fitLargoCana: 'FIT (LARGO/CAÑA)',
                color: 'COLOR',
                modelo: 'MODELO',
                dimensiones: 'DIMENSIONES'
            };

            attributes.forEach(a => {
                if (!headers[a.prop]) {
                    headers[a.prop] = a.attributeName;
                }
            });

            const dataToExport = [];
            for (const style of stylesData) {
                const purchaseStyle = purchaseStyles.find(p => p.styleId === style.styleId);
                const firsDeliveryDate = _.flatten(purchaseStyle.colors.map(color => color.shippings))
                    .map(s => s.date).sort((a, b) => a.getTime() - b.getTime())[0];

                const styleCode = style.code ? style.code : '';
                const brand = style.brand ? style.brand : '';
                const productType = style.articleType;
                const design = style.attributes?.diseno ? style.attributes.diseno : '';
                const material = style.attributes?.material ? style.attributes.material : '';
                const tiroFitCorteManga = style.attributes?.tiroFitCorteManga ? style.attributes.tiroFitCorteManga : '';

                const rowStyleData = {
                    division: style.division,
                    style: styleCode,
                    entrance: firsDeliveryDate,
                    name: `${productType} ${design} ${tiroFitCorteManga} ${brand}`,
                    shortDescription: `${productType} ${material} ${design} ${styleCode} ${brand}`,
                    brand: brand,
                    product: productType,
                    tipoProducto: productType,
                    material: material,
                    composicionMaterial: style.attributes?.composicionMaterial,
                    genero: style.attributes?.genero,
                    diseno: design,
                    garantia: style.attributes?.garantia,
                    tipoCierre: style.attributes?.tipoCierre,
                    corteCuelloHombro: style.attributes?.corteCuelloHombro,
                    tipoManga: style.attributes?.tipoManga,
                    estiloCalceFit: style.attributes?.estiloCalceFit,
                    estiloTiroBottom: style.attributes?.estiloTiroBottom,
                    largoFaldaVestido: style.attributes?.largoFaldaVestido,
                    largoPierna: style.attributes?.largoPierna,
                    largoManga: style.attributes?.largoManga,
                    largoTops: style.attributes?.largoTops,
                    origen: purchaseStyle.details[0].origin.name,
                    cantidadDePiezas: style.attributes?.cantidadDePiezas,
                    incluye: style.attributes?.incluye,
                    descripcionTecnologica: style.attributes?.descripcionTecnologica,
                    resistenciaAlViento: style.attributes?.resistenciaAlViento,
                    consejosDeUso: style.attributes?.consejosDeUso,
                    informacionDestacada: style.attributes?.informacionDestacada,
                    productoSustentable: style.attributes?.productoSustentable,
                    caracteristicaSustentable: style.attributes?.caracteristicaSustentable,
                    fibraSustentable: style.attributes?.fibraSustentable,
                    waterproof: style.attributes?.waterproof,
                    capellada: style.attributes?.capellada,
                    forro: style.attributes?.forro,
                    suela: style.attributes?.suela,
                    tipoTaco: style.attributes?.tipoTaco,
                    altoDelTaco: style.attributes?.altoDelTaco,
                    fitLargoCana: style.attributes?.fitLargoCana,
                    modelo: style.attributes?.modelo,
                    dimensiones: style.attributes?.dimensiones,
                };

                const sku = allStyleSkus.find(sku => sku.styleId === style.styleId);

                if (sku) {
                    const skuColors = sku?.skuColor;
                    for (const color of skuColors) {
                        const skuColorSize = color?.skuColorSize;
                        for (const size of skuColorSize) {
                            dataToExport.push({
                                id: size.sku,
                                size: size.sizeJda.shortName,
                                color: color.shortName,
                                ...rowStyleData,
                            })
                        }
                    }
                } else {
                    dataToExport.push(rowStyleData);
                }
            }
   
            if (dataToExport.length > 0) {
                /* make the worksheet */
                const cleanData = [headers, ...dataToExport].filter(item => item !== null);
                const ws = XLSX.utils.json_to_sheet([...cleanData], { skipHeader: true });
                
                /* write workbook (use type 'binary') */
                const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\r\n' });
                const bufferFile = Buffer.from(csv, 'latin1');
                const name = `Enriquecimiento_productos_${uuidv4()}.csv`;
                await this.s3.putObject(
                    {
                        Bucket: this.AWS_S3_BUCKET_NAME,
                        Body: bufferFile,
                        Key: `reports/${name}`,
                        ContentType: 'text/csv',
                    },
                    async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                        try {
                                const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${name}`, Expires: 10800 }; // 3 HR
                                const url = await this.s3.getSignedUrl('getObject', params);
                                requestReport.status = 'Complete';
                                requestReport.url = url;
                                requestReport.name = name;
                                await this.requestReporRepository.save(requestReport);
                        } catch (error) {
                            this.logger.error(`CATCH Error cargando el archivo de reporte: ${error}`);    
                        }
                    },
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}