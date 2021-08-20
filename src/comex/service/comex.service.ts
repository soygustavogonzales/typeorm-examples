import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import { ConfigService } from 'nestjs-config';
import * as AWS from 'aws-sdk';
import moment = require('moment');
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityProxyService } from '../../external-services/security-proxy/security-proxy.service';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { AwsS3 } from '../../shared/class/AwsS3';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { Status } from '../../shared/enums/status.enum';
import { DateRangeDto } from '../../shared/dtos/dateRange.dto';


@Injectable()
export class ComexService {
    private logger = new Logger('ComexService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;

    constructor(
        @InjectRepository(PurchaseStyle)
        private readonly purchaseStyleRepository: Repository<PurchaseStyle>,
        private securityProxyService: SecurityProxyService,
        private styleProxyService: StyleProxyService,
        private config: ConfigService,
        ) {
            this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
            AWS.config.update({
                accessKeyId: this.config.get('aws').aws_access_key_id,
                secretAccessKey: this.config.get('aws').aws_secret_access_key,
            });
            this.s3 = new AWS.S3();
        }

    async generateComexPurchaseReport(range: DateRangeDto): Promise<boolean> {
        try {
            let startDate = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss')
            let endDate = moment().format('YYYY-MM-DD HH:mm:ss')
            if (range) {
                if (range.start) {
                    startDate = moment(range.start).format('YYYY-MM-DD HH:mm:ss');
                }
                if (range.end) {
                    endDate = moment(range.end).format('YYYY-MM-DD HH:mm:ss');
                }
            }

            let query = this.purchaseStyleRepository
                .createQueryBuilder('purchaseStyle')
                .leftJoin('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoin('purchaseStore.store', 'store')
                .leftJoin('purchaseStore.purchase', 'purchase')
                .leftJoin('purchase.status', 'purchaseStatus')
                .leftJoin('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoin('purchaseStyle.details', 'details')
                .leftJoin('details.shippingMethod', 'shippingMethod')
                .leftJoin('details.provider', 'provider')
                .leftJoin('details.origin', 'origin')
                .leftJoin('details.packingMethod', 'packingMethod')
                .leftJoin('details.exitPort', 'exitPort')
                .leftJoin('details.size', 'size')
                .leftJoin('details.ratio', 'ratio')
                .leftJoin('purchaseStyle.colors', 'colors')
                .leftJoin('colors.shippings', 'shippings')
                .innerJoin('OcJda', 'ocJda', 'shippings.piName = ocJda.piname')
                .innerJoin('Sku', 'sku', 'purchaseStyle.styleId = sku.styleId AND details.provider = sku.provider')
                .leftJoin('sku.skuColor', 'skuColor', 'skuColor.styleColorId = colors.styleColorId')
                .leftJoin('skuColor.skuColorSize', 'skuColorSize')
                .leftJoin('skuColorSize.sizeJda', 'skuSizeJda')
                .where({ active: true })
                .andWhere('purchaseStyle.deleteDate IS NULL')
                .andWhere('purchaseStore.deleteDate IS NULL')
                .andWhere('purchase.deleteDate IS NULL')
                .andWhere('colors.state = true')
                .andWhere(new Brackets((qb) => {
                    qb = qb.orWhere(`ocJda.potpid = 'I'`);
                    qb = qb.orWhere(`ocJda.potpid IS NULL`);
                }))
                .andWhere(`purchaseStatus.id IN (${Status.Approvement})`)
                .andWhere('shippings.units > 0')
                .andWhere(`ocJda.updateDate BETWEEN '${startDate}' AND '${endDate}'`)
                .select('seasonCommercial.name', 'seasonCommercialName')
                .addSelect('purchaseStyle.styleId', 'styleId')
                .addSelect('ocJda.ponumb', 'oc')
                .addSelect('CONCAT(store.impnumpfx, (SELECT LEFT("ocJda"."poedat"::TEXT, 4)), ocJda.ponumb)', 'impCode')
                .addSelect('ocJda.piname', 'piName')
                .addSelect('details.internetDescription', 'productDescription')
                .addSelect('details.composition', 'composition')
                .addSelect('provider.codeJda', 'providerCodeJda')
                .addSelect('provider.name', 'providerName')
                .addSelect('shippingMethod.name', 'shippingMethodName')
                .addSelect('origin.name', 'originName')
                .addSelect('exitPort.name', 'exitPortName')
                .addSelect('CONCAT(origin.shortName, exitPort.jdaCode)', 'polCode')
                .addSelect('shippings.date', 'deliveryDate')
                .addSelect('skuColorSize.ratio', 'inner')
                .addSelect('shippings.units', 'units')
                .addSelect('details.fob', 'fob')
                .addSelect('skuColorSize.sku', 'sku')
                .addSelect('details.price', 'price')
                .addSelect('provider.paymentTerm1', 'paymentTerm1')
                .addSelect('details.brandManager', 'brandManager')
                .addSelect('provider.address', 'providerAddress')
                .addSelect('provider.email', 'providerEmail')
                .addSelect('provider.paymentTerm2', 'paymentTerm2')
                .addSelect('shippings.arrivalDate', 'arrivalDate')
                .addSelect('details.atc', 'atc')
                .addSelect('skuColorSize.atc', 'atcId')
                .addSelect('details.collection', 'collection')
                .addSelect('packingMethod.name', 'packingMethod')
                .addSelect('details.dollarChange', 'dollarChange')
                .addSelect('details.importFactor', 'importFactor')
                .addSelect('details.productManager', 'productManager')
                .addSelect('skuSizeJda.shortName', 'skuSizeJdaShortName')
                .addSelect('skuColor.colorCode', 'skuColorCode')
                .addSelect('skuColor.styleColorId', 'styleColorId')
                .addSelect('ratio.ratio', 'ratio')
                .addSelect('size.size', 'size');            

            const queryResponse = await query.getRawMany();
            if (queryResponse.length === 0) { return true; }

            const stylesIds = _.uniq(queryResponse.map(x => x.styleId));
            const styles = {};
            const dataStyles = stylesIds.length > 0 ? await this.styleProxyService.getStylesDataByIdsBatch(stylesIds) : [];
            if (dataStyles.length > 0) {
                dataStyles.forEach(item => styles[item.id] = item);
            }

            const managers = queryResponse.map(p => p.productManager).concat(queryResponse.map(b => b.brandManager));
            const usersIds = _.uniq(managers.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const users = {};
            const securityUsers = usersIds.length > 0 ? await this.securityProxyService.getUsers({ ids: usersIds, departments: [], roles: [] }) : [];
            if (securityUsers.length > 0) {
                securityUsers.forEach(item => users[item.id] = item);
            }

            const skuOcs = _.chain(queryResponse).groupBy((data) => `${data.sku}_${data.oc}`).map((value, key) => {
                const arr = key.split('_');
                return { sku: arr[0], oc: arr[1], data: value[0] };
            }).value();

            let data = 'COLLECTION;REGIONAL ID;REGIONAL PO;INCOTERM;DESTINATION;DESTINATION CODE;INTERNAL REFERENCE (OC);PI NUMBER;SUB-CATEGORY;' +
                       'CATEGORY CODE;PRODUCT DESCRIPTION;COMPOSITION;VENDOR REFERENCE;VENDOR CODE;VENDOR;TRANSPORT MODE;ORIGIN;POL;POL CODE;' +
                       'LSD;UxC;TOTAL BOXES;TOTAL UNITS;CBM;FINAL PRICE;SKU;CURRENCY;DPTO;BU;BU CODE;EAN;DUN14;MODEL NUMBER;ENGLISH DESCRIPTION;' +
                       'BRAND;RETAIL PRICE;PAYMENT TERM;REGIONAL COORDINATOR;REGIONAL BUYER;APPROVAL CENTER;SEASON NAME;SEASON YEAR;CATEGORY;' +
                       'IS REGIONAL;DPTO SAP;DPTO SAP N°;CONTACTO;MAIL;PAYMENT;N1;NECESIDAD EN TIENDA;ID PF0;ATC;INNER PER MASTER;ATC ID;COLLECTION;' +
                       'PACKING METHOD;DOLLAR BOUGHT;IMPORT FACTOR;PRODUCT MANAGER;TALLA;COLOR;ID COLOR;RATIO;SIZE;CONT CERRADO SI/NO;LEAD TIME PRODUCTION\r\n';

            const currentYear = new Date().getFullYear();
            skuOcs.forEach(item => {
                let productManager = 'NO APLICA';
                if (item.data.productManager && item.data.productManager !== '-1') {
                    const user = users[item.data.productManager] ?? null;
                    productManager = user ? `${user.firstName} ${user.lastName}` : item.data.productManager;
                }
                let brandManager = 'NO APLICA';
                if (item.data.brandManager && item.data.brandManager !== '-1') {
                    const user = users[item.data.brandManager] ?? null;
                    brandManager = user ? `${user.firstName} ${user.lastName}` : item.data.brandManager;
                }

                const styleColors = styles[item.data.styleId]?.colors || [];
                const color = styleColors.find(c => c.id == item.data.styleColorId);

                const unitsPerInner = item.data.ratio ? item.data.ratio.split('-').map(x => parseInt(x, null)).reduce((a, b) => a + b) : 0;
                const totalUnits = (item.data.units / unitsPerInner) * item.data.inner;
                const unitsInner = totalUnits / item.data.inner;

                const deptoCode = styles[item.data.styleId]?.departmentCode || '';
                const deptoName = styles[item.data.styleId]?.department || '';

                data += `${item.data.seasonCommercialName};` +
                        `${deptoCode};` + 
                        `${item.oc};FOB;CHILE;CL;` + 
                        `${item.data.impCode};` + 
                        `${item.data.piName};` + 
                        `${deptoName};` + 
                        `${deptoCode};` + 
                        `${item.data.productDescription};` + 
                        `${item.data.composition};` + 
                        `${styles[item.data.styleId]?.code || ''};` + 
                        `${item.data.providerCodeJda};` + 
                        `${item.data.providerName};` + 
                        `${item.data.shippingMethodName};` + 
                        `${item.data.originName};` + 
                        `${item.data.exitPortName};` + 
                        `${item.data.polCode};` + 
                        `${item.data.deliveryDate ? moment(item.data.deliveryDate).format('MM/DD/YYYY') : ''};` + 
                        `${item.data.inner};` + 
                        `${unitsInner};` + 
                        `${totalUnits};` + 
                        `${styles[item.data.styleId]?.cbm || ''};` + 
                        `${item.data.fob};` + 
                        `${item.sku};USD;` + 
                        `${deptoName};PARIS;PCL_R;;;;;` + 
                        `${styles[item.data.styleId]?.brand || ''};` + 
                        `${item.data.price};` + 
                        `${item.data.paymentTerm1};JOCELYN SAEZ;` + 
                        `${brandManager};;` + 
                        `${item.data.seasonCommercialName};` + 
                        `${currentYear};` + 
                        `${styles[item.data.styleId]?.division || ''};Y;` + 
                        `${deptoName};` + 
                        `${deptoCode};` + 
                        `${item.data.providerAddress};` + 
                        `${item.data.providerEmail};` + 
                        `${item.data.paymentTerm2};;` + 
                        `${item.data.arrivalDate ? moment(item.data.arrivalDate).format('MM/DD/YYYY') : ''};;` + 
                        `${item.data.atc ? 'YES' : 'NO'};` + 
                        `${styles[item.data.styleId]?.divisionMaster || ''};` + 
                        `${item.data.atcId};` + 
                        `${item.data.collection};` + 
                        `${item.data.packingMethod};` + 
                        `${item.data.dollarChange};` + 
                        `${item.data.importFactor};` + 
                        `${productManager};` + 
                        `${item.data.skuSizeJdaShortName};` + 
                        `${color?.colorName || ''};` + 
                        `${item.data.skuColorCode};` + 
                        `${item.data.ratio};` + 
                        `${item.data.size};;\r\n`;              
            });

            const bufferFile = Buffer.from(data, 'utf8');
            const name = `PurchaseOrders_${moment(new Date()).format('YYYYMMDD')}.csv`;
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            S3.uploadFile(bufferFile, name, 'text/csv', 10800, this.logger, 'comex/export');            
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException();
        }
        return true;
    }
}