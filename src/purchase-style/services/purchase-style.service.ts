import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In, Not } from 'typeorm';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';
import { StyleDetailDto } from '../../purchase/dtos/styleDetails.dto';
import { Size } from '../../entities/size.entity';
import { Ratio } from '../../entities/ratio.entity';
import { OriginCountry } from '../../entities/originCountry.entity';
import { Packaging } from '../../entities/packaging.entity';
import { Provider } from '../../entities/provider.entity';
import { Shipmethod } from '../../entities/shipmethod.entity';
import { Cso } from '../../entities/cso.entity';
import { Category } from '../../entities/category.entity';
import { ExitPort } from '../../entities/exitPort.entity';
import { Segment } from '../../entities/segment.entity';
import { Rse } from '../../entities/rse.entity';
import { SeasonSticker } from '../../entities/seasonSticker.entity';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { Status } from '../../shared/enums/status.enum';
import { FilterStyleModDto } from '../dtos/filterStyleMod.dto';
import { FilterTypeStyleMod } from '../dtos/filterTypeStyleMod.enum';
import { DetailsType } from '../../purchase/dtos/detailsType.enum';
import { GetPurchaseStyleToAdjustDto } from '../dtos/getPurchaseStyleToAdjust.dto';
import * as _ from 'lodash';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { FilterApprovalDto } from '../../purchase/dtos/filterApproval.dto';
import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import { ImportFactorService } from '../../maintainer/import-factor/service/import-factor.service';
import { DollarService } from '../../maintainer/dollar/service/dollar.service';
import { StatusPurchaseColor } from '../../entities/statusPurchaseColor.entity';
import { StatusPurchaseColorEnum } from '../../shared/enums/statusPurchaseColor.enum';
import { StoresEnum } from '../../shared/enums/stores.enum';
import { GetPurchaseStyleToNegotiate } from '../dtos/getPurchaseStyleToNegotiate.dto';
import { FilterStylesToNegotiationDto } from '../dtos/filterStylesToNegotiation.dto';
import { CreateNegotiationDto } from '../dtos/createNegotiation.dto';
import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';
import { Purchase } from '../../entities/purchase.entity';
import { SecurityProxyService } from '../../external-services/security-proxy/security-proxy.service';
import { NegotiationDto } from '../dtos/negotiation.dto';
import { JdaskuService } from '../../jdasku/service/jdasku.service';
import { UserDecode } from '../../shared/dtos/userDecode.entity';
import { CleanSkuRuleCause } from '../../shared/enums/cleanSkuRuleCause.enum';
import { OcJda } from '../../entities/ocJda.entity';
import { Excel, IWorkSheet } from '../../shared/class/Excel';
import { FilterPurchaseToExportNegotiationDto } from '../dtos/filterPurchaseToExportNegotiation.dto';
import * as AWS from 'aws-sdk';
import { AwsS3 } from '../../shared/class/AwsS3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from 'nestjs-config';
import { Sku } from '../../entities/sku.entity';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { NotificationDto } from '../../shared/dtos/notification.dto';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import moment = require('moment');
import { UpdatePurchaseStyleStatusDto } from '../dtos/updatePurchaseStyleStatus.dto';
import { GetUserDto } from '../../external-services/security-proxy/dtos/getUser.dto';
import { BadRequestException } from '@nestjs/common';
import { SavePurchaseStyleDetailDto } from '../dtos/savePurchaseStyleDetail.dto';
import { ShippingDatesChild } from '../../entities/shippingDatesChild.entity';
import { generateArrivalDatesDto } from '../../purchase/dtos/generateArrivalDates.dto';
import { TypeormHelper } from '../../shared/class/typeorm.helper';
import { PurchaseStore } from '../../entities/purchaseStore.entity';
import { Store } from '../../entities/store.entity';
import { SustainableFeature } from '../../entities/sustainableFeature.entity';
import { Certifications } from '../../entities/certifications.entity';
import { Exhibition } from '../../entities/exhibition.entity';

@Injectable()
export class PurchaseStyleService {
    // Create a logger instance
    private logger = new Logger('PurchaseStyleService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;
    private typeormHelper: TypeormHelper;

    constructor(
        @InjectRepository(PurchaseStyleDetails)
        private readonly purchaseStyleDetailsRepository: Repository<PurchaseStyleDetails>,
        @InjectRepository(PurchaseStyle)
        private readonly purchaseStyleRepository: Repository<PurchaseStyle>,
        @InjectRepository(PurchaseStyleColor)
        private readonly purchaseStyleColorRepository: Repository<PurchaseStyleColor>,
        @InjectRepository(PurchaseStyleColorShipping)
        private readonly purchaseStyleColorShippingRepository: Repository<PurchaseStyleColorShipping>,
        @InjectRepository(PurchaseStyleNegotiation)
        private readonly purchaseStyleNegotiationRepository: Repository<PurchaseStyleNegotiation>,
        @InjectRepository(ShippingDatesChild)
        private readonly shippingDatesChildRepository: Repository<ShippingDatesChild>,
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
        @InjectRepository(Purchase)
        private readonly purchaseRepository: Repository<Purchase>,
        @InjectRepository(ExitPort)
        private readonly exitPortRepository: Repository<ExitPort>,
        @InjectRepository(StatusPurchaseColor)
        private readonly statusPurchaseColorRepository: Repository<StatusPurchaseColor>,
        @InjectRepository(PurchaseStore)
        private readonly purchaseStoreRepository: Repository<PurchaseStore>,
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
        @InjectRepository(Sku)
        private readonly skuRepository: Repository<Sku>,
        @InjectRepository(OcJda)
        private readonly ocJdaRepository: Repository<OcJda>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(SustainableFeature)
        private readonly sustainableFeatureRepository: Repository<SustainableFeature>,
        @InjectRepository(Certifications)
        private readonly certificationsRepository: Repository<Certifications>,
        @InjectRepository(Exhibition)
        private readonly exhibitionRepository: Repository<Exhibition>,
        @InjectRepository(SeasonSticker)
        private readonly seasonStickerRepository: Repository<SeasonSticker>,
        @InjectRepository(Shipmethod)
        private readonly shipmethodRepository: Repository<Shipmethod>,
        @InjectRepository(Segment)
        private readonly segmentRepository: Repository<Segment>,
        @InjectRepository(OriginCountry)
        private readonly originCountryRepository: Repository<OriginCountry>,
        @InjectRepository(Packaging)
        private readonly packagingRepository: Repository<Packaging>,
        @InjectRepository(Size)
        private readonly sizeRepository: Repository<Size>,
        @InjectRepository(Ratio)
        private readonly ratioRepository: Repository<Ratio>,
        @InjectRepository(Rse)
        private readonly rseRepository: Repository<Rse>,
        @InjectRepository(Cso)
        private readonly csoRepository: Repository<Cso>,
        private externalStyleService: StyleProxyService,
        private securityProxyService: SecurityProxyService,
        private importFactorService: ImportFactorService,
        private jdaskuService: JdaskuService,
        private dollarService: DollarService,
        private config: ConfigService,
        private notificationPublisherService: NotificationPublisherService,
    ) {
        this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
        AWS.config.update({
            accessKeyId: this.config.get('aws').aws_access_key_id,
            secretAccessKey: this.config.get('aws').aws_secret_access_key,
        });
        this.s3 = new AWS.S3();
        this.typeormHelper = new TypeormHelper();
     }

    async getStyleModByFilter(dto: FilterStyleModDto) {
        const { brands, categories, departments, seasons, styles, type, fields } = dto;
        let query = this.purchaseStyleRepository
            .createQueryBuilder('purchaseStyle')
            .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
            .leftJoinAndSelect('purchaseStore.store', 'store')
            .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
            .leftJoinAndSelect('purchaseStyle.details', 'details')
            .leftJoinAndSelect('details.category', 'category')
            .leftJoinAndSelect('purchaseStyle.colors', 'colors')
            .where({ active: true })
            .andWhere('colors.state = true')
            .andWhere('colors.approved = true')
            .andWhere('status.id=:id', { id: Status.Approvement });
        if (seasons && seasons.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    seasons.forEach((seasonId) => {
                        qb = qb.orWhere('purchase.seasonCommercial.id=' + seasonId);
                    });
                }));
        }
        if (styles && styles.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    styles.forEach((styleId) => {
                        qb = qb.orWhere('purchaseStyle.styleId=' + styleId);
                    });
                }));
        }
        if (brands && brands.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    brands.forEach((brandId) => {
                        qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                    });
                }));
        }
        if (departments && departments.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    departments.forEach((departmentId) => {
                        qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                    });
                }));
        }
        const purchaseStylesDb = await query.getMany();

        const purchaseCreatorsIds = _.uniqBy(purchaseStylesDb.map(p => ({ purchaseId: p.purchaseStore.purchase.id, purchaseDescription: p.purchaseStore.purchase.name, departments: p.purchaseStore.purchase.departments, userId: p.purchaseStore.purchase.userId, merchantsUsersId: p.details[0].merchandiser })), 'purchaseId');
        return purchaseCreatorsIds;
    }

    async markAsApproveByFilter(filter: FilterApprovalDto) {

        const responseStyles = await this.getPurchaseStylesByFilter(filter, StatusPurchaseColorEnum.Pending, false, true);
        const purchaseStyles = responseStyles.purchaseStyles;
        let stylesData = responseStyles.stylesData;
        if (!stylesData) {
            const uniqStyles = _.uniqBy(purchaseStyles, 'styleId');
            stylesData = await this.externalStyleService.getStylesDataByIds(uniqStyles.map(s => s.styleId));
            if (uniqStyles.length > 0 && stylesData.length === 0) {
                throw new BadRequestException('Datos de estilos no encontrados');
            }
        }

        const purchaseCreatorsIds = _.uniqBy(purchaseStyles.map(p => ({ purchaseId: p.purchaseStore.purchase.id, purchaseDescription: p.purchaseStore.purchase.name, departments: p.purchaseStore.purchase.departments, userId: p.purchaseStore.purchase.userId, merchantsUsersId: p.details[0].merchandiser })), 'purchaseId');

        const importFactorDto = [];
        const seasonCommercialIds = [];
        const statusConfirmed = new StatusPurchaseColor();
        statusConfirmed.id = StatusPurchaseColorEnum.Confirmed;
        const purchasStyleColors = _.flatten(purchaseStyles.map(p => {
            const styleData = stylesData.find(s => s.id === p.styleId);
            const details = p.details[0];
            importFactorDto.push({ destinyId: p.purchaseStore.store.destinyCountryId, originId: details.origin.id, departmentId: styleData.departmentId, shipmethodId: details.shippingMethod.id });
            seasonCommercialIds.push(p.purchaseStore.purchase.seasonCommercialId);
            if (styleData) {
                const piName = `${styleData.departmentCode}${styleData.brandCode}${p.purchaseStore.store.shortName}${p.purchaseStore.store.destinyCountry.shortName}${details.provider.code}${p.purchaseStore.purchase.seasonCommercial.getPiShortName()}${details.exitPort.jdaCode}`;
                const ut = parseInt(details.ratio.ratio.split('-').reduce((a, b) => `${parseInt(a, null) + parseInt(b, null)}`), null);
                const factorUt = Math.ceil(ut / 2);
                return p.colors.map(c => {
                    return {
                        id: c.id,
                        piName: piName, //(c.piName) ? c.piName : piName,
                        status: statusConfirmed,
                        approved: true,
                        shippings: c.shippings.map(sh => {
                            let roundedUnits = sh.units;
                            if (sh.units !== 0 && sh.units < ut) {
                                roundedUnits = ut;
                            } else if (sh.units !== 0) {
                                // se aproximan las unidades al multiplo mas cercano de la UT correspondiente a la curva seleccionada por exceso.
                                roundedUnits = sh.units % ut >= factorUt ? (Math.floor(sh.units / ut) + 1) * ut : Math.floor(sh.units / ut) * ut;
                            }
                            return {
                                id: sh.id,
                                piName: `${piName}${sh.shipping}${sh.getPiDate()}`, //(sh.piName && sh.piName.length > 7) ? sh.piName : `${piName}${sh.shipping}${sh.getPiDate()}`,
                                units: roundedUnits
                            }
                        }),
                    };
                });
            }
        })).filter(p => p);
        const shippings = _.flatten(purchasStyleColors.map(c => c.shippings));

        const uniqImportFactorsDto = _.uniqWith(importFactorDto, _.isEqual);
        const importFactors = await this.importFactorService.getByDestinyAndOriginAndDepartment(uniqImportFactorsDto);
        const dollarChanges = await this.dollarService.getBySeason(_.uniq(seasonCommercialIds));
        const nullPricesFob = purchaseStyles.filter(p => !p.details[0].fob || p.details[0].fob == 0 || !p.details[0].price || p.details[0].price == 0);    
        
        if (nullPricesFob.length > 0) {

            let messageError = '';
            let uniqPurchaseStyle = _.uniqBy(nullPricesFob, 'styleId');

            let fob = [];
            let price = [];


            for(const style of uniqPurchaseStyle) {
                const styleCode = stylesData.find(p => p.id === style.styleId)?.code;
                
                if(!style.details[0].fob || style.details[0].fob == 0) {
                    fob.push(styleCode);
                }
                
                if(!style.details[0].price || style.details[0].price == 0) {
                    price.push(styleCode);
                }
            }

            if(fob.length > 0) {
                messageError += `<div><strong>FOB</strong> deben estar completados para los siguientes estilos:`
                for(const code of fob) {
                    messageError += `<span>- ${code}</span>`
                }
                messageError += '</div>'
            }

            if(price.length > 0) {
                messageError += `<div><strong>PRECIO</strong> deben estar completados para los siguientes estilos:`
                for(const code of price) {
                    messageError += `<span>- ${code}</span>`
                }
                messageError += '</div>'
            }

            
            throw new BadRequestException(messageError);
        }


        if (dollarChanges && dollarChanges.length > 0) {
            if (importFactors.length === uniqImportFactorsDto.length) {
                const purchaseStyleDetails = purchaseStyles.map(p => {
                    const details = p.details[0];
                    // if (!details.fob || details.fob === 0 || !details.price || details.price === 0) {
                    //     this.logger.error('Los datos FOB y PRECIO deben estar completados y distintos de 0', JSON.stringify(details));
                    //     return null;
                    // }
                    const styleData = stylesData.find(s => s.id === p.styleId);
                    details.importFactor = parseFloat(importFactors.find(f => f.departmentId === styleData.departmentId && f.destinyCountry.id === p.purchaseStore.store.destinyCountryId && f.originCountry.id === details.origin.id && f.shipmethod.id === details.shippingMethod.id)?.factor.toString()) || 0;
                    details.dollarChange = parseFloat(dollarChanges.find(d => d.destinyCountry.id === p.purchaseStore.store.destinyCountryId)?.value.toString());
                    // COSTO*: FOB*DOLAR MANTENEDOR*FACTOR IMPORTACIÓN MANTENEDOR
                    const cost = details.importFactor && details.dollarChange ? details.fob * details.dollarChange * details.importFactor : 0;
                    details.cost = parseFloat(cost.toFixed(2));
                    // IMU (( price / (1 + iva ) )-  fob * this.dollarChange * importFactor) / (price / (1 + iva)) *100
                    const imu = ((details.price / (1 + p.purchaseStore.store.destinyCountry.iva / 100)) - details.cost) / (details.price / (1 + p.purchaseStore.store.destinyCountry.iva / 100)) * 100;
                    details.imu = parseFloat(imu.toFixed(2));
                    return details;
                });
                await this.purchaseStyleDetailsRepository.save(purchaseStyleDetails);
            } else {
                this.logger.error('Factores de importación no encontrados para', JSON.stringify(uniqImportFactorsDto));
            }
        } else {
            this.logger.error(`Cambio de dollar no econtrado para las temporadas ${seasonCommercialIds.join(',')}`);
        }
        if (purchasStyleColors.length > 0 && shippings.length > 0) {
            await this.purchaseStyleColorRepository.save(purchasStyleColors);
            await this.purchaseStyleColorShippingRepository.save(shippings);
            return purchaseCreatorsIds;

        } else {
            throw new BadRequestException('Datos de estilos no encontrados');
        }
    }

    async adjustUTUnits(purchaseStyleColorsId: number[]) {
        const shippings = await this.purchaseStyleColorShippingRepository.find({ where: { purchaseStyleColor: { id: In(purchaseStyleColorsId) }, units: Not(0) }, relations: ['purchaseStyleColor', 'purchaseStyleColor.purchaseStyle', 'purchaseStyleColor.purchaseStyle.details', 'purchaseStyleColor.purchaseStyle.details.ratio'] });
        const shippingsByPurchaseStyle = _.groupBy(shippings, 'purchaseStyleColor.purchaseStyle.id');

        for (const purchaseStyleId of Object.keys(shippingsByPurchaseStyle)) {
            const shippingsPurchase = shippingsByPurchaseStyle[purchaseStyleId] as PurchaseStyleColorShipping[];
            const details = shippingsPurchase[0].purchaseStyleColor.purchaseStyle.details[0];

            if (details && details.ratio) {
                const ut = parseInt(details.ratio.ratio.split('-').reduce((a, b) => `${parseInt(a, null) + parseInt(b, null)}`), null);
                const factorUt = Math.ceil(ut / 2);
                for (const shipping of shippingsPurchase) {
                    const piName = shipping.purchaseStyleColor.piName;
                    let roundedUnits = shipping.units;
                    if (shipping.units < ut) {
                        roundedUnits = ut;
                    } else {
                        roundedUnits = shipping.units % ut >= factorUt ? (Math.floor(shipping.units / ut) + 1) * ut : Math.floor(shipping.units / ut) * ut;
                    }
                    shipping.units = roundedUnits;
                    shipping.piName = (shipping.piName) ? shipping.piName : `${piName}${shipping.shipping}${shipping.getPiDate()}`;
                }
            }
            await this.purchaseStyleColorShippingRepository.save(shippingsPurchase);
        }
    }

    async getPurchaseStylesByFilter(filter: FilterApprovalDto, statusColor: StatusPurchaseColorEnum, approved?, includeUnits0 = false) {
        try {
            let query = this.purchaseStyleRepository
                .createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
                .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                .leftJoinAndSelect('purchase.status', 'status')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchaseStyle.details', 'details')
                .leftJoinAndSelect('details.category', 'category')
                .leftJoinAndSelect('details.seasonSticker', 'seasonSticker')
                .leftJoinAndSelect('details.shippingMethod', 'shippingMethod')
                .leftJoinAndSelect('details.segment', 'segment')
                .leftJoinAndSelect('details.provider', 'provider')
                .leftJoinAndSelect('details.origin', 'origin')
                .leftJoinAndSelect('details.packingMethod', 'packingMethod')
                .leftJoinAndSelect('details.exitPort', 'exitPort')
                .leftJoinAndSelect('details.size', 'size')
                .leftJoinAndSelect('details.ratio', 'ratio')
                .leftJoinAndSelect('details.rse', 'rse')
                .leftJoinAndSelect('details.sustainableFeature', 'sustainableFeature')
                .leftJoinAndSelect('details.certifications', 'certifications')
                .leftJoinAndSelect('details.cso', 'cso')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.status', 'colorStatus')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndMapMany('shippings.oc', OcJda, 'oc', 'shippings.piName = oc.piname')
                .leftJoinAndMapMany('purchaseStyle.sku', Sku, 'sku', 'purchaseStyle.styleId = sku.styleId AND details.provider = sku.provider')
                .where({ active: true })
                .andWhere('colors.state = true');

            if (!includeUnits0) {
                query = query.andWhere('shippings.units<>0');
            }
            if (approved) {
                query = query.andWhere('colors.approved = true')
                    .andWhere('status.id=:id', { id: Status.Approvement });
            } else {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('status.id=' + Status.Approvement);
                    qb = qb.orWhere('status.id=' + Status.CompletePurchase);
                }));
            }
            if (statusColor === StatusPurchaseColorEnum.ConfirmedOrCanceled) {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Confirmed);
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Canceled);
                }));
            } else if (statusColor) {
                query = query.andWhere('colorStatus.id=' + statusColor);
            }

            if (filter.purchaseId) {
                query = query.andWhere('purchase.id=' + filter.purchaseId);
            }
            if (filter.seasons && filter.seasons.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.seasons.forEach((seasonId) => {
                            qb = qb.orWhere('purchase.seasonCommercial.id=' + seasonId);
                        });
                    }));
            }
            if (filter.tripDates && filter.tripDates.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.tripDates.forEach((tripDate) => {
                            qb = qb.orWhere(`purchase."tripDate"::date='${tripDate}'`);
                        });
                    }));
            }
            if (filter.stores && filter.stores.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.stores.forEach((storeId) => {
                            qb = qb.orWhere('store.id=' + storeId);
                        });
                    }));
            }
            if (filter.origins && filter.origins.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.origins.forEach((originId) => {
                            qb = qb.orWhere('origin.id=' + originId);
                        });
                    }));
            }
            if (filter.providers && filter.providers.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.providers.forEach((providerId) => {
                            qb = qb.orWhere('provider.id=' + providerId);
                        });
                    }));
            }
            if (filter.categories && filter.categories.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.categories.forEach((categoryId) => {
                            qb = qb.orWhere('category.id=' + categoryId);
                        });
                    }));
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.users && filter.users.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.users.forEach((userId) => {
                            qb = qb.orWhere('purchase.userId=' + userId);
                        });
                    }));
            }
            if (filter.shippings && filter.shippings.length > 0) {
                query = query.andWhere('shippings.shipping IN (:...shippings)', { shippings: filter.shippings })
            }
            if (filter.piName) {
                query = query.andWhere(`shippings.piName=:piName`, { piName: filter.piName });
            }
            const purchaseStylesDb = await query.getMany();
            const usersId = purchaseStylesDb.map(p => p.details[0].brandManager).concat(purchaseStylesDb.map(p => p.details[0].productManager)).concat(purchaseStylesDb.map(p => p.details[0].designer));
            const uniqUsersId = _.uniq(usersId.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const users = uniqUsersId && uniqUsersId.length > 0 ? await this.securityProxyService.getUsers({ ids: uniqUsersId, departments: [], roles: [] }) : null;

            const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));
            if (stylesIds.length > 0 && (((filter.departments && filter.departments.length > 0) || (filter.brands && filter.brands.length > 0)) || approved)) {
                let stylesData = await this.externalStyleService.getStylesDataByIdsBatch(stylesIds);
                if (stylesIds.length > 0 && stylesData.length === 0) {
                    this.logger.error('Datos de estilos no encontrados');
                    return null;
                }
                if (filter.brands && filter.brands.length > 0) {
                    stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
                }
                if (filter.departments && filter.departments.length > 0) {
                    stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
                }

                return { purchaseStyles: purchaseStylesDb.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1), stylesData, users };
            }

            return { purchaseStyles: purchaseStylesDb, stylesData: null, users };
        } catch (error) {
            this.logger.error(error);
            return { purchaseStyles: [], stylesData: null, users: null };
        }
    }

    async getPurchaseStylesByFilterV1(filter: FilterApprovalDto, statusColor: StatusPurchaseColorEnum, approved?, includeUnits0 = false) {
        try {
            let query = this.purchaseStyleRepository.createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoin('purchaseStyle.details', 'details')
                .leftJoin('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoin('purchaseStore.store', 'store')
                .leftJoin('purchaseStore.purchase', 'purchase')
                .leftJoin('store.destinyCountry', 'destinyCountry')
                .leftJoin('purchase.status', 'status')
                .leftJoin('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoin('details.category', 'category')
                .leftJoin('details.seasonSticker', 'seasonSticker')
                .leftJoin('details.shippingMethod', 'shippingMethod')
                .leftJoin('details.segment', 'segment')
                .leftJoin('details.provider', 'provider')
                .leftJoin('details.origin', 'origin')
                .leftJoin('details.packingMethod', 'packingMethod')
                .leftJoin('details.exitPort', 'exitPort')
                .leftJoin('details.size', 'size')
                .leftJoin('details.ratio', 'ratio')
                .leftJoin('details.rse', 'rse')
                .leftJoin('details.cso', 'cso')
                .leftJoin('colors.status', 'colorStatus')
                .leftJoin('colors.shippings', 'shippings')
                .where({ active: true })
                .andWhere('colors.state = true');

            if (!includeUnits0) {
                query = query.andWhere('shippings.units<>0');
            }
            if (approved) {
                query = query.andWhere('colors.approved = true')
                    .andWhere('status.id=:id', { id: Status.Approvement });
            } else {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('status.id=' + Status.Approvement);
                    qb = qb.orWhere('status.id=' + Status.CompletePurchase);
                }));
            }
            if (statusColor === StatusPurchaseColorEnum.ConfirmedOrCanceled) {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Confirmed);
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Canceled);
                }));
            } else if (statusColor) {
                query = query.andWhere('colorStatus.id=' + statusColor);
            }
            if (filter.purchaseId) {
                query = query.andWhere('purchase.id=' + filter.purchaseId);
            }
            if (filter.seasons && filter.seasons.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.seasons.forEach((seasonId) => {
                            qb = qb.orWhere('purchase.seasonCommercial.id=' + seasonId);
                        });
                    }));
            }
            if (filter.tripDates && filter.tripDates.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.tripDates.forEach((tripDate) => {
                            qb = qb.orWhere(`purchase."tripDate"::date='${tripDate}'`);
                        });
                    }));
            }
            if (filter.stores && filter.stores.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.stores.forEach((storeId) => {
                            qb = qb.orWhere('store.id=' + storeId);
                        });
                    }));
            }
            if (filter.origins && filter.origins.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.origins.forEach((originId) => {
                            qb = qb.orWhere('origin.id=' + originId);
                        });
                    }));
            }
            if (filter.providers && filter.providers.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.providers.forEach((providerId) => {
                            qb = qb.orWhere('provider.id=' + providerId);
                        });
                    }));
            }
            if (filter.categories && filter.categories.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.categories.forEach((categoryId) => {
                            qb = qb.orWhere('category.id=' + categoryId);
                        });
                    }));
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.users && filter.users.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.users.forEach((userId) => {
                            qb = qb.orWhere('purchase.userId=' + userId);
                        });
                    }));
            }
            if (filter.shippings && filter.shippings.length > 0) {
                query = query.andWhere('shippings.shipping IN (:...shippings)', { shippings: filter.shippings })
            }
            if (filter.piName) {
                query = query.andWhere(`shippings.piName=:piName`, { piName: filter.piName });
            }

            const purchaseStylesDb = await query.getMany();
            if (purchaseStylesDb.length <= 0) {
                return { purchaseStyles: [], stylesData: null, users: null, ocs: [], detailsData: null };
            }
            // Load purchase relations
            await this.typeormHelper.loadRelationships(this.purchaseStyleRepository, ['details', 'purchaseStore'], purchaseStylesDb);
            await this.typeormHelper.loadRelationships(this.purchaseStoreRepository, ['purchase', 'store'], purchaseStylesDb.map(ps => ps.purchaseStore));
            await this.typeormHelper.loadRelationships(this.purchaseStyleColorRepository, ['status', 'shippings'], _.flatten(purchaseStylesDb.map(ps => ps.colors.map(c => c))));
            await this.typeormHelper.loadRelationships(this.purchaseRepository, ['status', 'seasonCommercial'], purchaseStylesDb.map(ps => ps.purchaseStore.purchase));
            await this.typeormHelper.loadRelationships(this.storeRepository, ['destinyCountry'], purchaseStylesDb.map(ps => ps.purchaseStore.store));

            const detailsData = {
                providers: {},
                exitPorts: {},
                categories: {},
                sustainableFeatures: {},
                certifications: {},
                seasonStickers: {},
                shippingMethods: {},
                segments: {},
                origins: {},
                packingMethods: {},
                exhibitions: {},
                sizes: {},
                ratios: {},
                rses: {},
                csos: {}
            };
            const details = purchaseStylesDb.map(ps => ps.details[0]);
            const providers = await this.providerRepository.createQueryBuilder().whereInIds(details.map(d => d.providerId)).getMany();
            providers.forEach(p => { detailsData.providers[p.id] = p; });

            const exitPorts = await this.exitPortRepository.createQueryBuilder().whereInIds(details.map(d => d.exitPortId)).getMany();
            exitPorts.forEach(e => { detailsData.exitPorts[e.id] = e; });

            const categories = await this.categoryRepository.createQueryBuilder().whereInIds(details.map(c => c.categoryId)).getMany();
            categories.forEach(c => { detailsData.categories[c.id] = c; });

            const sustainableFeatures = await this.sustainableFeatureRepository.createQueryBuilder().whereInIds(details.map(s => s.sustainableFeatureId)).getMany();
            sustainableFeatures.forEach(s => { detailsData.sustainableFeatures[s.id] = s; });

            const certifications = await this.certificationsRepository.createQueryBuilder().whereInIds(details.map(s => s.certificationsId)).getMany();
            certifications.forEach(s => { detailsData.certifications[s.id] = s; });
            
            const seasonStickers = await this.seasonStickerRepository.createQueryBuilder().whereInIds(details.map(s => s.seasonStickerId)).getMany();
            seasonStickers.forEach(s => { detailsData.seasonStickers[s.id] = s; });
            
            const shippingMethods = await this.shipmethodRepository.createQueryBuilder().whereInIds(details.map(s => s.shippingMethodId)).getMany();
            shippingMethods.forEach(s => { detailsData.shippingMethods[s.id] = s; });
            
            const segments = await this.segmentRepository.createQueryBuilder().whereInIds(details.map(s => s.segmentId)).getMany();
            segments.forEach(s => { detailsData.segments[s.id] = s; });
            
            const origins = await this.originCountryRepository.createQueryBuilder().whereInIds(details.map(o => o.originId)).getMany();
            origins.forEach(o => { detailsData.origins[o.id] = o; });
            
            const packingMethods = await this.packagingRepository.createQueryBuilder().whereInIds(details.map(p => p.packingMethodId)).getMany();
            packingMethods.forEach(p => { detailsData.packingMethods[p.id] = p; });

            const exhibitions = await this.exhibitionRepository.createQueryBuilder().whereInIds(details.map(s => s.exhibitionId)).getMany();
            exhibitions.forEach(s => { detailsData.exhibitions[s.id] = s; });
            
            const sizes = await this.sizeRepository.createQueryBuilder().whereInIds(details.map(s => s.sizeId)).getMany();
            sizes.forEach(s => { detailsData.sizes[s.id] = s; });
            
            const ratios = await this.ratioRepository.createQueryBuilder().whereInIds(details.map(r => r.ratioId)).getMany();
            ratios.forEach(r => { detailsData.ratios[r.id] = r; });
            
            const rses = await this.rseRepository.createQueryBuilder().whereInIds(details.map(r => r.rseId)).getMany();
            rses.forEach(r => { detailsData.rses[r.id] = r; });
            
            const csos = await this.csoRepository.createQueryBuilder().whereInIds(details.map(c => c.csoId)).getMany();
            csos.forEach(c => { detailsData.csos[c.id] = c; });

            const usersId = purchaseStylesDb.map(p => p.details[0].brandManager).concat(purchaseStylesDb.map(p => p.details[0].productManager)).concat(purchaseStylesDb.map(p => p.details[0].designer));
            const uniqUsersId = _.uniq(usersId.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const users = uniqUsersId && uniqUsersId.length > 0 ? await this.securityProxyService.getUsers({ ids: uniqUsersId, departments: [], roles: [] }) : null;
            const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));

            const piNames = _.chain(purchaseStylesDb.map(ps => ps.colors.map(c => c.shippings.map(s => s.piName)))).flatten().flatten().uniq().value();
            const ocs = await this.ocJdaRepository.find({ where: { piname: In(piNames) } });

            if (stylesIds.length > 0 && (((filter.departments && filter.departments.length > 0) || (filter.brands && filter.brands.length > 0)) || approved)) {
                let stylesData = await this.externalStyleService.getStylesDataByIdsBatch(stylesIds);
                if (stylesIds.length > 0 && stylesData.length === 0) {
                    this.logger.error('Datos de estilos no encontrados');
                    return null;
                }
                if (filter.brands && filter.brands.length > 0) {
                    stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
                }
                if (filter.departments && filter.departments.length > 0) {
                    stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
                }

                return { purchaseStyles: purchaseStylesDb.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1), stylesData, users, ocs, detailsData };
            }

            return { purchaseStyles: purchaseStylesDb, stylesData: null, users, ocs, detailsData };
        } catch (error) {
            this.logger.error(error);
            return { purchaseStyles: [], stylesData: null, users: null, ocs: [], detailsData: null };
        }
    }

    async getPurchaseStyleEnhancementByFilter(filter: FilterApprovalDto, statusColor: StatusPurchaseColorEnum, approved?, includeUnits0 = false) {
        try {
            let query = this.purchaseStyleRepository
                .createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
                .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                .leftJoinAndSelect('purchase.status', 'status')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchaseStyle.details', 'details')
                .leftJoinAndSelect('details.category', 'category')
                .leftJoinAndSelect('details.seasonSticker', 'seasonSticker')
                .leftJoinAndSelect('details.shippingMethod', 'shippingMethod')
                .leftJoinAndSelect('details.segment', 'segment')
                .leftJoinAndSelect('details.provider', 'provider')
                .leftJoinAndSelect('details.origin', 'origin')
                .leftJoinAndSelect('details.packingMethod', 'packingMethod')
                .leftJoinAndSelect('details.exitPort', 'exitPort')
                .leftJoinAndSelect('details.size', 'size')
                .leftJoinAndSelect('details.ratio', 'ratio')
                .leftJoinAndSelect('details.rse', 'rse')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.status', 'colorStatus')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndMapMany('shippings.oc', OcJda, 'oc', 'shippings.piName = oc.piname')
                .where({ active: true })
                .andWhere('colors.state = true');

            if (!includeUnits0) {
                query = query.andWhere('shippings.units<>0');
            }
            if (approved) {
                query = query.andWhere('colors.approved = true')
                    .andWhere('status.id=:id', { id: Status.Approvement });
            }
            if (statusColor === StatusPurchaseColorEnum.ConfirmedOrCanceled) {
                query = query.andWhere(new Brackets((qb) => {
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Confirmed);
                    qb = qb.orWhere('colorStatus.id=' + StatusPurchaseColorEnum.Canceled);
                }));
            } else if (statusColor) {
                query = query.andWhere('colorStatus.id=' + statusColor);
            }
            if (filter.tripDates && filter.tripDates.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.tripDates.forEach((tripDate) => {
                            qb = qb.orWhere(`purchase."tripDate"::date='${tripDate}'`);
                        });
                    }));
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.seasons && filter.seasons.length > 0) {
                const seasonIds = filter.seasons;
                query.andWhere('purchase.seasonCommercial.id IN (:...seasonIds)', { seasonIds });
            }
            if (filter.providers && filter.providers.length > 0) {
                const providerIds = filter.providers;
                query.andWhere('provider.id IN (:...providerIds)', { providerIds });
            }
            if (filter.categories && filter.categories.length > 0) {
                const categoryIds = filter.categories;
                query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
            }
            if (filter.users && filter.users.length > 0) {
                const userIds = filter.users;
                query.andWhere('purchase.userId IN (:...userIds', { userIds });
            }

            const purchaseStylesDb = await query.getMany();
            const usersId = purchaseStylesDb.map(p => p.details[0].brandManager).concat(purchaseStylesDb.map(p => p.details[0].productManager)).concat(purchaseStylesDb.map(p => p.details[0].designer));
            const uniqUsersId = _.uniq(usersId.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const users = uniqUsersId && uniqUsersId.length > 0 ? await this.securityProxyService.getUsers({ ids: uniqUsersId, departments: [], roles: [] }) : null;

            const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));
            if (stylesIds.length > 0 && (((filter.departments && filter.departments.length > 0) || (filter.brands && filter.brands.length > 0)) || approved)) {
                let stylesData = await this.externalStyleService.getStyleEnhancementDataByIds(stylesIds);
                if (stylesIds.length > 0 && stylesData.length === 0) {
                    this.logger.error('Datos de estilos no encontrados');
                    return null;
                }
                if (filter.brands && filter.brands.length > 0) {
                    stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
                }
                if (filter.departments && filter.departments.length > 0) {
                    stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
                }

                return { purchaseStyles: purchaseStylesDb.filter(p => stylesData.map(s => s.styleId).indexOf(p.styleId) !== -1), stylesData, users };
            }

            return { purchaseStyles: purchaseStylesDb, stylesData: null, users };
        } catch (error) {
            this.logger.error(error);
            return { purchaseStyles: [], stylesData: null, users: null };
        }
    }

    async getAllStylesActiveToAdjustByFilter(dto: FilterStyleModDto) {
        const { brands, categories, departments, seasons, styles, type, fields, users, tripDates } = dto;
        let query = this.purchaseStyleRepository
            .createQueryBuilder('purchaseStyle')
            .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
            .leftJoinAndSelect('purchaseStore.store', 'store')
            .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
            .leftJoinAndSelect('purchaseStyle.details', 'details')
            .leftJoinAndSelect('details.origin', 'origin')
            .leftJoinAndSelect('details.category', 'category')
            .leftJoinAndSelect('purchaseStyle.colors', 'colors')
            .leftJoinAndSelect('colors.status', 'colorStatus')
            .leftJoinAndSelect('colors.shippings', 'shippings')
            .where({ active: true })
            .andWhere('colors.state = true')
            .andWhere('colors.approved = true')
            .andWhere('status.id=:id', { id: Status.Approvement })
            .andWhere(`colorStatus.id IN (${StatusPurchaseColorEnum.Confirmed}, ${StatusPurchaseColorEnum.Canceled})`);

        if (seasons && seasons.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    seasons.forEach((seasonId) => {
                        qb = qb.orWhere('purchase.seasonCommercial.id=' + seasonId);
                    });
                }));
        }
        if (styles && styles.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    styles.forEach((styleId) => {
                        qb = qb.orWhere('purchaseStyle.styleId=' + styleId);
                    });
                }));
        }
        if (brands && brands.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    brands.forEach((brandId) => {
                        qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                    });
                }));
        }
        if (departments && departments.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    departments.forEach((departmentId) => {
                        qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                    });
                }));
        }
        if (users && users.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    users.forEach((userId) => {
                        qb = qb.orWhere('purchase.userId=' + userId);
                    });
                }));
        }
        if (tripDates && tripDates.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    tripDates.forEach((tripDate) => {
                        qb = qb.orWhere(`purchase."tripDate"::date='${tripDate}'`);
                    });
                }));
        }
        if (fields && fields.length > 0) {
            for (const field of fields) {
                switch (field) {
                    // case DetailsType.Profile:
                    //     query = query.leftJoinAndSelect('details.profile', 'profile');
                    //     break;
                    case DetailsType.Cso:
                        query = query.leftJoinAndSelect('details.cso', 'cso');
                        break;
                    case DetailsType.Provider:
                        query = query.leftJoinAndSelect('details.provider', 'provider');
                        break;
                    case DetailsType.Rse:
                        query = query.leftJoinAndSelect('details.rse', 'rse');
                        break;
                    case DetailsType.PackingMethod:
                        query = query.leftJoinAndSelect('details.packingMethod', 'packingMethod');
                        break;
                    case DetailsType.ExitPort:
                        query = query.leftJoinAndSelect('details.exitPort', 'exitPort');
                        break;
                    case DetailsType.Segment:
                        query = query.leftJoinAndSelect('details.segment', 'segment');
                        break;
                    case DetailsType.ShippingMethod:
                        query = query.leftJoinAndSelect('details.shippingMethod', 'shippingMethod');
                        break;
                    case DetailsType.SeasonSticker:
                        query = query.leftJoinAndSelect('details.seasonSticker', 'seasonSticker');
                        break;
                    case DetailsType.Size:
                        query = query.leftJoinAndSelect('details.size', 'size');
                        break;
                    case DetailsType.Ratio:
                        query = query.leftJoinAndSelect('details.ratio', 'ratio');
                        break;
                    // case DetailsType.Origin:
                    //     query = query.leftJoinAndSelect('details.origin', 'origin');
                    //     break;

                    default:
                        break;
                }
            }
        }
        const purchaseStylesDb = await query.getMany();
        const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));
        let stylesData = [];
        if (stylesIds.length > 0) {
            stylesData = await this.externalStyleService.getStylesDataByIds(stylesIds);
            if (brands && brands.length > 0) {
                stylesData = stylesData.filter(s => brands.indexOf(s.brandId) !== -1);
            }
            if (departments && departments.length > 0) {
                stylesData = stylesData.filter(s => departments.indexOf(s.departmentId) !== -1);
            }
            let purchaseStylesFilter = purchaseStylesDb.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1 && p.details.length > 0);
            // let purchaseStylesFilter = purchaseStylesDb.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1 && p.details.length > 0 && p.getTotalUnits() > 0);
            if (categories && categories.length > 0) {
                purchaseStylesFilter = purchaseStylesFilter.filter(p => categories.indexOf(p.details[0].category.id) !== -1);
            }

            if (type === FilterTypeStyleMod.Styles) {
                return purchaseStylesFilter.map(p => {
                    const details = p.details[0];
                    const fieldsEdit = this.getFieldsEdit(details, fields);
                    const styleData = stylesData.find(s => s.id === p.styleId);
                    return new GetPurchaseStyleToAdjustDto(p, fieldsEdit, styleData, details.id, null, details);
                });
            } else if (type === FilterTypeStyleMod.Colors) {
                return _.flatten(purchaseStylesFilter.map(p => {
                    const styleData = stylesData.find(s => s.id === p.styleId);
                    const details = p.details[0];
                    if (fields && fields.length > 0 && fields.indexOf(DetailsType.StyleCodeColors) !== -1) {
                        return p.colors.map(pc => {
                            const colors = styleData.colors.filter(c => p.colors.map(c => c.styleColorId).indexOf(c.id) === -1);
                            const styleColorData = styleData.colors.find(c => c.id === pc.styleColorId);
                            colors.push(styleColorData);
                            const fieldsEdit = this.getFieldsColorsEdit(pc, fields, styleData, details);
                            const getPurchase = new GetPurchaseStyleToAdjustDto(p, fieldsEdit, styleData, pc.id, pc.status, details);
                            getPurchase.updateColorList(colors, styleColorData?.colorName, styleColorData?.id);
                            return getPurchase;
                        });
                    } else {
                        return p.colors.map(pc => {
                            const styleColorData = styleData.colors.find(c => c.id === pc.styleColorId);
                            const fieldsEdit = this.getFieldsColorsEdit(pc, fields, styleData, details);
                            const getPurchase = new GetPurchaseStyleToAdjustDto(p, fieldsEdit, styleData, pc.id, pc.status, details);
                            if (styleColorData) {
                                getPurchase.updateColor(styleColorData.colorName, styleColorData?.id);
                            }
                            return getPurchase;
                        });
                    }

                }));
            }
        }

        return [];
    }

    getFieldsColorsEdit(color: PurchaseStyleColor, fields: DetailsType[], styleData: any, details: PurchaseStyleDetails) {
        const response = [];
        for (const field of fields) {
            // console.log(field, color, fields, styleData);
            switch (field) {
                case DetailsType.Provider:
                    response.push({ type: field, valueId: details.provider?.id });
                    break;
                case DetailsType.UnitsDates:
                    _.range(1, 7).forEach(i => {
                        response.push({ type: `E${i}`, valueId: color.shippings.find(s => s.shipping === `E${i}`)?.units || 0, shippingId: color.shippings.find(s => s.shipping === `E${i}`)?.id || -1 });
                    });
                    _.range(1, 7).forEach(i => {
                        response.push({ type: `DATE${i}`, valueId: color.shippings.find(s => s.shipping === `E${i}`)?.date || '', shippingId: color.shippings.find(s => s.shipping === `E${i}`)?.id || -1 });
                    });
                    break;
                // case DetailsType.Dates:
                //     _.range(1, 7).forEach(i => {
                //         response.push({ type: `DATE${i}`, valueId: color.shippings.find(s => s.shipping === `E${i}`)?.date || '', shippingId: color.shippings.find(s => s.shipping === `E${i}`)?.id || -1 });
                //     });
                //     break;
                case DetailsType.StyleCodeColors:
                    response.push({ type: `StyleCode`, valueId: styleData.codeNumber });
                    response.push({ type: `StyleColors`, valueId: color.styleColorId });
                    break;
                case DetailsType.Status:
                    response.push({ type: `Status`, valueId: color.status.id });
                    break;
            }
        }
        return response;
    }

    getFieldsEdit(details: PurchaseStyleDetails, fields: DetailsType[]) {
        const response = [];
        for (const field of fields) {
            switch (field) {
                // case DetailsType.Profile:
                //     response.push({ type: field, valueId: details.profile?.id });
                //     break;
                case DetailsType.Cso:
                    response.push({ type: field, valueId: details.cso?.id });
                    break;
                case DetailsType.Provider:
                    response.push({ type: field, valueId: details.provider?.id });
                    break;
                case DetailsType.Rse:
                    response.push({ type: field, valueId: details.rse?.id });
                    break;
                case DetailsType.PackingMethod:
                    response.push({ type: field, valueId: details.packingMethod?.id });
                    break;
                case DetailsType.ExitPort:
                    response.push({ type: field, valueId: details.exitPort?.id });
                    break;
                case DetailsType.Segment:
                    response.push({ type: field, valueId: details.segment?.id });
                    break;
                case DetailsType.ShippingMethod:
                    response.push({ type: field, valueId: details.shippingMethod?.id });
                    break;
                case DetailsType.SeasonSticker:
                    response.push({ type: field, valueId: details.seasonSticker?.id });
                    break;
                case DetailsType.Size:
                    response.push({ type: field, valueId: details.size?.id });
                    break;
                case DetailsType.Ratio:
                    response.push({ type: field, valueId: details.ratio?.id });
                    break;
                case DetailsType.Origin:
                    response.push({ type: field, valueId: details.origin?.id });
                    break;
                case DetailsType.Category:
                    response.push({ type: field, valueId: details.category?.id });
                    break;
                case DetailsType.Fob:
                    response.push({ type: field, valueId: details.fob });
                    break;
                case DetailsType.Price:
                    response.push({ type: field, valueId: details.price });
                    break;
                case DetailsType.PriceSATO:
                    response.push({ type: field, valueId: details.sato });
                    break;
                case DetailsType.Atc:
                    response.push({ type: field, valueId: details.atc });
                    break;
                case DetailsType.Hanger:
                    response.push({ type: field, valueId: details.hanger });
                    break;
                case DetailsType.VstTag:
                    response.push({ type: field, valueId: details.vstTag });
                    break;
                case DetailsType.TechFile:
                    response.push({ type: field, valueId: details.techFile });
                    break;

                case DetailsType.SizeSpec:
                    response.push({ type: field, valueId: details.sizeSpec });
                    break;
                case DetailsType.InternetDescription:
                    response.push({ type: field, valueId: details.internetDescription });
                    break;
                case DetailsType.Designer:
                    response.push({ type: field, valueId: details.designer });
                    break;
                case DetailsType.PM:
                    response.push({ type: field, valueId: details.productManager });
                    break;
                case DetailsType.BM:
                    response.push({ type: field, valueId: details.brandManager });
                    break;
                case DetailsType.Negotiatior:
                    response.push({ type: field, valueId: details.negotiatior });
                    break;
                case DetailsType.Merchandiser:
                    response.push({ type: field, valueId: details.merchandiser });
                    break;
                case DetailsType.Gauge:
                    response.push({ type: field, valueId: details.gauge });
                    break;
                case DetailsType.FabricWight:
                    response.push({ type: field, valueId: details.fabricWight });
                    break;

                case DetailsType.FabricConstruction:
                    response.push({ type: field, valueId: details.fabricConstruction });
                    break;
                case DetailsType.FabricWeaving:
                    response.push({ type: field, valueId: details.fabricWeaving });
                    break;
                case DetailsType.Composition:
                    response.push({ type: field, valueId: details.composition });
                    break;
                case DetailsType.AdditionalAccesory:
                    response.push({ type: field, valueId: details.additionalAccesory });
                    break;
                case DetailsType.FobReferencial:
                    response.push({ type: field, valueId: details.fobReferencial });
                    break;
                case DetailsType.ReferencialProvider:
                    response.push({ type: field, valueId: details.referencialProvider });
                    break;
                case DetailsType.Collection:
                    response.push({ type: field, valueId: details.collection });
                    break;
                case DetailsType.Event:
                    response.push({ type: field, valueId: details.event });
                    break;
                default:
                    break;
            }
        }
        return response;
    }

    async getAllStylesActiveToAdjustList() {
        const purchaseStylesDb = await this.purchaseStyleRepository
            .createQueryBuilder('purchaseStyle')
            .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
            .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .where({ active: true })
            .andWhere('status.id=:id', { id: Status.CompletePurchase })
            .getMany();
        // const purchaseStylesDb = await this.purchaseStyleRepository.find({ where: { active: true, purchaseStore: { purchase: { statusId: 7 } } }, relations: ['purchaseStore', 'purchaseStore.purchase'], select: ['styleId', 'purchaseStore', 'purchaseStore.purchase'] });
        const stylesIds = Array.from(new Set(purchaseStylesDb.map(s => s.styleId)));
        if (stylesIds.length > 0) {
            const stylesData = await this.externalStyleService.getStylesDataByIds(stylesIds);
            return stylesData.map(s => ({ styleId: s.id, code: s.code }));
        }
        return [];
    }

    async saveStyleColor(valuesList: StyleDetailDto[], user: UserDecode) {
        try {
            const saveEntities: any[] = [];
            const purchaseStyleColors = await this.purchaseStyleColorRepository.findByIds(valuesList.filter(v => v.id !== -1).map(v => v.id), { relations: ['purchaseStyle'] });
            let cleanSkusStylesId: number[] = [];

            for (const dto of valuesList) {
                const styleColorId = parseInt(dto.detailsValue, null);
                if (styleColorId && dto.id && dto.id !== -1) {
                    // TODO: clean sku by bussiness rule (color change)
                    const purchaseStyleColor = purchaseStyleColors.find(p => p.id === dto.id);
                    if (purchaseStyleColor && purchaseStyleColor.styleColorId !== styleColorId) {
                        cleanSkusStylesId.push(purchaseStyleColor.purchaseStyle.styleId);
                    }
                    await this.purchaseStyleColorRepository.update(dto.id, { styleColorId });
                    saveEntities.push({ id: dto.id, styleColorId });
                }
            }
            cleanSkusStylesId = _.uniq(cleanSkusStylesId);
            if (cleanSkusStylesId.length > 0) {
                // TODO: validate if user role is BM erase sku, if is Merchant wait for approvement
                this.jdaskuService.cleanSkus(cleanSkusStylesId, CleanSkuRuleCause.PurchaseColorChange, user);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveStyleColor.');
            return [];
        }
    }

    async saveStatusColor(valuesList: StyleDetailDto[]) {
        try {
            const styleColorsPurchaseIds = valuesList.map(s => ({ id: s.id }));
            const purchaseStylesColors = await this.purchaseStyleColorRepository.findByIds(styleColorsPurchaseIds, { select: ['id', 'status'], relations: ['status'] });
            const saveEntities: PurchaseStyleColor[] = [];

            for (const styleColor of valuesList) {
                const styleColorDb = purchaseStylesColors.find(s => s.id === styleColor.id);
                const statusId = parseInt(styleColor.detailsValue, null);
                if (styleColorDb) {
                    if (!styleColorDb.status || (styleColorDb.status && styleColorDb.status.id !== statusId)) {
                        styleColorDb.status = new StatusPurchaseColor();
                        styleColorDb.status.id = statusId;
                        saveEntities.push(styleColorDb);
                    }
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleColorRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveStatusColor.');
            return [];
        }

    }

    async saveProviderDetails(valuesList: StyleDetailDto[], user: UserDecode) {
        try {
            // const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId );
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'provider', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'provider'] });
            const saveEntities: PurchaseStyleDetails[] = [];
            let cleanSkusStylesId: number[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const providerId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.provider || (styleDetail.provider && styleDetail.provider.id !== providerId)) {
                        // TODO: clean sku by bussiness rule (provider change)
                        if (styleDetail.provider && styleDetail.provider.id !== providerId) {
                            cleanSkusStylesId.push(styleDetail.purchaseStyle.styleId);
                        }
                        styleDetail.provider = new Provider();
                        styleDetail.provider.id = providerId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.provider = new Provider();
                    queryAdd.provider.id = providerId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            cleanSkusStylesId = _.uniq(cleanSkusStylesId);
            if (cleanSkusStylesId.length > 0) {
                // TODO: validate if user role is BM erase sku, if is Merchant wait for approvement
                this.jdaskuService.cleanSkus(cleanSkusStylesId, CleanSkuRuleCause.ProviderDetailChange, user);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveProviderDetails.');
            return [];
        }

    }

    async saveCsoDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'cso', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'cso'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const csoId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.cso || (styleDetail.cso && styleDetail.cso.id !== csoId)) {
                        styleDetail.cso = new Cso();
                        styleDetail.cso.id = csoId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.cso = new Cso();
                    queryAdd.cso.id = csoId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveCsoDetails.');
            return [];
        }

    }

    async saveCategoryDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'category', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'category'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const categoryId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.category || (styleDetail.category && styleDetail.category.id !== categoryId)) {
                        styleDetail.category = new Category();
                        styleDetail.category.id = categoryId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.category = new Category();
                    queryAdd.category.id = categoryId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveCategoryDetails.');
            return [];
        }

    }

    async saveExitPortDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'exitPort', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'exitPort'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const exitPortId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.exitPort || (styleDetail.exitPort && styleDetail.exitPort.id !== exitPortId)) {
                        styleDetail.exitPort = new ExitPort();
                        styleDetail.exitPort.id = exitPortId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.exitPort = new ExitPort();
                    queryAdd.exitPort.id = exitPortId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveExitPortDetails.');
            return [];
        }

    }

    async saveSegmentDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'segment', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'segment'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const segmentId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.segment || (styleDetail.segment && styleDetail.segment.id !== segmentId)) {
                        styleDetail.segment = new Segment();
                        styleDetail.segment.id = segmentId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.segment = new Segment();
                    queryAdd.segment.id = segmentId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveSegmentDetails.');
            return [];
        }

    }

    async saveAtcDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const atc = style.detailsValue === '1';
                if (styleDetail) {
                    styleDetail.atc = atc;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.atc = atc;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveAtcDetails');
            return [];
        }

    }

    async saveOriginDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'origin', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'origin'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const originId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.origin || (styleDetail.origin && styleDetail.origin.id !== originId)) {
                        styleDetail.origin = new OriginCountry();
                        styleDetail.origin.id = originId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.origin = new OriginCountry();
                    queryAdd.origin.id = originId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveOriginDetails');
            return [];
        }

    }

    async saveRatioDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'ratio', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'ratio'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const ratioId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.ratio || (styleDetail.ratio && styleDetail.ratio.id !== ratioId)) {
                        styleDetail.ratio = new Ratio();
                        styleDetail.ratio.id = ratioId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.ratio = new Ratio();
                    queryAdd.ratio.id = ratioId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveRatioDetails');
            return [];
        }
    }

    async saveSizeDetails(valuesList: StyleDetailDto[], user: UserDecode) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'size', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'size'] });
            const saveEntities: PurchaseStyleDetails[] = [];
            let cleanSkusStylesId: number[] = [];
            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const sizeId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.size || (styleDetail.size && styleDetail.size.id !== sizeId)) {
                        // TODO: clean sku by bussiness rule (size change)
                        if (styleDetail.size && styleDetail.size.id !== sizeId) {
                            cleanSkusStylesId.push(styleDetail.purchaseStyle.styleId);
                        }
                        styleDetail.size = new Size();
                        styleDetail.size.id = sizeId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.size = new Size();
                    queryAdd.size.id = sizeId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            cleanSkusStylesId = _.uniq(cleanSkusStylesId);
            if (cleanSkusStylesId.length > 0) {
                // TODO: validate if user role is BM erase sku, if is Merchant wait for approvement
                this.jdaskuService.cleanSkus(cleanSkusStylesId, CleanSkuRuleCause.SizeDetailChange, user);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveSizeDetails');
            return [];
        }
    }

    async saveShippingMethodDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'shippingMethod', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'shippingMethod'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const shippingMethodId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.shippingMethod || (styleDetail.shippingMethod && styleDetail.shippingMethod.id !== shippingMethodId)) {
                        styleDetail.shippingMethod = new Shipmethod();
                        styleDetail.shippingMethod.id = shippingMethodId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.shippingMethod = new Shipmethod();
                    queryAdd.shippingMethod.id = shippingMethodId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveShippingMethodDetails');
            return [];
        }
    }

    async savePackingMethodDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'packingMethod', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'packingMethod'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const packingMethodId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.packingMethod || (styleDetail.packingMethod && styleDetail.packingMethod.id !== packingMethodId)) {
                        styleDetail.packingMethod = new Packaging();
                        styleDetail.packingMethod.id = packingMethodId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.packingMethod = new Packaging();
                    queryAdd.packingMethod.id = packingMethodId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'savePackingMethodDetails');
            return [];
        }
    }

    async saveHangerDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const hanger = style.detailsValue === '1';
                if (styleDetail) {
                    styleDetail.hanger = hanger;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.hanger = hanger;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveHangerDetails');
            return [];
        }

    }

    async saveVstTagDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const vstTag = style.detailsValue === '1';
                if (styleDetail) {
                    styleDetail.vstTag = vstTag;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.vstTag = vstTag;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveVstTagDetails');
            return [];
        }
    }

    async savePriceDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const priceValue = style.detailsValue !== '' ? parseFloat(style.detailsValue) : 0;
                if (styleDetail) {
                    styleDetail.price = priceValue;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.price = priceValue;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'savePriceDetails');
            return [];
        }
    }

    async savePriceSATODetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const satoValue = style.detailsValue !== '' ? parseFloat(style.detailsValue) : 0;
                if (styleDetail) {
                    styleDetail.sato = satoValue;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.sato = satoValue;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'savePriceSATODetails');
            return [];
        }
    }

    async saveFobDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const fobValue = style.detailsValue !== '' ? parseFloat(style.detailsValue) : 0;
                if (styleDetail) {
                    styleDetail.fob = fobValue;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.fob = fobValue;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveFobDetails');
            return [];
        }
    }

    async saveTechFileDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const techFile = style.detailsValue === '1';
                if (styleDetail) {
                    styleDetail.techFile = techFile;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.techFile = techFile;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveTechFileDetails');
            return [];
        }
    }

    async saveSizeSpecDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const sizeSpec = style.detailsValue === '1';
                if (styleDetail) {
                    styleDetail.sizeSpec = sizeSpec;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.sizeSpec = sizeSpec;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveSizeSpecDetails');
            return [];
        }
    }

    async saveInternetDescriptionDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const internetDescription = style.detailsValue;
                if (styleDetail) {
                    styleDetail.internetDescription = internetDescription;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.internetDescription = internetDescription;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveInternetDescriptionDetails');
            return [];
        }
    }

    async saveNegotiatiorDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const negotiatior = style.detailsValue;
                if (styleDetail) {
                    styleDetail.negotiatior = negotiatior;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.negotiatior = negotiatior;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveNegotiatiorDetails');
            return [];
        }
    }

    async saveDesignerDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const designer = style.detailsValue;
                if (styleDetail) {
                    styleDetail.designer = designer;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.designer = designer;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveDesignerDetails');
            return [];
        }
    }

    async saveMerchandiserDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const merchandiser = style.detailsValue;
                if (styleDetail) {
                    styleDetail.merchandiser = merchandiser;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.merchandiser = merchandiser;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveMerchandiserDetails');
            return [];
        }
    }

    async saveProductManagerDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const productManager = style.detailsValue;
                if (styleDetail) {
                    styleDetail.productManager = productManager;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.productManager = productManager;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveMerchandiserDetails');
            return [];
        }
    }

    async saveBrandManagerDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const brandManager = style.detailsValue;
                if (styleDetail) {
                    styleDetail.brandManager = brandManager;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.brandManager = brandManager;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveMerchandiserDetails');
            return [];
        }
    }

    async saveRseDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'rse', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'rse'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const rseId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.rse || (styleDetail.rse && styleDetail.rse.id !== rseId)) {
                        styleDetail.rse = new Rse();
                        styleDetail.rse.id = rseId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.rse = new Rse();
                    queryAdd.rse.id = rseId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveRseDetails.');
            return [];
        }

    }

    async saveGaugeDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const gauge = style.detailsValue;
                if (styleDetail) {
                    styleDetail.gauge = gauge;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.gauge = gauge;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveGaugeDetails');
            return [];
        }
    }

    async saveFabricWightDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const fabricWight = style.detailsValue;
                if (styleDetail) {
                    styleDetail.fabricWight = fabricWight;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.fabricWight = fabricWight;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveFabricWightDetails');
            return [];
        }
    }

    async saveFabricConstructionDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const fabricConstruction = style.detailsValue;
                if (styleDetail) {
                    styleDetail.fabricConstruction = fabricConstruction;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.fabricConstruction = fabricConstruction;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveFabricConstructionDetails');
            return [];
        }
    }

    async saveFabricWeavingDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const fabricWeaving = style.detailsValue;
                if (styleDetail) {
                    styleDetail.fabricWeaving = fabricWeaving;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.fabricWeaving = fabricWeaving;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveFabricWeavingDetails');
            return [];
        }
    }

    async saveCompositionDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const composition = style.detailsValue;
                if (styleDetail) {
                    styleDetail.composition = composition;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.composition = composition;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveCompositionDetails');
            return [];
        }
    }

    async saveAdditionalAccesoryDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const additionalAccesory = style.detailsValue;
                if (styleDetail) {
                    styleDetail.additionalAccesory = additionalAccesory;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.additionalAccesory = additionalAccesory;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveAdditionalAccesoryDetails');
            return [];
        }
    }

    async saveFobReferencialDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const fobReferencialValue = style.detailsValue !== '' ? parseFloat(style.detailsValue) : 0;
                if (styleDetail) {
                    styleDetail.fobReferencial = fobReferencialValue;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.fobReferencial = fobReferencialValue;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveFobReferencialDetails');
            return [];
        }
    }

    async saveReferencialProviderDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const referencialProvider = style.detailsValue;
                if (styleDetail) {
                    styleDetail.referencialProvider = referencialProvider;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.referencialProvider = referencialProvider;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveReferencialProviderDetails');
            return [];
        }
    }

    async saveCollectionDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const collection = style.detailsValue;
                if (styleDetail) {
                    styleDetail.collection = collection;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.collection = collection;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveCollectionDetails');
            return [];
        }
    }

    async saveEventDetails(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const event = style.detailsValue;
                if (styleDetail) {
                    styleDetail.event = event;
                    saveEntities.push(styleDetail);
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.event = event;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveEventDetails');
            return [];
        }
    }

    async saveSeasonSticker(valuesList: StyleDetailDto[]) {
        try {
            const stylePurchaseIds = valuesList.map(s => s.purchaseStyleStoreId);
            const purchaseStylesDetails = await this.purchaseStyleDetailsRepository.find({ select: ['id', 'seasonSticker', 'purchaseStyle'], where: { purchaseStyle: { id: In(stylePurchaseIds) } }, relations: ['purchaseStyle', 'seasonSticker'] });
            const saveEntities: PurchaseStyleDetails[] = [];

            for (const style of valuesList) {
                const styleDetail = purchaseStylesDetails.find(s => s.purchaseStyle.id === style.purchaseStyleStoreId);
                const seasonStickerId = parseInt(style.detailsValue, null);
                if (styleDetail) {
                    if (!styleDetail.seasonSticker || (styleDetail.seasonSticker && styleDetail.seasonSticker.id !== seasonStickerId)) {
                        styleDetail.seasonSticker = new SeasonSticker();
                        styleDetail.seasonSticker.id = seasonStickerId;
                        saveEntities.push(styleDetail);
                    }
                } else if (!styleDetail) {
                    const queryAdd = new PurchaseStyleDetails();
                    queryAdd.seasonSticker = new SeasonSticker();
                    queryAdd.seasonSticker.id = seasonStickerId;
                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = style.purchaseStyleStoreId;
                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveSeasonSticker');
            return [];
        }
    }

    async saveStyleDetails(detailList: SavePurchaseStyleDetailDto[], user: UserDecode) {
        try {
            const saveEntities: PurchaseStyleDetails[] = [];
            const cleanSkusStylesId: number[] = [];
            const updateArrivalDateStylesId: number[] = [];
            const purchaseStyleIds = detailList.map(s => s.purchaseStyleId);
            const purchaseStyles = await this.purchaseStyleRepository.createQueryBuilder('PS')
                .leftJoinAndSelect('PS.details', 'PSD')
                .leftJoinAndSelect('PSD.origin', 'origin')
                .leftJoinAndSelect('PSD.ratio', 'ratio')
                .leftJoinAndSelect('PSD.size', 'size')
                .leftJoinAndSelect('PSD.shippingMethod', 'shipping')
                .leftJoinAndSelect('PSD.packingMethod', 'packing')
                .leftJoinAndSelect('PSD.seasonSticker', 'sticker')
                .leftJoinAndSelect('PSD.rse', 'rse')
                .leftJoinAndSelect('PSD.cso', 'cso')
                .leftJoinAndSelect('PSD.provider', 'provider')
                .leftJoinAndSelect('PSD.exitPort', 'exitPort')
                .leftJoinAndSelect('PSD.category', 'category')
                .where('PS.id IN (:...purchaseStyleIds)', { purchaseStyleIds })
                .getMany();

            for (const dto of detailList) {
                const style = purchaseStyles.find(ps => ps.id === dto.purchaseStyleId);
                const detail = style.details[0];

                if (style.details.length > 1) {
                    this.logger.warn(`Estilos ${style.id}, tiene mas de un detail. Revisar inconsistencias.`, 'saveStyleDetails');
                }

                if (detail) {
                    if (dto.origin && (!detail.origin || detail.origin.id !== dto.origin)) {
                        updateArrivalDateStylesId.push(style.id);
                        const origin = new OriginCountry();
                        origin.id = dto.origin;
                        detail.origin = origin.id !== -1 ? origin : null;
                    }
                    if (dto.size && (!detail.size || detail.size.id !== dto.size)) {
                        if (detail.size && detail.size.id !== dto.size) {
                            cleanSkusStylesId.push(style.id);
                        }
                        const size = new Size();
                        size.id = dto.size;
                        detail.size = size.id !== -1 ? size : null;
                    }
                    if (dto.ratio && (!detail.ratio || detail.ratio.id !== dto.ratio)) {
                        const ratio = new Ratio();
                        ratio.id = dto.ratio;
                        detail.ratio = ratio.id !== -1 ? ratio : null;
                    }
                    if (dto.shippingMethod && (!detail.shippingMethod || detail.shippingMethod.id !== dto.shippingMethod)) {
                        const shippingMethod = new Shipmethod();
                        shippingMethod.id = dto.shippingMethod;
                        detail.shippingMethod = shippingMethod.id !== -1 ? shippingMethod : null;
                    }
                    if (dto.packingMethod && (!detail.packingMethod || detail.packingMethod.id !== dto.packingMethod)) {
                        const packingMethod = new Packaging();
                        packingMethod.id = dto.packingMethod;
                        detail.packingMethod = packingMethod.id !== -1 ? packingMethod : null;
                    }
                    if (dto.seasonSticker && (!detail.seasonSticker || detail.seasonSticker.id !== dto.seasonSticker)) {
                        const seasonSticker = new SeasonSticker();
                        seasonSticker.id = dto.seasonSticker;
                        detail.seasonSticker = seasonSticker.id !== -1 ? seasonSticker : null;
                    }
                    if (dto.rse && (!detail.rse || detail.rse.id !== dto.rse)) {
                        const rse = new Rse();
                        rse.id = dto.rse;
                        detail.rse = rse.id !== -1 ? rse : null;
                    }
                    if (dto.cso && (!detail.cso || detail.cso.id !== dto.cso)) {
                        const cso = new Cso();
                        cso.id = dto.cso;
                        detail.cso = cso.id !== -1 ? cso : null;
                    }
                    if (dto.category && (!detail.category || detail.category.id !== dto.category)) {
                        const category = new Category();
                        category.id = dto.category;
                        detail.category = category.id !== -1 ? category : null;
                    }
                    if (dto.provider && (!detail.provider || detail.provider.id !== dto.provider)) {
                        if (detail.provider && detail.provider.id !== dto.provider) {
                            cleanSkusStylesId.push(style.id);
                        }
                        const provider = new Provider();
                        provider.id = dto.provider;
                        detail.provider = provider.id !== -1 ? provider : null;
                    }
                    if (dto.exitPort && (!detail.exitPort || detail.exitPort.id !== dto.exitPort)) {
                        const exitPort = new ExitPort();
                        exitPort.id = dto.exitPort;
                        detail.exitPort = exitPort.id !== -1 ? exitPort : null;
                    }
                    if (dto.segment && (!detail.segment || detail.segment.id !== dto.segment )) {
                        const segment = new Segment();
                        segment.id = dto.segment;
                        detail.segment = segment.id !== -1 ? segment : null;
                    }
                    detail.atc = dto.atc !== detail.atc ? dto.atc : detail.atc;
                    detail.hanger = dto.hanger !== detail.hanger ? dto.hanger : detail.hanger;
                    detail.composition = dto.composition !== detail.composition ? dto.composition : detail.composition;
                    detail.fabricWeaving = dto.fabricWeaving !== detail.fabricWeaving ? dto.fabricWeaving : detail.fabricWeaving;
                    detail.fabricConstruction = dto.fabricConstruction !== detail.fabricConstruction ? dto.fabricConstruction : detail.fabricConstruction;
                    detail.fabricWight = dto.fabricWight !== detail.fabricWight ? dto.fabricWight : detail.fabricWight;
                    detail.gauge = dto.gauge !== detail.gauge ? dto.gauge : detail.gauge;
                    detail.additionalAccesory = dto.additionalAccesory !== detail.additionalAccesory ? dto.additionalAccesory : detail.additionalAccesory;
                    detail.merchandiser = dto.merchandiser !== detail.merchandiser ? dto.merchandiser : detail.merchandiser;
                    detail.brandManager = dto.brandManager !== detail.brandManager ? dto.brandManager : detail.brandManager;
                    detail.designer = dto.designer !== detail.designer ? dto.designer : detail.designer;
                    detail.productManager = dto.productManager !== detail.productManager ? dto.productManager : detail.productManager;
                    detail.negotiatior = dto.negotiatior !== detail.negotiatior ? dto.negotiatior : detail.negotiatior;
                    detail.techFile = dto.techFile !== detail.techFile ? dto.techFile : detail.techFile;
                    detail.sizeSpec = dto.sizeSpec !== detail.sizeSpec ? dto.sizeSpec : detail.sizeSpec;
                    detail.referencialProvider = dto.referencialProvider !== detail.referencialProvider ? dto.referencialProvider : detail.referencialProvider;
                    detail.internetDescription = dto.internetDescription !== detail.internetDescription ? dto.internetDescription : detail.internetDescription;
                    detail.collection = dto.collection !== detail.collection ? dto.collection : detail.collection;
                    detail.event = dto.event !== detail.event ? dto.event : detail.event;
                    detail.fob = dto.fob !== detail.fob ? dto.fob : detail.fob;
                    detail.fobReferencial = dto.fobReferencial !== detail.fobReferencial ? dto.fobReferencial : detail.fobReferencial;
                    detail.price = dto.price !== detail.price ? dto.price : detail.price;
                    detail.sato = dto.sato !== detail.sato ? dto.sato : detail.sato;

                    saveEntities.push(detail);
                } else if (!detail && dto.purchaseStyleId) {
                    const queryAdd = new PurchaseStyleDetails();

                    queryAdd.purchaseStyle = new PurchaseStyle();
                    queryAdd.purchaseStyle.id = dto.purchaseStyleId;

                    if (dto.origin) {
                        updateArrivalDateStylesId.push(style.id);
                        const origin = new OriginCountry();
                        origin.id = dto.origin;
                        queryAdd.origin = origin.id !== -1 ? origin : null;
                    }
                    if (dto.size) {
                        const size = new Size();
                        size.id = dto.size;
                        queryAdd.size = size.id !== -1 ? size : null;
                    }
                    if (dto.ratio) {
                        const ratio = new Ratio();
                        ratio.id = dto.ratio;
                        queryAdd.ratio = ratio.id !== -1 ? ratio : null;
                    }
                    if (dto.shippingMethod) {
                        const shippingMethod = new Shipmethod();
                        shippingMethod.id = dto.shippingMethod;
                        queryAdd.shippingMethod = shippingMethod.id !== -1 ? shippingMethod : null;
                    }
                    if (dto.packingMethod) {
                        const packingMethod = new Packaging();
                        packingMethod.id = dto.packingMethod;
                        queryAdd.packingMethod = packingMethod.id !== -1 ? packingMethod : null;
                    }
                    if (dto.seasonSticker) {
                        const seasonSticker = new SeasonSticker();
                        seasonSticker.id = dto.seasonSticker;
                        queryAdd.seasonSticker = seasonSticker.id !== -1 ? seasonSticker : null;
                    }
                    if (dto.rse) {
                        const rse = new Rse();
                        rse.id = dto.rse;
                        queryAdd.rse = rse.id !== -1 ? rse : null;
                    }
                    if (dto.cso) {
                        const cso = new Cso();
                        cso.id = dto.cso;
                        queryAdd.cso = cso.id !== -1 ? cso : null;
                    }
                    if (dto.category) {
                        const category = new Category();
                        category.id = dto.category;
                        queryAdd.category = category.id !== -1 ? category : null;
                    }
                    if (dto.provider) {
                        const provider = new Provider();
                        provider.id = dto.provider;
                        queryAdd.provider = provider.id !== -1 ? provider : null;
                    }
                    if (dto.exitPort) {
                        const exitPort = new ExitPort();
                        exitPort.id = dto.exitPort;
                        queryAdd.exitPort = exitPort.id !== -1 ? exitPort : null;
                    }
                    if (dto.segment) {
                        const segment = new Segment();
                        segment.id = dto.segment;
                        queryAdd.segment = segment.id !== -1 ? segment : null;
                    }
                    queryAdd.atc = dto.atc;
                    queryAdd.hanger = dto.hanger;
                    queryAdd.composition = dto.composition;
                    queryAdd.fabricWeaving = dto.fabricWeaving;
                    queryAdd.fabricConstruction = dto.fabricConstruction;
                    queryAdd.fabricWight = dto.fabricWight;
                    queryAdd.gauge = dto.gauge;
                    queryAdd.additionalAccesory = dto.additionalAccesory;
                    queryAdd.merchandiser = dto.merchandiser;
                    queryAdd.brandManager = dto.brandManager;
                    queryAdd.designer = dto.designer;
                    queryAdd.productManager = dto.productManager;
                    queryAdd.negotiatior = dto.negotiatior;
                    queryAdd.techFile = dto.techFile;
                    queryAdd.sizeSpec = dto.sizeSpec;
                    queryAdd.referencialProvider = dto.referencialProvider;
                    queryAdd.internetDescription = dto.internetDescription;
                    queryAdd.collection = dto.collection;
                    queryAdd.event = dto.event;
                    queryAdd.fob = dto.fob;
                    queryAdd.fobReferencial = dto.fobReferencial;
                    queryAdd.price = dto.price;
                    queryAdd.sato = dto.sato;

                    saveEntities.push(queryAdd);
                }
            }
            if (saveEntities.length > 0) {
                await this.purchaseStyleDetailsRepository.save(saveEntities, { chunk: 50 });
            }
            if (updateArrivalDateStylesId.length > 0) {
                const body: generateArrivalDatesDto = { purchaseStyleIds: updateArrivalDateStylesId }
                this.updateArrivalDates(body);
            }
            if (cleanSkusStylesId.length > 0) {
                // TODO: validate if user role is BM erase sku, if is Merchant wait for approvement
                this.jdaskuService.cleanSkus(_.uniq(cleanSkusStylesId), CleanSkuRuleCause.ProviderDetailChange, user);
            }
            return saveEntities;
        } catch (error) {
            this.logger.error(error.message, error, 'saveStyleDetails');
            throw error;
        }
    }

    async updateArrivalDates(body: generateArrivalDatesDto) {
        try {
            let query = this.purchaseRepository.createQueryBuilder('P')
                .leftJoinAndSelect('P.stores', 'PST')
                .leftJoinAndSelect('PST.styles', 'PS')
                .leftJoinAndSelect('PS.colors', 'PSC')
                .leftJoinAndSelect('PSC.shippings', 'PSCS')
                .leftJoinAndSelect('PS.details', 'PSD')
                .leftJoinAndSelect('PSD.origin', 'O')
            
            const { purchaseStyleIds, purchaseStyleColorIds, purchaseIds } = body;

            if (purchaseStyleIds) {
                query = query.where('PS.id IN (:...purchaseStyleId)', { purchaseStyleId: purchaseStyleIds });
            }
            if (purchaseStyleColorIds) {
                query = query.where('PSC.id IN (:...purchaseStyleColorId)', { purchaseStyleColorId: purchaseStyleColorIds});
            }
            if (purchaseIds) {
                query = query.where('P.id IN (:...purchaseIds)', { purchaseIds: purchaseIds });
            }

            const purchases = await query.getMany();
            const PSCSEntities: PurchaseStyleColorShipping[] = [];

            const shippingDatesChild = await this.shippingDatesChildRepository.createQueryBuilder('sd')
                .leftJoinAndSelect('sd.originCountryId', 'origin')
                .leftJoin('sd.seasonCommercialId','season')
                .where('season.id IN (:...seasonCommercialIds)', { seasonCommercialIds: purchases.map(p=> p.seasonCommercialId) })
                .getMany();
            
            for(const purchase of purchases) {
                const purchaseStyles = _.flatten(purchase.stores.map(store => store.styles));
                for(const style of purchaseStyles) {
                    const originId = style.details[0]?.origin?.id;
                    const styleShippings = _.flatten(style.colors.map(color => color.shippings));
                    for (const shipping of styleShippings) {
                        if (shipping.date) {
                            let arrivalDate: Date;
                            if (originId === 4) {
                                arrivalDate = new Date(moment(shipping.date).add(49, 'days').toISOString());
                            } else {
                                const shippingDate = shippingDatesChild.find(item => item.originCountryId.id === originId);
                                arrivalDate = new Date(moment(shipping.date).add(49 - (shippingDate.days), 'days').toISOString());
                            }
                            shipping.arrivalDate = arrivalDate;
                            PSCSEntities.push(shipping);
                        }
                    }                    
                }                
            }
            
            const countPack = 500;
            let i = 0;
            do {
                const pack = PSCSEntities.slice(i, countPack + i);
                await this.purchaseStyleColorShippingRepository.save(pack);
                i += countPack;
                if (countPack + i > PSCSEntities.length) {
                    const packEnd = PSCSEntities.slice(i, countPack + i);
                    await this.purchaseStyleColorShippingRepository.save(packEnd);
                }
            }
            while (PSCSEntities.length > countPack + i);
            return PSCSEntities;
        } catch (error) {
            this.logger.error(error);
        }   
    }

    async getDetailsByIds(stylePurchaseIds: number[]) {
        if(stylePurchaseIds.length > 0) {
            const purchaseStyles = await this.purchaseStyleRepository.createQueryBuilder('PS')
                .leftJoinAndSelect('PS.details', 'PSD')
                .leftJoinAndSelect('PSD.cso', 'cso')
                .leftJoinAndSelect('PSD.category', 'category')
                .leftJoinAndSelect('PSD.provider', 'provider')
                .leftJoinAndSelect('PSD.rse', 'rse')
                .leftJoinAndSelect('PSD.packingMethod', 'packingMethod')
                .leftJoinAndSelect('PSD.exitPort', 'exitPort')
                .leftJoinAndSelect('PSD.segment', 'segment')
                .leftJoinAndSelect('PSD.shippingMethod', 'shippingMethod')
                .leftJoinAndSelect('PSD.size', 'size')
                .leftJoinAndSelect('PSD.ratio', 'ratio')
                .leftJoinAndSelect('PSD.origin', 'origin')
                .leftJoinAndSelect('PSD.seasonSticker', 'sticker')
                .where('PS.id IN (:...purchaseStyleIds)', { purchaseStyleIds: stylePurchaseIds })
                .getMany();
            
            const details = purchaseStyles.map(ps => ps.details[0]);
            return details.filter(detail => detail);
        } else {
            return [];
        }
    }

    async getStylesToNegotiateByFilter(filter: FilterStylesToNegotiationDto) {
        try {
            let query = this.purchaseStyleRepository
                .createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('purchase.status', 'purchaseStatus')
                .leftJoinAndSelect('purchaseStyle.status', 'styleStatus')
                .leftJoinAndSelect('purchaseStyle.details', 'purchaseDetails')
                .leftJoinAndSelect('purchaseDetails.packingMethod', 'packingMethod')
                .leftJoinAndSelect('purchaseDetails.category', 'category')
                .leftJoinAndSelect('purchase.negotiations', 'negotiations')
                .leftJoinAndSelect('negotiations.provider', 'provider')
                .leftJoinAndSelect('negotiations.exitPort', 'exitPort')
                .where({ active: true })
                .andWhere('colors.state = true')
                .andWhere('purchaseStyle.deleteDate IS NULL')
                .andWhere('negotiations.deleteDate IS NULL')
                .andWhere(`purchaseStatus.id IN (${Status.PendingNegotiation}, ${Status.InNegotiation})`);

            if (filter.purchaseIds && filter.purchaseIds.trim().length > 0) {
                query = query.andWhere(`purchase.id IN (${filter.purchaseIds})`);
            }
            if (filter.status && filter.status.length > 0) {
                query = query.andWhere(`styleStatus.id IN (${filter.status})`);
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.categories && filter.categories.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.categories.forEach((categoryId) => {
                            qb = qb.orWhere('category.id=' + categoryId);
                        });
                    }));
            }

            const allPurchaseStyles = await query.getMany();
            let selectPurchaseStyles = allPurchaseStyles.filter(st => st.purchaseStore.store.shortName === StoresEnum.Paris);
            const selectPurchaseStylesEcommerce = allPurchaseStyles.filter(st => st.purchaseStore.store.shortName === StoresEnum.ParisEcommerce);
            if (selectPurchaseStyles.length === 0) {
                selectPurchaseStyles = allPurchaseStyles.filter(st => st.purchaseStore.store.shortName === StoresEnum.TTPP);
                if (selectPurchaseStyles.length === 0) {
                    selectPurchaseStyles = selectPurchaseStylesEcommerce;
                }
            }
            const uniqStyles = _.uniqBy(selectPurchaseStyles, 'styleId');
            let stylesData = await this.externalStyleService.getStylesDataByIds(uniqStyles.map(s => s.styleId));
            if (uniqStyles.length > 0 && stylesData.length === 0) {
                this.logger.error('Datos de estilos no encontrados');
            } else {
                if (filter.brands && filter.brands.length > 0) {
                    stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
                }
                if (filter.departments && filter.departments.length > 0) {
                    stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
                }
                if (filter.classTypes && filter.classTypes.length > 0) {
                    stylesData = stylesData.filter(s => filter.classTypes.indexOf(s.classTypeId) !== -1);
                }
                if (filter.subDepartments && filter.subDepartments.length > 0) {
                    stylesData = stylesData.filter(s => filter.subDepartments.indexOf(s.subDepartmentId) !== -1);
                }
                if (filter.referentialsCodes && filter.referentialsCodes.length > 0) {
                    stylesData = stylesData.filter(s => filter.referentialsCodes.indexOf(s.code) !== -1);
                }
            }

            const result = selectPurchaseStyles.filter(p => stylesData.map(s => s.id).indexOf(p.styleId) !== -1).map(purchaseStyle => {
                const styleData = stylesData.find(s => s.id === purchaseStyle.styleId);
                const ecommerceStyle = selectPurchaseStylesEcommerce.find(s => s.styleId === purchaseStyle.styleId) ? true : false;
                const purchaseStyleNegotiation = new GetPurchaseStyleToNegotiate(purchaseStyle, styleData, ecommerceStyle, purchaseStyle.purchaseStore.purchase.negotiations);
                return purchaseStyleNegotiation;
            });
            return result;
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }

    async saveNegotiations(dto: CreateNegotiationDto) {
        const { purchaseId, negotiations, styleId, userMerchantId } = dto;
        const allNegotiationsByPurchaseAndStyleId = await this.purchaseStyleNegotiationRepository
            .createQueryBuilder('negotiation')
            .leftJoinAndSelect('negotiation.purchase', 'purchase')
            .leftJoinAndSelect('negotiation.provider', 'provider')
            .leftJoinAndSelect('negotiation.exitPort', 'exitPort')
            .andWhere('purchase.id=:id', { id: purchaseId })
            .andWhere('negotiation.styleId=:styleId', { styleId })
            .getMany();

        if (negotiations.filter(n => n.suggestedVendor).length > 0) {
            allNegotiationsByPurchaseAndStyleId.forEach(n => {
                n.suggestedVendor = false;
            });
        }

        for (const negotiationDto of negotiations) {
            let negotiationEntity = allNegotiationsByPurchaseAndStyleId.find(n => n.id === negotiationDto.id);
            if (negotiationEntity) {
                negotiationEntity.provider.id = negotiationDto.provider.id;
                negotiationEntity.exitPort.id = negotiationDto.exitPort.id;
                negotiationEntity.fob = negotiationDto.fob;
                negotiationEntity.comments = negotiationDto.comments;
                negotiationEntity.selected = negotiationDto.selected;
                negotiationEntity.userMerchantId = userMerchantId;
                negotiationEntity.suggestedVendor = negotiationDto.suggestedVendor;
            } else {
                negotiationEntity = new PurchaseStyleNegotiation();
                negotiationEntity.purchase = new Purchase();
                negotiationEntity.purchase.id = purchaseId;
                negotiationEntity.provider = new Provider();
                negotiationEntity.provider.id = negotiationDto.provider.id;
                negotiationEntity.exitPort = new ExitPort();
                negotiationEntity.exitPort.id = negotiationDto.exitPort.id;
                negotiationEntity.styleId = styleId;
                negotiationEntity.fob = negotiationDto.fob;
                negotiationEntity.comments = negotiationDto.comments;
                negotiationEntity.selected = negotiationDto.selected;
                negotiationEntity.userMerchantId = userMerchantId;
                negotiationEntity.suggestedVendor = negotiationDto.suggestedVendor;
                allNegotiationsByPurchaseAndStyleId.push(negotiationEntity);
            }

        }
        await this.purchaseStyleNegotiationRepository.save(allNegotiationsByPurchaseAndStyleId);
        const purchaseStylesUpdate = await this.purchaseStyleRepository
            .createQueryBuilder('purchaseStyle')
            .leftJoin('purchaseStyle.purchaseStore', 'purchaseStore')
            .leftJoin('purchaseStore.purchase', 'purchase')
            .andWhere('purchase.id=:id', { id: purchaseId })
            .andWhere('purchaseStyle.styleId=:styleId', { styleId })
            .select('purchaseStyle.id')
            .getMany();
        await this.purchaseStyleRepository.update(purchaseStylesUpdate.map(p => p.id), { status: { id: StatusPurchaseColorEnum.Cotizado } });
        return allNegotiationsByPurchaseAndStyleId.map(n => new NegotiationDto(n));
    }

    async exportNegotiation(filter: FilterPurchaseToExportNegotiationDto) {
        try {
            let query = this.purchaseStyleRepository.createQueryBuilder('purchaseStyle')
                .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('purchase.status', 'purchaseStatus')
                .leftJoinAndSelect('purchaseStyle.status', 'styleStatus')
                .leftJoinAndSelect('purchaseStyle.details', 'purchaseDetails')
                .leftJoinAndSelect('purchaseDetails.packingMethod', 'packingMethod')
                .leftJoinAndSelect('purchaseDetails.category', 'category')
                .leftJoinAndSelect('purchaseDetails.size', 'size')
                .leftJoinAndSelect('purchaseDetails.ratio', 'ratio')
                .leftJoinAndSelect('purchaseDetails.rse', 'rse')
                .leftJoinAndSelect('purchaseDetails.provider', 'provider')
                .where({ active: true })
                .andWhere('purchaseStyle.deleteDate IS NULL')
                .andWhere('colors.state = true')
                .andWhere(`purchaseStatus.id IN (${Status.PendingNegotiation}, ${Status.Cotizations}, ${Status.InNegotiation})`);
            // Apply filters
            if (filter.purchaseIds && filter.purchaseIds.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.purchaseIds.forEach((purchaseId) => {
                            qb = qb.orWhere('purchase.id=' + purchaseId);
                        });
                    }));
            }
            if (filter.status && filter.status.length > 0) {
                query = query.andWhere(`styleStatus.id IN (${filter.status})`);
            }
            if (filter.brands && filter.brands.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.brands.forEach((brandId) => {
                            qb = qb.orWhere(brandId + '=ANY(purchase.brands)');
                        });
                    }));
            }
            if (filter.departments && filter.departments.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.departments.forEach((departmentId) => {
                            qb = qb.orWhere(departmentId + '=ANY(purchase.departments)');
                        });
                    }));
            }
            if (filter.categories && filter.categories.length > 0) {
                query = query.andWhere(
                    new Brackets((qb) => {
                        filter.categories.forEach((categoryId) => {
                            qb = qb.orWhere('category.id=' + categoryId);
                        });
                    }));
            }
            // Get purchase data drom DB
            const purchaseStyles = await query.getMany();
            if (purchaseStyles.length <= 0) { return null; }
            // Find styles from style service
            const uniqStylesId = _.uniq(purchaseStyles.map(p => p.styleId));
            let stylesData = uniqStylesId && uniqStylesId.length > 0 ? await this.externalStyleService.getStylesDataByIds(uniqStylesId) : [];
            if (stylesData.length <= 0) { return null; }
            // Apply filter to styles
            if (filter.brands && filter.brands.length > 0) {
                stylesData = stylesData.filter(s => filter.brands.indexOf(s.brandId) !== -1);
            }
            if (filter.departments && filter.departments.length > 0) {
                stylesData = stylesData.filter(s => filter.departments.indexOf(s.departmentId) !== -1);
            }
            if (filter.classTypes && filter.classTypes.length > 0) {
                stylesData = stylesData.filter(s => filter.classTypes.indexOf(s.classTypeId) !== -1);
            }
            if (filter.subDepartments && filter.subDepartments.length > 0) {
                stylesData = stylesData.filter(s => filter.subDepartments.indexOf(s.subDepartmentId) !== -1);
            }
            if (filter.referentialsCodes && filter.referentialsCodes.length > 0) {
                stylesData = stylesData.filter(s => filter.referentialsCodes.indexOf(s.code) !== -1);
            }
            // Find user from security service
            const usersId = purchaseStyles.map(p => _.first(p.details)?.brandManager).concat(purchaseStyles.map(p => _.first(p.details)?.merchandiser));
            const uniqUsersIds = _.uniq(usersId.map(user => {
                const id = parseInt(user, null);
                return id && !isNaN(id) ? id : -1;
            }));
            const usersData = uniqUsersIds && uniqUsersIds.length > 0 ? await this.securityProxyService.getUsers({ ids: uniqUsersIds, departments: [], roles: [] }) : [];
            // Create static data set
            const data = [];
            const groupedStyles = _.chain(purchaseStyles).groupBy('styleId').map((value, key) => ({ styleId: parseInt(key, 10), purchaseStyles: value })).value();
            groupedStyles.forEach(item => {
                const style = stylesData.find(s => s.id === item.styleId);
                const purchaseStyleDetail = _.first(_.first(item.purchaseStyles).details);
                const units = _.flatten(item.purchaseStyles.map(p => _.flatten(p.colors.map(c => c.shippings.filter(s => s.units > 0))))) as PurchaseStyleColorShipping[];

                const colors = _.uniq(_.flatten(item.purchaseStyles.map(p => _.flatten(p.colors.map(c => c.styleColorId)))));
                const totalUnits = _.sum(units.map(u => u.units)).toString();
                const firstDeliveryDate = moment(_.first(_.orderBy(units, u => moment(u.date)))?.date).format('DD-MMM-yyyy');
                let merchandiser = 'NO APLICA';
                if (purchaseStyleDetail.merchandiser && purchaseStyleDetail.merchandiser !== '-1') {
                    const productManagerUser = usersData?.find(u => u.id === parseInt(purchaseStyleDetail.merchandiser, null) ?? -1);
                    merchandiser = productManagerUser ? `${productManagerUser.firstName} ${productManagerUser.lastName}` : purchaseStyleDetail.merchandiser;
                }
                if (style && purchaseStyleDetail) {
                    const purchaseStyle = {
                        status: _.first(item.purchaseStyles)?.status?.name,
                        productType: style.articleType,
                        division: style.division,
                        deparment: style.departmentCode,
                        merchandiser,
                        category: purchaseStyleDetail.category?.name,
                        brand: style.brand,
                        style: style.code,
                        size: purchaseStyleDetail.size?.size,
                        ratio: purchaseStyleDetail.ratio?.ratio,
                        totalcolors: colors.length.toString(),
                        totalUnits,
                        internet: item.purchaseStyles.filter(p => p.purchaseStore?.store?.shortName === StoresEnum.ParisEcommerce).length > 0,
                        firstDeliveryDate,
                        packingMethod: purchaseStyleDetail.packingMethod?.name,
                        hanger: purchaseStyleDetail.hanger,
                        composition: purchaseStyleDetail.composition,
                        fabricWeaving: purchaseStyleDetail.fabricWeaving,
                        fabricConstruction: purchaseStyleDetail.fabricConstruction,
                        fabricWeight: purchaseStyleDetail.fabricWight,
                        gauge: purchaseStyleDetail.gauge,
                        rse: purchaseStyleDetail.rse?.name,
                        targetPrice: purchaseStyleDetail.fob,
                        referencePrice: purchaseStyleDetail.fobReferencial,
                        referenceVendor: purchaseStyleDetail.provider?.name,
                    };
                    data.push(purchaseStyle);
                }
            });
            // Create excel document
            const excel = new Excel();
            const wb = excel.getWorkBook();
            const workSheet1: IWorkSheet = {
                name: 'Hoja 1',
            };
            const workSheet2: IWorkSheet = {
                name: 'Base',
                options: {
                    hidden: true,
                },
            };
            excel.setWorkSheets(workSheet1);
            excel.setWorkSheets(workSheet2);
            const columnHeaders = [
                'STATUS', 'TYPE OF PRODUCT', 'DIVISION', 'ID DEPTO CL', 'MERCHANDISER', 'CATEGORY', 'BRAND', 'STYLE',
                'SIZE', 'RATIO', 'QTY COLORS', 'TOTAL QTY', 'INTERNET', '1ST DELIVERY DATE', 'PACKING METHOD', 'HANGER',
                'COMPOSITION', 'FABRIC WEAVING', 'FABRIC CONSTRUCTION', 'FABRIC WEIGHT', 'GAUGE', 'RSE', 'TARGET PRICE',
                'LY REFERENCE PRICE', 'LY REFERENCE VENDOR', 'CSO VENDOR', 'CSO FOB',
            ];
            // Add sheets to documents
            const lengthRows = data.length + 1;
            excel.setHeaders(workSheet1.name, columnHeaders);
            excel.setDataToWorksheet(workSheet1.name, data);
            // Find validation list data
            const providers = await this.providerRepository.createQueryBuilder('provider')
                .select(['provider.name'])
                .distinctOn(['provider.name'])
                .orderBy('provider.name', 'ASC')
                .getMany();
            const exitPorts = await this.exitPortRepository.createQueryBuilder('exitport')
                .select(['exitport.name'])
                .distinctOn(['exitport.name'])
                .orderBy('exitport.name', 'ASC')
                .getMany();
            // Add validation list to columns
            const providersNames = providers.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 1);
                return item.name;
            });
            const exitPortsNames = exitPorts.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 2);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=Base!$A$1:$A$${providersNames.length}`, `Z2:Z${lengthRows}`);
            // Get all negotiations
            const uniqPurchasesIds = _.uniq(purchaseStyles.map(p => p.purchaseStore?.purchase?.id));
            const negotiations = await this.purchaseStyleNegotiationRepository
                .createQueryBuilder('negotiation')
                .leftJoinAndSelect('negotiation.purchase', 'purchase')
                .leftJoinAndSelect('negotiation.provider', 'provider')
                .leftJoinAndSelect('negotiation.exitPort', 'exitPort')
                .leftJoinAndSelect('purchase.status', 'purchaseStatus')
                .where('negotiation.deleteDate IS NULL')
                .andWhere(`purchase.id IN (${uniqPurchasesIds})`)
                .andWhere(`negotiation.styleId IN (${stylesData.map(s => s.id)})`)
                .getMany();
            // Create dynamic data set
            const groupedNegotiations = _.chain(negotiations).groupBy('provider.id').map((value, key) => ({ providerId: parseInt(key, 10), negotiations: value })).value();
            const providersLength = groupedNegotiations.length < 15 ? 15 * 3 : groupedNegotiations.length * 3;
            for (let col = 28, index = 0; col < providersLength + 28; col += 3, index++) {
                const negotiationGroup = groupedNegotiations[index];
                const headerName = negotiationGroup ? _.first(negotiationGroup.negotiations)?.provider?.name : 'VENDOR';
                excel.setCell(workSheet1.name, headerName, 1, col);
                excel.setCell(workSheet1.name, 'EXIT PORT', 1, col + 1);
                excel.setCell(workSheet1.name, 'COMMENTS', 1, col + 2);
                excel.setValidationList(workSheet1.name, `=Base!$A$1:$A$${providersNames.length}`, 1, col, 1, col);

                groupedStyles.forEach((item, row) => {
                    if (negotiationGroup) {
                        const purchaseStyleNegotiation = negotiationGroup.negotiations.find(n => n.styleId === item.styleId);
                        if (purchaseStyleNegotiation) {
                            excel.setCell(workSheet1.name, purchaseStyleNegotiation.fob, row + 2, col);
                            excel.setCell(workSheet1.name, purchaseStyleNegotiation.exitPort?.name, row + 2, col + 1);
                            excel.setCell(workSheet1.name, purchaseStyleNegotiation.comments, row + 2, col + 2);
                            if (purchaseStyleNegotiation.suggestedVendor) {
                                excel.setCell(workSheet1.name, purchaseStyleNegotiation.provider?.name, `Z${row + 2}`);
                                excel.setCell(workSheet1.name, purchaseStyleNegotiation.fob, `AA${row + 2}`);
                            }
                        }
                    }
                    excel.setValidationList(workSheet1.name, `=Base!$B$1:$B$${exitPortsNames.length}`, row + 2, col + 1, row + 2, col + 1);
                });
            }
            // Add styles to document
            const header1Style = {
            font: { bold: true },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#a7d08c',
                fgColor: '#a7d08c',
            },
            };
            const header2Style = {
                font: { bold: true },
                fill: {
                  type: 'pattern',
                  patternType: 'solid',
                  bgColor: '#fed966',
                  fgColor: '#fed966',
                },
              };
            const header3Style = {
                border: {
                    left: {
                        style: 'thin',
                        color: 'black',
                    },
                    right: {
                        style: 'thin',
                        color: 'black',
                    },
                    top: {
                        style: 'thin',
                        color: 'black',
                    },
                    bottom: {
                        style: 'medium',
                        color: 'black',
                    },
                    outline: false,
                },
            };
            const header4Style = {
                border: {
                    left: {
                        style: 'thin',
                        color: 'black',
                    },
                    right: {
                        style: 'thin',
                        color: 'black',
                    },
                    top: {
                        style: 'thin',
                        color: 'black',
                    },
                    bottom: {
                        style: 'thin',
                        color: 'black',
                    },
                    outline: false,
                },
            };
            excel.setCellStyle(workSheet1.name, header1Style, 1, 1, 1, 25);
            excel.setCellStyle(workSheet1.name, header2Style, 1, 26, 1, providersLength + 27);
            excel.setCellStyle(workSheet1.name, header4Style, 1, 1, lengthRows, providersLength + 27);
            excel.setCellStyle(workSheet1.name, header3Style, 1, 1, 1, providersLength + 27);
            // Lock cells
            excel.lockCells(workSheet1.name, `A1:Y${lengthRows}`);
            // Write buffer file
            const buffer = await wb.writeToBuffer();
            const name = `Negotiation_${uuidv4()}.xlsx`;
            // Upload to S3
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            const url = await S3.uploadFile(Buffer.from(buffer, 'binary'), name, 'application/msexcel', 600, this.logger);
            return url;
        } catch (error) {
            this.logger.error(`CATCH Error generando el archivo excel: ${error}`);
            throw new InternalServerErrorException();
        }
    }

    async importNegotiation(dto: CreateNegotiationDto[]) {
        for (const createNegotiation of dto) {
            const { purchaseId, negotiations, styleId, userMerchantId } = createNegotiation;
            const negotiationsToDelete = await this.purchaseStyleNegotiationRepository
                .createQueryBuilder('negotiation')
                .leftJoinAndSelect('negotiation.purchase', 'purchase')
                .andWhere('purchase.id=:id', { id: purchaseId })
                .andWhere('negotiation.styleId=:styleId', { styleId })
                .getMany();
            if (negotiationsToDelete.length > 0) {
                await this.purchaseStyleNegotiationRepository.softDelete(negotiationsToDelete.map(p => p.id));
            }

            const purchaseStyleNegotiations = [];
            for (const negotiationDto of negotiations) {
                const negotiationEntity = new PurchaseStyleNegotiation();
                negotiationEntity.purchase = new Purchase();
                negotiationEntity.purchase.id = purchaseId;
                negotiationEntity.provider = new Provider();
                negotiationEntity.provider.id = negotiationDto.provider.id;
                negotiationEntity.exitPort = new ExitPort();
                negotiationEntity.exitPort.id = negotiationDto.exitPort.id;
                negotiationEntity.styleId = styleId;
                negotiationEntity.fob = negotiationDto.fob;
                negotiationEntity.comments = negotiationDto.comments;
                negotiationEntity.selected = negotiationDto.selected;
                negotiationEntity.userMerchantId = userMerchantId;
                negotiationEntity.suggestedVendor = negotiationDto.suggestedVendor;
                purchaseStyleNegotiations.push(negotiationEntity);
            }

            if (purchaseStyleNegotiations.length > 0) {
                await this.purchaseStyleNegotiationRepository.save(purchaseStyleNegotiations);
                const purchaseStylesUpdate = await this.purchaseStyleRepository
                    .createQueryBuilder('purchaseStyle')
                    .leftJoin('purchaseStyle.purchaseStore', 'purchaseStore')
                    .leftJoin('purchaseStore.purchase', 'purchase')
                    .andWhere('purchase.id=:id', { id: purchaseId })
                    .andWhere('purchaseStyle.styleId=:styleId', { styleId })
                    .select('purchaseStyle.id')
                    .getMany();
                await this.purchaseStyleRepository.update(purchaseStylesUpdate.map(p => p.id), { status: { id: StatusPurchaseColorEnum.Cotizado }});
            }
        }
    }

    async updateStatus(dto: UpdatePurchaseStyleStatusDto, user: GetUserDto) {
        const status = await this.statusPurchaseColorRepository.findOne(dto.statusId);
        if (status) {
            const responseUpdate = await this.purchaseStyleRepository.update(dto.purchaseStyles, { status: { id: status.id }});
            if (responseUpdate.affected > 0) {
                const merchantUser = await this.securityProxyService.getUsers({ ids: [user.id], roles: null, departments: null });
                const merchantFullName = `${merchantUser[0].firstName} ${merchantUser[0].lastName}`;
                const purchaseStyle = await this.purchaseStyleRepository.findOne({ where: { id: dto.purchaseStyles[0] }, relations: ['purchaseStore', 'purchaseStore.purchase']});
                const purchaseInfo = purchaseStyle.purchaseStore.purchase;
                const notification: NotificationDto = {
                    description: `El Merchant ${merchantFullName} actualizó cotizaciones para la compra ${purchaseInfo.name}`,
                    notificationType: NotificationTypeEnum.Negotiation,
                    originUserId: merchantUser[0].id,
                    creatorPurchaseUserId: purchaseInfo.userId,
                };
                await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
                return;
            }
            throw new HttpException('No purchase style has been affected', 304);
        }
        throw new NotFoundException(`Status with id: ${dto.statusId} not found`);
    }
}
