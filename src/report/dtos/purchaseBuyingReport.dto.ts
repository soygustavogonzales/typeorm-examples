import * as AWS from 'aws-sdk';
import { ConfigService } from 'nestjs-config';
import { Logger } from '@nestjs/common';
import { RequestReport } from '../../entities/requestReport.entity';
import * as XLSX from '@sheet/image';
import { v4 as uuidv4 } from 'uuid';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';

export abstract class PurchaseBuyingReport {
    public dataToExport = [];
    public headers = {};
    public reportName = 'Reporte_Ecosistema';
    public config: ConfigService;
    public reportUrl: string;
    private s3: AWS.S3;
    private AWS_S3_BUCKET_NAME: string;
    private logger = new Logger('ReportService');
    private requestReport: RequestReport;
    private bufferFile: any;

    protected abstract processData(purchaseStyles, stylesData, styleSkus, users, ocs, detailsData): void;

    public async sendNotification(userId: number): Promise<void> {
        const notificationPublisherService = new NotificationPublisherService(this.config);
        const notification = {
            description: `Reporte de compra generado <a href="${this.reportUrl}"><i class="fal fa-download"></i> Descargar</a>`,
            notificationType: NotificationTypeEnum.GeneracionReporte,
            originUserId: userId,
            creatorPurchaseUserId: -1,
            merchantUserId: -1,
            departmentsRelated: ''
        };
        const publication = await notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
    }

    public xlsxReport() {
        const workBook = XLSX.utils.book_new();
        const workBookName = XLSX.utils.json_to_sheet([this.headers, ...this.dataToExport], { skipHeader: true });
        XLSX.utils.book_append_sheet(workBook, workBookName, this.reportName);
        const file = XLSX.write(workBook, {
            bookType: 'xlsx', bookSST: false,
            type: 'buffer',
            cellStyles: true,
        });
        this.bufferFile = Buffer.from(file, 'utf8');
        this.reportName = `${this.reportName}_${uuidv4()}.xlsx`;
    }

    public async uploadReport(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
            AWS.config.update({
                accessKeyId: this.config.get('aws').aws_access_key_id,
                secretAccessKey: this.config.get('aws').aws_secret_access_key,
            });
            this.s3 = new AWS.S3();
            this.s3.putObject(
                {
                    Bucket: this.AWS_S3_BUCKET_NAME,
                    Body: this.bufferFile,
                    Key: `reports/${this.reportName}`,
                    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
                async (error: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                    if (error) {
                        this.logger.error(`Error cargando el archivo de reporte: ${error}`);
                        reject('Error al subir archivo');
                    } else {
                        const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${this.reportName}`, Expires: 10800 }; // 3 HR
                        this.reportUrl = this.s3.getSignedUrl('getObject', params);
                        resolve('Archivo cargado');
                    }
                },
            )
        });
    }
    public getImu(price: number, fob: number, importFactor: number, dollarChange:number, iva:number): number {
        // TODO: Calcular IMU en base al precio 
        // (( price / (1 + iva ) )-  fob * this.dollarChange * importFactor) / (price / (1 + iva)) *100
        // (( 24990 / (1 + 0.19) ) - 7.2 * 900               * 1.08        )/ (24990 / (1 + 0.19)) *100     ---->>> 66.67428
        // const iva = this.storeTabs[this.tabGroup.selectedIndex]?.destinyCountry.iva / 100 || 0;
        if (price && price !== 0 && price !== -1 && iva !== 0) {
          const responsePrice = ((price / (1 + iva)) - fob * dollarChange * importFactor) / (price / (1 + iva));
          return responsePrice;
        }
        return 0;
        // ((PRECIO / (1 + IMPUESTO PAIS)) - FOB * DÓLAR * FACTOR DE IMPORTACION ) /(PRECIO/(1 + IMPUESTO PAIS)
    }
    public getImuSato(sato: number, fob: number, importFactor: number, dollarChange:number, iva:number): number {
        // TODO: Calcular IMUSATO en base al precio sato 

        if (sato && sato !== 0 && sato !== -1 && iva !== 0) {
            const responseSato = ((sato / (1 + iva)) - fob * dollarChange * importFactor) / (sato / (1 + iva));
            return responseSato;
          }
      
          return 0;
        // ((PRECIO SATO/ (1 + IMPUESTO PAIS)) - FOB * DÓLAR * FACTOR DE IMPORTACION ) /(PRECIO SATO/(1 + IMPUESTO PAIS)
    }
}