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
    public iva = 0.19;

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
}