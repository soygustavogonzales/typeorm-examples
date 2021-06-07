import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from '../../entities/purchase.entity';
import { Repository, In, Brackets } from 'typeorm';
import { SeasonCommercial } from '../../entities/seasonCommercial.entity';
import { CreatePurchaseDto } from '../dtos/createPurchase.dto';
import { StatusPurchaseDto } from '../dtos/statusPurchase.dto';
import { StatusService } from '../../status/service/status.service';
import { PurchaseStore } from '../../entities/purchaseStore.entity';
import { CreatePurchaseStyleDto } from '../dtos/createPurchaseStyle.dto';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../../entities/purchaseStyleColor.entity';
import { PurchaseDto } from '../dtos/purchase.dto';
import { AssociateStylesResponseDto } from '../dtos/associateStylesResponse.dto';
import { StylePurchaseDto } from '../dtos/stylesPurchase.dto';
import { UpdatePurchaseColorDto } from '../dtos/updatePurchaseColor.dto';
import { ShippingDates } from '../../entities/shippingDates.entity';
import { ColorShippingUnits } from '../dtos/colorShippingUnits.dto';
import { PurchaseStyleColorShipping } from '../../entities/purchaseStyleColorShipping.entity';
import { StyleProxyService } from '../../external-services/style-proxy/style-proxy.service';
import { SaveStyleDetailDto } from '../dtos/saveStyleDetails.dto';
import { DetailsType } from '../dtos/detailsType.enum';
import { StyleDetailDto } from '../dtos/styleDetails.dto';
import { PurchaseStyleService } from '../../purchase-style/services/purchase-style.service';
import { ImportFactorService } from '../../maintainer/import-factor/service/import-factor.service';
import { DollarService } from '../../maintainer/dollar/service/dollar.service';
import { StoreSummaryDto } from '../dtos/storeSummary.dto';
import { BrandSummaryDto } from '../dtos/brandSummary.dto';
import { DepartamentSummaryDto } from '../dtos/dptoSummary.dto';
import { SubDepartmentSumaryDto } from '../dtos/subDepartmentSumary.dto';
import { StylePurchaseSummaryDto } from '../dtos/stylesPurchaseSummary.dto';
import { Status } from '../../shared/enums/status.enum';
import { FilterApprovalDto } from '../dtos/filterApproval.dto';
import { Store } from '../../entities/store.entity';
import { NotificationPublisherService } from '../../external-services/events/notification-publisher.service';
import { FilterNegotiationDto } from '../dtos/filterNegotiation.dto';
import { PurchaseListDto } from '../dtos/purchaseList.dto';
import { StatusPurchaseColor } from '../../entities/statusPurchaseColor.entity';
import { StatusPurchaseColorEnum } from '../../shared/enums/statusPurchaseColor.enum';
import { NotificationTypeEnum } from '../../shared/enums/notificationType.enum';
import { UserDecode } from '../../shared/dtos/userDecode.entity';
import { FilterStyleModDto } from '../../purchase-style/dtos/filterStyleMod.dto';
import { SecurityProxyService } from '../../external-services/security-proxy/security-proxy.service';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';
import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';
import { StyleDto } from '../dtos/style.dto';
import { PurchaseNegotiationConfirm } from '../dtos/purchaseNegotiationConfirm.dto';
import { SaveQuotationSelectionDataDto } from '../dtos/saveQuotationSelectionData.dto';
import { saveQuotationStatusResponse } from '../../purchase-style/dtos/saveQuotationStatusResponse.enum.dto';
import { revertPurchaseStatusResponse } from '../../purchase-style/dtos/revertPurchaseStatusResponse.enum.dto';
import { RoleType } from '../../shared/enums/role.enum';
import { ShippingDatesChild } from '../../entities/shippingDatesChild.entity';
import { generateArrivalDatesDto } from '../dtos/generateArrivalDates.dto';
import { ExportPurchaseStep3Dto } from '../dtos/exportPurchaseStep3.dto';
import { OriginService } from '../../origin/service/origin.service';
import { SizeService } from '../../size/service/size.service';
import { ShipmethodService } from '../../shipmethod/service/shipmethod.service';
import { PackagingService } from '../../packaging/service/packaging.service';
import { SeasonStickerService } from '../../season-sticker/service/season-sticker.service';
import { RseService } from '../../rse/service/rse.service';
import { CsoService } from '../../cso/service/cso.service';
import { CategoryService } from '../../category/service/category.service';
import { ProviderService } from '../../provider/service/provider.service';
import { ExitportsService } from '../../exitports/service/exitports.service';
import { ConfigService } from 'nestjs-config';
import moment = require('moment');
const xl = require('excel4node');
import { Excel, IWorkSheet } from '../../shared/class/Excel';
import { FindProviderDto } from '../../provider/dtos/findProvider.dto';
import { FindExitPortsDto } from '../../exitports/dtos/findExitPorts.dto';
import { ProviderOrderBy } from '../../provider/dtos/providerOrderBy.enum';
import { ExitPortsOrderBy } from '../../exitports/dtos/exitPortsOrderBy.enum.dto';
import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
import { AwsS3 } from '../../shared/class/AwsS3';
import { SegmentService } from '../../segment/service/segment.service';
import { NotificationEmailDto } from '../../external-services/security-proxy/dtos/NotificationEmailDto';
import { TemplateTypeEnum } from '../../shared/enums/TemplateType.enum';
import { ColorShippingDto } from '../dtos/colorShipping.dto';

@Injectable()
export class PurchaseService {
    // Create a logger instance
    private logger = new Logger('PurchaseService');
    private AWS_S3_BUCKET_NAME: string;
    private s3: AWS.S3;

    constructor(
        private statusService: StatusService,
        @InjectRepository(ShippingDatesChild)
        private readonly shippingDatesChildRepository: Repository<ShippingDatesChild>,
        @InjectRepository(ShippingDates)
        private readonly shippingDatesRepository: Repository<ShippingDates>,
        @InjectRepository(PurchaseStyle)
        private readonly purchaseStyleRepository: Repository<PurchaseStyle>,
        @InjectRepository(PurchaseStyleDetails)
        private readonly purchaseStyleDetailsRepository: Repository<PurchaseStyleDetails>,
        @InjectRepository(PurchaseStyleColor)
        private readonly purchaseStyleColorRepository: Repository<PurchaseStyleColor>,
        @InjectRepository(PurchaseStyleColorShipping)
        private readonly purchaseStyleColorShippingRepository: Repository<PurchaseStyleColorShipping>,
        @InjectRepository(PurchaseStore)
        private readonly purchaseStoreRepository: Repository<PurchaseStore>,
        @InjectRepository(PurchaseStyleNegotiation)
        private readonly purchaseStyleNegotiationRepository: Repository<PurchaseStyleNegotiation>,
        @InjectRepository(Purchase)
        private readonly purchaseRepository: Repository<Purchase>,
        private externalStyleService: StyleProxyService,
        private purchaseStyleService: PurchaseStyleService,
        private importFactorService: ImportFactorService,
        private dollarService: DollarService,
        private notificationPublisherService: NotificationPublisherService,
        private securityProxyService: SecurityProxyService,
        private originService: OriginService,
        private sizeService: SizeService,
        private shipmethodService: ShipmethodService,
        private packagingService: PackagingService,
        private seasonStickerService: SeasonStickerService,
        private rseService: RseService,
        private csoService: CsoService,
        private categoryService: CategoryService,
        private providerService: ProviderService,
        private exitportsService: ExitportsService,
        private segmentService: SegmentService,
        private config: ConfigService,
    ) {
        this.AWS_S3_BUCKET_NAME = this.config.get('aws').aws_s3_bucket_name;
        AWS.config.update({
            accessKeyId: this.config.get('aws').aws_access_key_id,
            secretAccessKey: this.config.get('aws').aws_secret_access_key,
        });
        this.s3 = new AWS.S3();
    }

    async create(dto: CreatePurchaseDto): Promise<PurchaseDto> {
        try {
            const { id, brandIds, departmentIds, tripDate, seasonCommercialId, name, userId, statusId, storesId, seasonProductsIds } = dto;
            const brands = brandIds.split(',').map(b => parseInt(b, null));
            const departments = departmentIds.split(',').map(b => parseInt(b, null));
            const seasonProducts = seasonProductsIds.split(',').map(s => parseInt(s, null));
            const status = await this.statusService.get(statusId);
            const storesIdsParse = _.uniq(storesId?.split(',').map(s => parseInt(s, null)));
            // const stores = await this.storeService.getAllByIds(storesIdsParse);

            if (id && id !== -1) {
                // tslint:disable-next-line: no-shadowed-variable
                let purchaseEntity = await this.purchaseRepository.findOne(id, { relations: ['stores', 'stores.store'] });
                if (purchaseEntity) {
                    const missingRemove = purchaseEntity.stores.map(s => s.store.id).filter(item => storesIdsParse.indexOf(item) < 0);
                    const missingAdd = storesIdsParse.filter(item => purchaseEntity.stores.map(s => s.store.id).indexOf(item) < 0);

                    purchaseEntity.name = name;
                    purchaseEntity.userId = userId;
                    purchaseEntity.tripDate = new Date(moment.utc(tripDate).format('MMM-yyyy'));
                    purchaseEntity.brands = brands;
                    purchaseEntity.departments = departments;
                    purchaseEntity.seasonCommercial = new SeasonCommercial();
                    purchaseEntity.seasonCommercial.id = seasonCommercialId;
                    purchaseEntity.status = status;
                    purchaseEntity.seasonProducts = seasonProducts;
                    await this.purchaseRepository.save(purchaseEntity);

                    if (missingAdd.length > 0) {
                        const purchaseAddStores = missingAdd.map(sId => {
                            const sp = new PurchaseStore();
                            sp.store = new Store();
                            sp.store.id = sId;
                            // stores.find(st => st.id === sId);
                            sp.purchase = new Purchase();
                            sp.purchase.id = purchaseEntity.id;
                            return sp;
                        });
                        await this.purchaseStoreRepository.save(purchaseAddStores);
                        purchaseEntity.stores.push(...purchaseAddStores);
                    }
                    if (missingRemove.length > 0) {
                        const purchaseRemoveStores = purchaseEntity.stores.filter(s => missingRemove.indexOf(s.store.id) !== -1);
                        await this.purchaseStoreRepository.remove(purchaseRemoveStores);
                    }
                    if (status.id > Status.CompletePurchase) {
                        purchaseEntity = await this.purchaseRepository.createQueryBuilder('purchase')
                            .leftJoinAndSelect('purchase.stores', 'stores')
                            .leftJoinAndSelect('stores.store', 'store')
                            .leftJoinAndSelect('stores.styles', 'styles')
                            .leftJoinAndSelect('styles.colors', 'colors')
                            .leftJoinAndSelect('purchase.status', 'status')
                            .where({ id })
                            .andWhere('styles.active=:active', { active: true })
                            .andWhere('stores.active=:active', { active: true })
                            .getOne();
                    }

                    // await this.purchaseRepository.findOne(id, { relations: ['stores', 'stores.store', 'stores.styles', 'stores.styles.colors', 'status'] });
                    return new PurchaseDto(purchaseEntity);
                }
            } else {
                // const purchaseEntityFilter = await this.purchaseRepository.findOne({ where: { brands:  in (brands), departmentId, tripDate, seasonCommercial: { id: seasonCommercialId }, userId }, relations: ['seasonCommercial', 'stores', 'stores.store', 'stores.styles', 'stores.styles.colors', 'status'] });
                const parseTripDate = moment.utc(tripDate).format('MMM-yyyy');
                const parseTripDate2 = moment(tripDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
                this.logger.debug(parseTripDate, 'parseTripDate');
                this.logger.debug(parseTripDate2, 'parseTripDate2');
                this.logger.debug(moment(parseTripDate).toDate(), 'moment(parseTripDate).toDate()');
                this.logger.debug((new Date(parseTripDate)).toUTCString(), 'toUTCString');
                this.logger.debug((new Date(parseTripDate)).toISOString(), 'toISOString');
                this.logger.debug((new Date(parseTripDate)).toString(), 'toString');


                let query = this.purchaseRepository.createQueryBuilder('purchase')
                    .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                    .leftJoinAndSelect('purchase.stores', 'stores')
                    .leftJoinAndSelect('stores.store', 'store')
                    .leftJoinAndSelect('stores.styles', 'styles')
                    .leftJoinAndSelect('styles.colors', 'colors')
                    .leftJoinAndSelect('purchase.status', 'status')
                    .where(`purchase.tripDate = '${parseTripDate2}'::date`)
                    .andWhere('stores.active=true')
                    .andWhere('styles.active=:active', { active: true })
                    .andWhere(new Brackets((qb) => {
                        qb = qb.where('styles.active=true');
                        qb = qb.orWhere('styles IS NULL');
                    }))
                    .andWhere(`purchase.seasonCommercial = ${seasonCommercialId}`)
                    .andWhere(`purchase.userId = ${userId}`);
                if (brands.length > 0) {
                    brands.forEach(b => { query = query.andWhere(`${b} = ANY (purchase.brands)`); });
                }
                if (departments.length > 0) {
                    departments.forEach(d => { query = query.andWhere(`${d} = ANY (purchase.departments)`); });
                }

                const purchaseCount = await query.getCount();
                const purchase = new Purchase();

                if (purchaseCount === 0) {
                    purchase.name = name;
                    purchase.userId = userId;
                    purchase.tripDate = moment(parseTripDate).toDate(); // new Date(parseTripDate);
                    purchase.brands = brands;
                    purchase.departments = departments;
                    purchase.seasonCommercial = new SeasonCommercial();
                    purchase.seasonCommercial.id = seasonCommercialId;
                    purchase.status = status;
                    purchase.seasonProducts = seasonProducts;
                    await this.purchaseRepository.save(purchase);

                    const purchaseStores = storesIdsParse.map(storeId => {
                        const sp = new PurchaseStore();
                        sp.store = new Store();
                        sp.store.id = storeId;
                        sp.purchase = purchase;
                        return sp;
                    });
                    await this.purchaseStoreRepository.save(purchaseStores);
                    purchase.stores = purchaseStores;
                    return new PurchaseDto(purchase);
                } else {
                    throw new BadRequestException('Instancia de compra para MARCAS - TEMPORADA ya existe');
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async get(purchaseId: number): Promise<PurchaseDto> {
        let purchaseEntity = await this.purchaseRepository.findOne(purchaseId, { relations: ['seasonCommercial', 'stores', 'stores.store', 'stores.store.destinyCountry', 'stores.styles', 'stores.styles.colors', 'stores.styles.colors.shippings', 'status'] });
        if (purchaseEntity && purchaseEntity.status && purchaseEntity.status.id > Status.InitiatePurchase) {
            purchaseEntity = await this.purchaseRepository
                .createQueryBuilder('purchase')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchase.stores', 'stores')
                .leftJoinAndSelect('stores.store', 'store')
                .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
                .leftJoinAndSelect('stores.styles', 'style')
                .leftJoinAndSelect('style.colors', 'colors')
                .leftJoinAndSelect('colors.shippings', 'shippings')
                .leftJoinAndSelect('purchase.status', 'status')
                .where({ id: purchaseId })
                .andWhere('style.active=:active', { active: true })
                .getOne();
        }
        if (purchaseEntity) {
            const dataIds = purchaseEntity.stores.map(s => s.styles.map(st => st.styleId));
            const allIds = ([] as number[]).concat(...dataIds);
            const ids = Array.from(new Set(allIds));
            const stylesData = ids.length > 0 ? await this.externalStyleService.getStylesDataByIds(ids) : [];
            return new PurchaseDto(purchaseEntity, stylesData);
        } else {
            return null;
        }
    }

    async delete(purchaseIdParse: number): Promise<boolean> {
        const purchase = await this.purchaseRepository.findOne(purchaseIdParse, { relations: ['negotiations', 'stores', 'stores.styles', 'stores.styles.details', 'stores.styles.colors', 'stores.styles.colors.shippings'] });
        if (purchase) {
            const styles = _.flatten(purchase.stores.map(s => s.styles)) as PurchaseStyle[];
            const stylesColors = _.flatten(styles.map(s => s.colors)) as PurchaseStyleColor[];
            const stylesColorsShippings = _.flatten(stylesColors.map(s => s.shippings)) as PurchaseStyleColorShipping[];
            const stylesDetails = _.flatten(styles.map(s => s.details)) as PurchaseStyleDetails[];

            this.purchaseStyleColorRepository.softRemove(stylesColors);
            this.purchaseStyleColorShippingRepository.softRemove(stylesColorsShippings);
            this.purchaseStyleDetailsRepository.softRemove(stylesDetails);
            this.purchaseStyleRepository.softRemove(styles);
            this.purchaseStyleNegotiationRepository.softRemove(purchase.negotiations);
            this.purchaseStoreRepository.softRemove(purchase.stores);
            this.purchaseRepository.softRemove(purchase);
        }
        return true;
    }

    async adjustUTUnits(purchaseStyleColorsId: number[]) {
        await this.purchaseStyleService.adjustUTUnits(purchaseStyleColorsId);
    }

    // Require purchases on Complete Status
    async getSummary(purchaseId: number): Promise<StoreSummaryDto[]> {
        const purchaseEntity = await this.purchaseRepository.findOne(purchaseId, { relations: ['seasonCommercial', 'stores', 'stores.styles', 'stores.styles.purchaseStore', 'stores.styles.purchaseStore.store', 'stores.styles.purchaseStore.store.destinyCountry', 'stores.styles.details', 'stores.styles.details.origin', 'stores.styles.details.shippingMethod', 'stores.styles.colors', 'stores.styles.colors.shippings', 'status'] });
        if (purchaseEntity) {
            const stylesPurchaseActiveWithUnits = _.flatten(purchaseEntity.stores.map(s => {
                // return s.styles.filter(st => st.active && st.colors.filter(c => c.state && c.shippings.filter(sh => sh.units > 0).length > 0).length > 0 && st.details.length > 0);
                return s.styles.filter(st => st.active && st.colors.filter(c => c.state && c.shippings.filter(sh => sh.units)));
            })) as PurchaseStyle[];
            if (stylesPurchaseActiveWithUnits.length === 0) {
                this.logger.log('Estilos compra no econtrados');
                return [];
            }
            const storeSummaryDtos = await this.getSummaryByStyles(stylesPurchaseActiveWithUnits, [purchaseEntity.seasonCommercialId]);

            return storeSummaryDtos;
        } else {
            return null;
        }
    }
    async postNotifyStyleModByFilter(filter: FilterStyleModDto, user: UserDecode) {
       /**  
        console.log('filter.tableListChanges >> ',filter.tableListChanges);
        
        let columnNames = Object.keys(filter.tableListChanges);
        let resultList = new Array();
        for(let i = 0;i < columnNames.length;i++){
          resultList[columnNames[i]] = new Array();
          if(columnNames[i].length&&columnNames[i].length>0){
            for (let j = 0;j < columnNames[i].length; j++) {
              resultList[columnNames[i]][j] = filter.tableListChanges[columnNames[i]][j]
            };
          }
        };
        console.log('resultList >> ',resultList);
        */
        try {
            const purchaseCreatorsIds = await this.purchaseStyleService.getStyleModByFilter(filter);
            const notifications = [];
            for (const purchase of purchaseCreatorsIds) {
                const departmentsRelated = purchase.departmens;
                const description = `Compra modificada ${purchase.purchaseDescription} ${filter.message}`;
                const notification = {
                    description,
                    notificationType: NotificationTypeEnum.PurchaseStyleMod,
                    originUserId: user?.id,
                    creatorPurchaseUserId: purchase.userId,
                    merchantUserId: purchase.merchantsUsersId ? parseInt(purchase.merchantsUsersId, null) : -1,
                    departmentsRelated: departmentsRelated.join(','),
                    tableListChanges:filter.tableListChanges,
                };
                notifications.push(notification);
                const purchaseUser = await this.securityProxyService.getUsers({ ids: [+purchase.userId], departments: [], roles: []});
                const divisionManagers = await this.securityProxyService.getUsers({ ids: null, departments: [departmentsRelated], roles: [RoleType.DivisionManager]});
                const asistanceImporters = await this.securityProxyService.getUsers({ ids: null, departments: [departmentsRelated], roles: [RoleType.ImportAsistance]});
                const emails = [
                    ...purchaseUser.map(item => item.email),
                    ...divisionManagers.map(item => item.email),
                    ...asistanceImporters.map(item => item.email),
                ];
                const dto: NotificationEmailDto = {
                    to: emails,
                    subject: 'Se ha modificado una compra',
                    body: description,
                    template: TemplateTypeEnum.EditPurchaseEmail,
                };
                await this.securityProxyService.sendNotificationEmail(dto);
            }
            this.notifyOnDemand(notifications, user);
            return true;
        } catch (error) {
            this.logger.error('Ha ocurrido un error', error);
        }
        
    }

    async testNotification(msg: string) {
        return this.notificationPublisherService.publishMessageToTopic(JSON.stringify({ type: 'ApprovementCreate', msg }));
    }
    async notifyOnDemand(dtos: any[], user: UserDecode) {
        for (const dto of dtos) {
            if (!dto.merchantUserId) {
                dto.merchantUserId = -1;
            }
            if (dto.description && dto.notificationType && dto.creatorPurchaseUserId && dto.merchantUserId && dto.departmentsRelated) {
                const notification = {
                    description: dto.description,
                    notificationType: dto.notificationType,
                    originUserId: user?.id,
                    creatorPurchaseUserId: dto.creatorPurchaseUserId,
                    merchantUserId: dto.merchantUserId,
                    departmentsRelated: dto.departmentsRelated,
                    tableListChanges:dto.tableListChanges
                };
                await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));

            } else {
                this.logger.error(dto);
                this.logger.error('notification its not well formated');
            }
        }

    }

    // Require purchases on Complete Status
    async markAsApproveByFilter(filter: FilterApprovalDto, user: UserDecode) {
        try {
            const purchaseCreatorsIds = await this.purchaseStyleService.markAsApproveByFilter(filter);
            const purchaseIds = _.uniq(purchaseCreatorsIds.map(p => p.purchaseId));
            if (purchaseIds && purchaseIds.length > 0) {
                await this.purchaseRepository.update(purchaseIds, { status: { id: Status.Approvement }, approvalDate: new Date() });
                for (const purchase of purchaseCreatorsIds) {
                    const description = `Compra aprobada ${purchase.purchaseDescription}`;
                    const departmentsRelated = purchase.departments.join(',');
                    const notification = {
                        description: description,
                        notificationType: NotificationTypeEnum.PurchaseApprovement,
                        originUserId: user?.id,
                        creatorPurchaseUserId: purchase.userId,
                        merchantUserId: parseInt(purchase.merchantsUsersId, null),
                        departmentsRelated,
                    };
                    await this.notificationPublisherService.publishMessageToTopic(JSON.stringify(notification));
                    const purchaseUser = await this.securityProxyService.getUsers({ ids: [+purchase.userId], departments: [], roles: []});
                    const divisionManagers = await this.securityProxyService.getUsers({ ids: null, departments: [departmentsRelated], roles: [RoleType.DivisionManager]});
                    const asistanceImporters = await this.securityProxyService.getUsers({ ids: null, departments: [departmentsRelated], roles: [RoleType.ImportAsistance]});
                    const emails = [
                        ...purchaseUser.map(item => item.email),
                        ...divisionManagers.map(item => item.email),
                        ...asistanceImporters.map(item => item.email),
                    ];
                    const dto: NotificationEmailDto = {
                        to: emails,
                        subject: 'Se ha aprobado una compra',
                        body: description,
                        template: TemplateTypeEnum.PurchaseApprovedEmail,
                    };
                    await this.securityProxyService.sendNotificationEmail(dto);
                }
                return true;
            }
            return null; 
        } catch (error) {
            this.logger.error("Error al aprobar la compra", error); 
        }
        
    }

    // Require purchases on Complete Status
    async getApprovalSummary(filter: FilterApprovalDto): Promise<StoreSummaryDto[]> {
        const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStylesByFilter(filter, StatusPurchaseColorEnum.Pending, false);
        if (purchaseStyles.length === 0) {
            this.logger.log('Estilos compra no econtrados para aprobación');
            return [];
        }
        const seasonCommercialIds = _.uniq(purchaseStyles.map(p => p.purchaseStore.purchase.seasonCommercialId)) as number[];
        const response = await this.getSummaryByStyles(purchaseStyles, seasonCommercialIds, stylesData);
        return response;
    }

    async getSummaryByStyles(stylesPurchaseActiveWithUnits: PurchaseStyle[], seasonCommercialIds: number[], stylesData: any = null): Promise<StoreSummaryDto[]> {
        if (!stylesData) {
            const uniqStyles = _.uniqBy(stylesPurchaseActiveWithUnits, 'styleId');
            stylesData = await this.externalStyleService.getStylesDataByIds(uniqStyles.map(s => s.styleId));
            if (uniqStyles.length > 0 && stylesData.length === 0) {
                this.logger.error('Datos de estilos no encontrados');
                return null;
            }
        }
        const stylePurchaseDtos = stylesPurchaseActiveWithUnits.map(st => new StylePurchaseSummaryDto(st, stylesData));
        const getImportFactorDtos = stylePurchaseDtos.filter(s => s.details && s.details.origin && s.details.shippingMethod).map(stylePurchase => {
            const getImportFactorDto = { destinyId: stylePurchase.destinyCountryId, originId: stylePurchase.details.origin.id, departmentId: stylePurchase.departmentId, shipmethodId: stylePurchase.details.shippingMethod.id };
            return getImportFactorDto;
        });
        const uniqImportFactorsDto = _.uniqWith(getImportFactorDtos, _.isEqual);
        const importFactors = await this.importFactorService.getByDestinyAndOriginAndDepartment(uniqImportFactorsDto);
        const dollarChanges = await this.dollarService.getBySeason(seasonCommercialIds);
        if (!dollarChanges || dollarChanges.length === 0) {
            this.logger.error(`Cambio de dollar no econtrado para las temporadas ${seasonCommercialIds.join(',')}`);
            return null;
        }
        let costsResumes = [];
        if (importFactors.length === uniqImportFactorsDto.length) {
            costsResumes = stylePurchaseDtos.filter(p => p.details && p.details.origin !== null && p.details.shippingMethod !== null).map(p => {
                // COSTO*: FOB*DOLAR MANTENEDOR*FACTOR IMPORTACIÓN MANTENEDOR
                const importFactor = importFactors.find(f => f.departmentId === p.departmentId && f.destinyCountry.id === p.destinyCountryId && f.originCountry.id === p.details.origin?.id && f.shipmethod.id === p.details.shippingMethod?.id);
                const dollarChange = dollarChanges.find(d => d.destinyCountry.id === p.destinyCountryId);
                const unitCost = importFactor && dollarChange ? p.details.fob * dollarChange.value * importFactor.factor : 0;
                return { stylePurchaseId: p.id, unitCost, totalUnits: p.totalUnits };
            });
        } else {
            this.logger.error('Factores de importación no encontrados para', JSON.stringify(uniqImportFactorsDto));
            // return null;
        }
        const storeSummaryDtos: StoreSummaryDto[] = [];

        const stylesByStores = _.groupBy(stylePurchaseDtos, 'store');
        for (const store of Object.keys(stylesByStores)) {
            const stylePurchaseDtoByStore = stylesByStores[store];
            const storePriorityReference = stylePurchaseDtoByStore[0].storePriority;
            const storeIdReference = stylePurchaseDtoByStore[0].storeId;
            const storeSummary = new StoreSummaryDto(storeIdReference, store, storePriorityReference);
            const iva = stylePurchaseDtoByStore[0].destinyCountryIVA;


            const brands = _.groupBy(stylesByStores[store], 'brand');
            for (const brand of Object.keys(brands)) {
                const brandSummary = new BrandSummaryDto(brand);
                const departments = _.groupBy(brands[brand], 'department');
                for (const department of Object.keys(departments)) {
                    const departmentSummary = new DepartamentSummaryDto(department);
                    const subdepartments = _.groupBy(departments[department], 'subDepartment');
                    for (const subdepartment of Object.keys(subdepartments)) {
                        const subDepartmentSumaryDto = new SubDepartmentSumaryDto(subdepartment);
                        const stylePurchaseDtoBySubdpto = subdepartments[subdepartment] as StylePurchaseSummaryDto[];
                        const subDepartmentsCosts = costsResumes.filter(c => stylePurchaseDtoBySubdpto.map(s => s.id).indexOf(c.stylePurchaseId) !== -1);
                        subDepartmentSumaryDto.stylesPurchaseCount = stylePurchaseDtoBySubdpto.length;
                        subDepartmentSumaryDto.unitsTotalCount = stylePurchaseDtoBySubdpto.map(s => s.totalUnits).reduce((a, b) => a + b);
                        const prices = stylePurchaseDtoBySubdpto.filter(s => s.details && s.details.price).map(s => s.details.price * s.totalUnits);
                        subDepartmentSumaryDto.totalRetail = prices.length > 0 ? prices.reduce((a, b) => a + b) : 0;
                        const satos = stylePurchaseDtoBySubdpto.filter(s => s.details && s.details.sato).map(s => s.details.sato * s.totalUnits);
                        subDepartmentSumaryDto.totalPromotion = satos.length > 0 ? satos.reduce((a, b) => a + b) : 0;
                        // (SUMATORIA(Unidades*Costo*, por cada estilo))
                        subDepartmentSumaryDto.totalCost = subDepartmentsCosts.length > 0 ? subDepartmentsCosts.map(c => c.unitCost * c.totalUnits).reduce((a, b) => a + b).toFixed(2) : '0';
                        // (Promedio Precio Sato) - PVP Promedio
                        const satosPvp = stylePurchaseDtoBySubdpto.filter(s => s.details && s.details.sato).map(p => parseFloat(p.details.sato.toString()));
                        subDepartmentSumaryDto.pvpPrice = satosPvp.length > 0 ? satosPvp.reduce((a, b) => a + b) / stylePurchaseDtoBySubdpto.length : 0;

                        // (Promedio Costo*) - Costo Promedio
                        subDepartmentSumaryDto.averageCost = subDepartmentsCosts.length > 0 ? (subDepartmentsCosts.map(c => c.unitCost).reduce((a, b) => a + b) / stylePurchaseDtoBySubdpto.length).toFixed(2) : '0';
                        // subDepartmentSumaryDto.averageCost = (parseFloat(subDepartmentSumaryDto.totalCost) / stylePurchaseDtoBySubdpto.length).toFixed(2);

                        // (Promedio FOB) - FOB Promedio
                        const fobs = stylePurchaseDtoBySubdpto.filter(s => s.details && s.details.fob).map(p => parseFloat(p.details.fob.toString()));
                        subDepartmentSumaryDto.averageFob = fobs.length > 0 ? (fobs.reduce((a, b) => a + b) / stylePurchaseDtoBySubdpto.length).toFixed(2) : '0';

                        // IMU (((PRECIO NORMAL / (1 + IMPUESTO PAIS ) - COSTO*)/ (PRECIO NORMAL (/ (1 + IMPUESTO PAIS ) ),
                        subDepartmentSumaryDto.imu = ((((subDepartmentSumaryDto.totalRetail / (1 + iva)) - parseFloat(subDepartmentSumaryDto.totalCost)) / (subDepartmentSumaryDto.totalRetail / (1 + iva))) * 100).toFixed(2);
                        subDepartmentSumaryDto.imuSato = ((((subDepartmentSumaryDto.totalPromotion / (1 + iva)) - parseFloat(subDepartmentSumaryDto.totalCost)) / (subDepartmentSumaryDto.totalPromotion / (1 + iva))) * 100).toFixed(2);

                        // (se apertura de E1 A E6 con unidades de cada entrega
                        subDepartmentSumaryDto.unitsByShipping = {};

                        // (se apertura de E1 A E6 con unidades de cada entrega,
                        subDepartmentSumaryDto.costByShipping = {};

                        // (se apertura de E1 A E6 con unidades de cada entrega,
                        subDepartmentSumaryDto.stylesList = [];

                        for (const purchaseStyle of stylePurchaseDtoBySubdpto) {
                            subDepartmentSumaryDto.stylesList.push({
                                clase: purchaseStyle.classType,
                                code: purchaseStyle.code,
                                totalUnits: purchaseStyle.totalUnits,
                                destinyCountryIVA: purchaseStyle.destinyCountryIVA,
                                colors: purchaseStyle.colors,
                                fob: purchaseStyle.details?.fob || 0,
                                price: purchaseStyle.details?.price || 0,
                                sato: purchaseStyle.details?.sato || 0,
                                dollarChange: dollarChanges.find(f => f.destinyCountry.id === purchaseStyle.destinyCountryId)?.value || 0,
                                importFactor: importFactors.find(f => f.departmentId === purchaseStyle.departmentId && f.destinyCountry.id === purchaseStyle.destinyCountryId && f.originCountry.id === purchaseStyle.details.origin?.id && f.shipmethod.id === purchaseStyle.details.shippingMethod?.id)?.factor || 1,
                            });
                            const shippings = _.flatten(purchaseStyle.colors.map(c => c.shippings)) as ColorShippingUnits[];
                            shippings.filter(sh => sh.units > 0).forEach(shipping => {
                                if (subDepartmentSumaryDto.unitsByShipping[shipping.shippingName]) {
                                    subDepartmentSumaryDto.unitsByShipping[shipping.shippingName] += shipping.units;
                                } else {
                                    subDepartmentSumaryDto.unitsByShipping[shipping.shippingName] = shipping.units;
                                }
                                const costByShipping = subDepartmentsCosts.find(c => c.stylePurchaseId === purchaseStyle.id)?.unitCost * shipping.units || 0;
                                if (subDepartmentSumaryDto.costByShipping[shipping.shippingName]) {
                                    subDepartmentSumaryDto.costByShipping[shipping.shippingName] += parseFloat(costByShipping.toFixed(2));
                                } else {
                                    subDepartmentSumaryDto.costByShipping[shipping.shippingName] = parseFloat(costByShipping.toFixed(2));
                                }
                            });
                        }
                        departmentSummary.subDepartmentsSummary.push(subDepartmentSumaryDto);
                    }
                    brandSummary.departmentsSummary.push(departmentSummary);
                }
                storeSummary.brandsSummary.push(brandSummary);
            }

            // TOTALS
            const storeCosts = costsResumes.filter(c => stylePurchaseDtoByStore.map(s => s.id).indexOf(c.stylePurchaseId) !== -1);

            storeSummary.stylesPurchaseCount = stylePurchaseDtoByStore.length;
            storeSummary.unitsTotalCount = stylePurchaseDtoByStore.map(s => s.totalUnits).reduce((a, b) => a + b);
            const pricesTotal = stylePurchaseDtoByStore.filter(s => s.details && s.details.price).map(s => s.details.price * s.totalUnits);
            storeSummary.totalRetail = pricesTotal.length > 0 ? pricesTotal.reduce((a, b) => a + b) : 0;
            const satosTotal = stylePurchaseDtoByStore.filter(s => s.details && s.details.sato).map(s => s.details.sato * s.totalUnits);
            storeSummary.totalPromotion = satosTotal.length > 0 ? satosTotal.reduce((a, b) => a + b) : 0;
            // (SUMATORIA(Unidades*Costo*, por cada estilo))
            storeSummary.totalCost = storeCosts.length > 0 ? storeCosts.map(c => c.unitCost * c.totalUnits).reduce((a, b) => a + b).toFixed(2) : '0';
            // (Promedio Precio Sato) - PVP Promedio
            const satosPvpTotal = stylePurchaseDtoByStore.filter(s => s.details && s.details.sato).map(p => parseFloat(p.details.sato.toString()));
            storeSummary.pvpPrice = satosPvpTotal.length > 0 ? satosPvpTotal.reduce((a, b) => a + b) / stylePurchaseDtoByStore.length : 0;

            // (Promedio Costo*) - Costo Promedio
            storeSummary.averageCost = storeCosts.length > 0 ? (storeCosts.map(c => c.unitCost).reduce((a, b) => a + b) / stylePurchaseDtoByStore.length).toFixed(2) : '0';
            // storeSummary.averageCost = (parseFloat(storeSummary.totalCost) / stylePurchaseDtoByStore.length).toFixed(2);

            // (Promedio FOB) - FOB Promedio
            const fobsTotal = stylePurchaseDtoByStore.filter(s => s.details && s.details.fob).map(p => parseFloat(p.details.fob.toString()));
            storeSummary.averageFob = fobsTotal.length > 0 ? (fobsTotal.reduce((a, b) => a + b) / stylePurchaseDtoByStore.length).toFixed(2) : '0';

            // IMU (((PRECIO NORMAL / (1 + IMPUESTO PAIS ) - COSTO*)/ (PRECIO NORMAL (/ (1 + IMPUESTO PAIS ) ),
            storeSummary.imu = storeSummary.totalRetail !== 0 ? ((((storeSummary.totalRetail / (1 + iva)) - parseFloat(storeSummary.totalCost)) / (storeSummary.totalRetail / (1 + iva))) * 100).toFixed(2) : '0';
            storeSummary.imuSato = ((((storeSummary.totalPromotion / (1 + iva)) - parseFloat(storeSummary.totalCost)) / (storeSummary.totalPromotion / (1 + iva))) * 100).toFixed(2);

            // (se apertura de E1 A E6 con unidades de cada entrega
            storeSummary.unitsByShipping = {};

            // (se apertura de E1 A E6 con unidades de cada entrega,
            storeSummary.costByShipping = {};

            for (const purchaseStyle of stylePurchaseDtoByStore) {
                const shippings = _.flatten(purchaseStyle.colors.map(c => c.shippings)) as ColorShippingUnits[];
                shippings.filter(sh => sh.units > 0).forEach(shipping => {
                    if (storeSummary.unitsByShipping[shipping.shippingName]) {
                        storeSummary.unitsByShipping[shipping.shippingName] += shipping.units;
                    } else {
                        storeSummary.unitsByShipping[shipping.shippingName] = shipping.units;
                    }
                    const costByShipping = storeCosts.find(c => c.stylePurchaseId === purchaseStyle.id)?.unitCost * shipping.units || 0;
                    if (storeSummary.costByShipping[shipping.shippingName]) {
                        storeSummary.costByShipping[shipping.shippingName] += parseFloat(costByShipping.toFixed(2));
                    } else {
                        storeSummary.costByShipping[shipping.shippingName] = parseFloat(costByShipping.toFixed(2));
                    }
                });
            }

            storeSummaryDtos.push(storeSummary);
        }
        return storeSummaryDtos;
    }

    async getTripDates() {
        const purchaseEntityTripdates = await this.purchaseRepository.find({ select: ['tripDate'] });
        return _.uniq(purchaseEntityTripdates.map(p => moment(p.tripDate).format('MMM-yyyy')));
    }

    async getAll(): Promise<{ userName: string }[]> {
        const purchases = await this.purchaseRepository.createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('stores.store', 'store')
            .leftJoinAndSelect('purchase.status', 'status')
            .getMany();
        const usersId = _.uniq(purchases.map(p => p.userId));
        const users = await this.securityProxyService.getUsers({ ids: usersId, departments: [], roles: [] });
        return purchases.map(p => {
            const user = users.find(u => u.id === p.userId);
            return {
                userName: user ? `${user.firstName} ${user.lastName}` : 'No User',
                ...p,
            };
        });
    }

    async _getAll(): Promise<any> {
        const purchases = await this.purchaseRepository.createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('stores.store', 'store')
            .leftJoinAndSelect('purchase.status', 'status')
            .getMany();
        const usersId = _.uniq(purchases.map(p => p.userId));
        const users = await this.securityProxyService.getUsers({ ids: usersId, departments: [], roles: [] });
        return purchases.map(p => {
            const user = users.find(u => u.id === p.userId);
            return {
                ...p,
            };
        });
    }

    async updateStatus(statusPurchaseDto: StatusPurchaseDto) {
        const status = await this.statusService.get(statusPurchaseDto.statusId);
        if (status) {
            let toUpdateObj = status.id === Status.Approvement ? { status, approvalDate: new Date() } : { status };
            if (toUpdateObj.status.id === Status.Cotizations) {
                const purchaseStyles = await this.purchaseStyleRepository
                    .createQueryBuilder('purchaseStyle')
                    .leftJoinAndSelect('purchaseStyle.purchaseStore', 'purchaseStore')
                    .leftJoinAndSelect('purchaseStore.purchase', 'purchase')
                    .leftJoinAndSelect('purchaseStyle.status', 'styleStatus')
                    .where({ active: true })
                    .andWhere('purchaseStyle.deleteDate IS NULL')
                    .andWhere(`purchase.id = ${statusPurchaseDto.id}`)
                    .getMany();
                if (purchaseStyles.length > 0 && purchaseStyles.every(p => p.status.id === StatusPurchaseColorEnum.Negotiated)) {
                    toUpdateObj = {status: await this.statusService.get(Status.InNegotiation)};
                }
            }
            const responseUpdate = await this.purchaseRepository.update({ id: statusPurchaseDto.id }, toUpdateObj);
            if (responseUpdate.affected === 1) {
                return { id: statusPurchaseDto.statusId };
            }
        }
        return null;
    }

    async associateStyles(stylesDtos: CreatePurchaseStyleDto[], purchaseId: number): Promise<AssociateStylesResponseDto[]> {

        // Find uniques PurchaseStores
        const uniquePurchaseStores = [... new Set(stylesDtos.map(data => data.purchaseStoreId))];
        const uniqueStylesId = [... new Set(stylesDtos.map(data => data.styleId))];
        const purchaseStoresDb = await this.purchaseStoreRepository.find({ where: { purchase: { id: purchaseId }, active: true }, relations: ['styles', 'store', 'store.destinyCountry'] });
        const purchaseStoresIdActive = purchaseStoresDb.map(p => p.id);
        const removePurchasesStoresId = purchaseStoresIdActive.filter(p => uniquePurchaseStores.indexOf(p) === -1);
        if (removePurchasesStoresId.length > 0) {
            await this.purchaseStoreRepository.update(removePurchasesStoresId, { active: false });
        }
        const purchaseStores = purchaseStoresDb.filter(p => uniquePurchaseStores.indexOf(p.id) !== -1);
        const stylesDb = _.flatten(purchaseStores.map(p => p.styles));
        const removeStylesDb = stylesDb.filter(s => uniqueStylesId.indexOf(s.styleId) === -1 && s.active);
        if (removeStylesDb.length > 0) {
            await this.purchaseStyleRepository.update(removeStylesDb.map(s => s.id), { active: false });
        }
        const addStylesDb = stylesDb.filter(s => uniqueStylesId.indexOf(s.styleId) !== -1 && !s.active);
        if (addStylesDb.length > 0) {
            await this.purchaseStyleRepository.update(addStylesDb, { active: true });
        }


        // const purchaseStores = await this.purchaseStoreRepository.findByIds(uniquePurchaseStores, { relations: ['store', 'store.destinyCountry'] });
        const response: AssociateStylesResponseDto[] = [];

        // Foreach style
        for (const styleDto of stylesDtos) {
            const { purchaseStyleId, purchaseStoreId, styleColorsId, styleId } = styleDto;

            if (purchaseStoreId && styleId && styleColorsId && styleColorsId.split(',').length > 0) {
                const purchaseStore = purchaseStores.find(ps => ps.id === purchaseStoreId);
                const purchaseStyleDb = await this.purchaseStyleRepository.findOne({ where: { styleId, purchaseStore: { id: purchaseStoreId } }, relations: ['colors'] });
                if (purchaseStyleDb) {
                    await this.updatePurchaseStyle(purchaseStyleDb, styleDto);
                    if (response.filter(r => r.store.id === purchaseStore.store.id).length > 0) {
                        response.filter(r => r.store.id === purchaseStore.store.id)[0].styles.push(new StylePurchaseDto(purchaseStyleDb));
                    } else {
                        response.push(new AssociateStylesResponseDto(purchaseStore, purchaseStyleDb));
                    }
                } else {
                    // Create purchase Style
                    const purchaseStyle = new PurchaseStyle();
                    purchaseStyle.purchaseStore = purchaseStore;
                    purchaseStyle.styleId = styleId;
                    purchaseStyle.status = new StatusPurchaseColor();
                    purchaseStyle.status.id = StatusPurchaseColorEnum.Pending;
                    await this.purchaseStyleRepository.save(purchaseStyle);

                    // Create purchase Styles Colors
                    const colors = styleColorsId?.split(',').map(c => {
                        const color = new PurchaseStyleColor();
                        color.styleColorId = parseInt(c, null);
                        color.purchaseStyle = purchaseStyle;
                        color.state = true;
                        color.status = new StatusPurchaseColor();
                        color.status.id = StatusPurchaseColorEnum.Pending;
                        return color;
                    });
                    await this.purchaseStyleColorRepository.save(colors);
                    purchaseStyle.colors = colors;
                    if (response.filter(r => r.store.id === purchaseStore.store.id).length > 0) {
                        response.filter(r => r.store.id === purchaseStore.store.id)[0].styles.push(new StylePurchaseDto(purchaseStyle));
                    } else {
                        response.push(new AssociateStylesResponseDto(purchaseStore, purchaseStyle));
                    }

                }
            }

        }
        return response;
    }
    async updatePurchaseStyle(purchaseStyleDb: PurchaseStyle, styleDto: CreatePurchaseStyleDto) {
        const { styleColorsId } = styleDto;
        const colorsId = styleColorsId?.split(',').map(c => {
            return parseInt(c, null);
        });
        const colorsDb = purchaseStyleDb.colors.map(c => c.styleColorId);

        const missingRemove = colorsDb.filter(item => colorsId.indexOf(item) < 0);
        const missingAdd = colorsId.filter(item => colorsDb.indexOf(item) < 0);

        if (missingAdd.length > 0) {
            // Create purchase Styles Colors
            const addColors = missingAdd.map(c => {
                const color = new PurchaseStyleColor();
                color.styleColorId = c;
                color.purchaseStyle = purchaseStyleDb;
                color.state = true;
                color.status = new StatusPurchaseColor();
                color.status.id = StatusPurchaseColorEnum.Pending;
                return color;
            });
            await this.purchaseStyleColorRepository.save(addColors);
        }
        if (missingRemove.length > 0) {
            const removeColors = purchaseStyleDb.colors.filter(c => missingRemove.indexOf(c.styleColorId) !== -1);
            await this.purchaseStyleColorRepository.remove(removeColors);
        }

    }

    async updateColorsStore(stylesColorDtos: UpdatePurchaseColorDto[], purchaseId: number): Promise<PurchaseDto> {
        const countPack = 100;
        let i = 0;
        do {
            const pack = stylesColorDtos.slice(i, countPack + i);
            await this.purchaseStyleColorRepository.save(pack);
            i += countPack;
            if (countPack + i > stylesColorDtos.length) {
                const packEnd = stylesColorDtos.slice(i, countPack + i);
                await this.purchaseStyleColorRepository.save(packEnd);
            }
        }
        while (stylesColorDtos.length > countPack + i);
        return this.get(purchaseId);
    }

    async getShippingsUnits(purchaseColorsStyleIds: number[], divisionId: number, seasonCommercialId: number) {
        const shippingDates = await this.shippingDatesRepository.find({ where: { divisionId, seasonCommercialId }, order: { date: 'ASC' } });
        const purchaseColorsStyles = await this.purchaseStyleColorRepository.findByIds(purchaseColorsStyleIds, { relations: ['shippings'] });
        const responseShippings: ColorShippingUnits[] = [];
        for (const color of purchaseColorsStyles) {
            if (color.shippings && color.shippings.length > 0) {
                const shippings = color.shippings.sort((a, b) => a.date < b.date ? 0 : 1).map(s => {
                    return new ColorShippingUnits(s, color.id, color.state, s.id);
                });
                responseShippings.push(...shippings);
            } else {
                const newShippings = shippingDates.sort((a, b) => a.date < b.date ? 0 : 1).map(s => {
                    return new ColorShippingUnits(s, color.id, color.state);
                });
                responseShippings.push(...newShippings);
            }
        }
        return responseShippings;
    }

    async saveShippingUnits(colorShippingsDto: ColorShippingDto[]) {
        try {
            const saveEntities: PurchaseStyleColorShipping[] = [];
            const deleteEntities: PurchaseStyleColorShipping[] = [];
            const purchaseStyleColorIds = colorShippingsDto.map(cs => cs.purchaseStyleColorId);
            const purchaseStyleColors = await this.purchaseStyleColorRepository.createQueryBuilder('PSC')
                .leftJoinAndSelect('PSC.shippings', 'PSCS')
                .where('PSC.id IN (:...purchaseStyleColorIds)', { purchaseStyleColorIds })
                .getMany();

            for (const dto of colorShippingsDto) {
                const styleColor = purchaseStyleColors.find(psc => psc.id === dto.purchaseStyleColorId);
                const shippings = styleColor.shippings;
                _.range(1, 7).forEach(i => {
                    const actualShippings = shippings.filter(s => s.shipping === `E${i}`);
                    if (actualShippings.length > 1) {
                        const shippingsDelete = actualShippings.slice(1);
                        deleteEntities.push(...shippingsDelete);
                    }
                    const actualShipping = actualShippings[0];
                    if (actualShipping) {
                        actualShipping.units = dto[`unitsE${i}`] !== actualShipping.units ? dto[`unitsE${i}`] : actualShipping.units;
                        actualShipping.date = moment(dto[`dateE${i}`]).format('yyyy-MM-dd') === moment(new Date(null)).format('yyyy-MM-dd') ? actualShipping.date : dto[`dateE${i}`];
                        actualShipping.date = dto[`dateE${i}`] !== actualShipping.date ? dto[`dateE${i}`] : actualShipping.date;
                        saveEntities.push(actualShipping);
                    } else {
                        const color = new PurchaseStyleColor();
                        color.id = dto.purchaseStyleColorId;
                        const newShipping = new PurchaseStyleColorShipping();
                        newShipping.shipping = `E${i}`;
                        newShipping.units = dto[`unitsE${i}`] ? dto[`unitsE${i}`] : 0;
                        newShipping.date = dto[`dateE${i}`] ? dto[`dateE${i}`] : new Date(null);
                        newShipping.purchaseStyleColor = color;
                        saveEntities.push(newShipping);
                    }
                });
            }
            if (deleteEntities.length > 0) {
                this.logger.debug('Deleting extra shipping entities: ' + deleteEntities.length, 'saveShippingUnits');
                var start = new Date().getTime();
                const idsDelete = deleteEntities.map(sh => sh.id);
                const response = await this.purchaseStyleColorShippingRepository.delete(idsDelete);
                var end = new Date().getTime();
                var time = end - start;
                this.logger.debug('Delete extra shippings time: ' + time, 'saveShippingUnits');
            }
            if (saveEntities.length > 0) {
                this.logger.debug('Saving shippings entities : ' + saveEntities.length, 'saveShippingUnits');
                var start = new Date().getTime();
                const response = await this.purchaseStyleColorShippingRepository.save(saveEntities, { chunk: 250 });
                var end = new Date().getTime();
                var time = end - start;
                this.logger.debug('Save in BD time: ' + time, 'saveShippingUnits');
                return response;
            }
            return [];
        } catch (error) {
            console.log(error);
            return [];
        }
        
    }

    //TODO: Eliminar este servicio (logica antigua de guardado por columna)
    async updateShippingsUnits(shippings: ColorShippingUnits[]) {
        // const purchaseColorsId = [];
        const purchaseStyleColors = _.groupBy(shippings, 'purchaseColorStoreId');
        const purchaseStyleColorShippingsEmpty = [];
        const purchaseStyleColorShippingsUpdate = [];
        for (const purchaseStyleColorId of Object.keys(purchaseStyleColors)) {
            const shippingByStyleColor = purchaseStyleColors[purchaseStyleColorId];
            if (shippingByStyleColor.length < 6) {
                const shippingDb = await this.purchaseStyleColorShippingRepository.find({ where: { purchaseStyleColor: { id: purchaseStyleColorId } }, relations: ['purchaseStyleColor'] });
                if (shippingDb.length < 6) {
                    _.range(1, 7).forEach(i => {
                        if (shippingByStyleColor.map(s => s.shippingName).indexOf(`E${i}`) === -1 && shippingDb.map(s => s.shipping).indexOf(`E${i}`) === -1) {
                            const color = new PurchaseStyleColor();
                            color.id = parseInt(purchaseStyleColorId, null);
                            // purchaseColorsId.push(color.id);
                            const shippingsEntityEmpty = new PurchaseStyleColorShipping();
                            shippingsEntityEmpty.units = 0;
                            shippingsEntityEmpty.date = new Date(null);
                            shippingsEntityEmpty.shipping = `E${i}`;
                            shippingsEntityEmpty.purchaseStyleColor = color;
                            purchaseStyleColorShippingsEmpty.push(shippingsEntityEmpty);
                        }
                    });
                } else {
                    shippingByStyleColor.forEach(shipping => {
                        const shippingToUpdate = shippingDb.find(shDb => shDb.shipping === shipping.shippingName);
                        if (shippingToUpdate) {
                            shippingToUpdate.units = isNaN(shipping.units) ? shippingToUpdate.units : shipping.units;
                            shippingToUpdate.date = moment(shipping.date).format('yyyy-MM-dd') === moment(new Date(null)).format('yyyy-MM-dd') ? shippingToUpdate.date : shipping.date;
                            purchaseStyleColorShippingsUpdate.push(shippingToUpdate);
                        }
                    });
                }
            }
        }


        const purchaseStyleColorShippings = shippings.filter(sh => purchaseStyleColorShippingsUpdate.filter(psh => psh.shipping === sh.shippingName && psh.purchaseStyleColor.id === sh.purchaseColorStoreId).length === 0).map(s => {
            const color = new PurchaseStyleColor();
            color.id = s.purchaseColorStoreId;
            // purchaseColorsId.push(color.id);
            const shippingsEntity = new PurchaseStyleColorShipping();
            shippingsEntity.id = s.id !== -1 ? s.id : undefined;
            shippingsEntity.units = s.units ?? 0;
            shippingsEntity.date = s.date;
            shippingsEntity.shipping = s.shippingName;
            shippingsEntity.purchaseStyleColor = color;
            return shippingsEntity;
        });
        purchaseStyleColorShippings.push(...purchaseStyleColorShippingsEmpty, ...purchaseStyleColorShippingsUpdate);

        const countPack = 100;
        let i = 0;
        do {
            const pack = purchaseStyleColorShippings.slice(i, countPack + i);
            await this.purchaseStyleColorShippingRepository.save(pack);
            i += countPack;
            if (countPack + i > purchaseStyleColorShippings.length) {
                const packEnd = purchaseStyleColorShippings.slice(i, countPack + i);
                await this.purchaseStyleColorShippingRepository.save(packEnd);
            }
        }
        while (purchaseStyleColorShippings.length > countPack + i);
        const responseShippings = shippings.map(s => {
            s.id = purchaseStyleColorShippings.find(c => c.purchaseStyleColor.id === s.purchaseColorStoreId && c.shipping === s.shippingName)?.id ?? -1
            return s;
        });

        return responseShippings;
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

    //TODO: Eliminar este servicio (logica antigua de guardado por columna)
    async saveStylesDetails(dto: SaveStyleDetailDto, user: UserDecode) {
        const { detailsType, valuesList } = dto;
        switch (detailsType) {
            // case DetailsType.Profile:
            //     const profileResponse = await this.purchaseStyleService.saveProfileDetails(valuesList);
            //     return profileResponse.map(r => new StyleDetailDto(r, r.id, r.profile.id.toString()));
            case DetailsType.Provider:
                const providerResponse = await this.purchaseStyleService.saveProviderDetails(valuesList, user);
                return providerResponse.map(r => new StyleDetailDto(r, r.id, r.provider.id.toString()));
            case DetailsType.Cso:
                const csoResponse = await this.purchaseStyleService.saveCsoDetails(valuesList);
                return csoResponse.map(r => new StyleDetailDto(r, r.id, r.cso.id.toString()));
            case DetailsType.Origin:
                const originResponse = await this.purchaseStyleService.saveOriginDetails(valuesList);
                const body: generateArrivalDatesDto = {
                    purchaseStyleIds: valuesList.map(item => item.purchaseStyleStoreId)
                }
                this.updateArrivalDates(body);
                return originResponse.map(r => new StyleDetailDto(r, r.id, r.origin.id.toString()));
            case DetailsType.Category:
                const categoryResponse = await this.purchaseStyleService.saveCategoryDetails(valuesList);
                return categoryResponse.map(r => new StyleDetailDto(r, r.id, r.category.id.toString()));
            case DetailsType.ExitPort:
                const exitPortResponse = await this.purchaseStyleService.saveExitPortDetails(valuesList);
                return exitPortResponse.map(r => new StyleDetailDto(r, r.id, r.exitPort.id.toString()));
            case DetailsType.Segment:
                const segmentResponse = await this.purchaseStyleService.saveSegmentDetails(valuesList);
                return segmentResponse.map(r => new StyleDetailDto(r, r.id, r.segment.id.toString()));
            case DetailsType.Size:
                const sizeResponse = await this.purchaseStyleService.saveSizeDetails(valuesList, user);
                return sizeResponse.map(r => new StyleDetailDto(r, r.id, r.size.id.toString()));
            case DetailsType.Ratio:
                const ratioResponse = await this.purchaseStyleService.saveRatioDetails(valuesList);
                return ratioResponse.map(r => new StyleDetailDto(r, r.id, r.ratio.id.toString()));
            case DetailsType.ShippingMethod:
                const shippingMethodResponse = await this.purchaseStyleService.saveShippingMethodDetails(valuesList);
                return shippingMethodResponse.map(r => new StyleDetailDto(r, r.id, r.shippingMethod.id.toString()));
            case DetailsType.PackingMethod:
                const packingMethodResponse = await this.purchaseStyleService.savePackingMethodDetails(valuesList);
                return packingMethodResponse.map(r => new StyleDetailDto(r, r.id, r.packingMethod.id.toString()));
            case DetailsType.Fob:
                const fobResponse = await this.purchaseStyleService.saveFobDetails(valuesList);
                return fobResponse.map(r => new StyleDetailDto(r, r.id, r.fob.toString()));
            case DetailsType.Price:
                const priceResponse = await this.purchaseStyleService.savePriceDetails(valuesList);
                return priceResponse.map(r => new StyleDetailDto(r, r.id, r.price.toString()));
            case DetailsType.PriceSATO:
                const priceSATOResponse = await this.purchaseStyleService.savePriceSATODetails(valuesList);
                return priceSATOResponse.map(r => new StyleDetailDto(r, r.id, r.sato.toString()));
            case DetailsType.Atc:
                const atcResponse = await this.purchaseStyleService.saveAtcDetails(valuesList);
                return atcResponse.map(r => new StyleDetailDto(r, r.id, r.atc ? '1' : '0'));
            case DetailsType.Hanger:
                const hangerResponse = await this.purchaseStyleService.saveHangerDetails(valuesList);
                return hangerResponse.map(r => new StyleDetailDto(r, r.id, r.hanger ? '1' : '0'));
            case DetailsType.VstTag:
                const vstTagResponse = await this.purchaseStyleService.saveVstTagDetails(valuesList);
                return vstTagResponse.map(r => new StyleDetailDto(r, r.id, r.vstTag ? '1' : '0'));
            case DetailsType.TechFile:
                const techFileResponse = await this.purchaseStyleService.saveTechFileDetails(valuesList);
                return techFileResponse.map(r => new StyleDetailDto(r, r.id, r.techFile ? '1' : '0'));
            case DetailsType.SizeSpec:
                const sizeSpecResponse = await this.purchaseStyleService.saveSizeSpecDetails(valuesList);
                return sizeSpecResponse.map(r => new StyleDetailDto(r, r.id, r.sizeSpec ? '1' : '0'));
            case DetailsType.InternetDescription:
                const descriptionResponse = await this.purchaseStyleService.saveInternetDescriptionDetails(valuesList);
                return descriptionResponse.map(r => new StyleDetailDto(r, r.id, r.internetDescription));
            case DetailsType.Negotiatior:
                const negotiatiorResponse = await this.purchaseStyleService.saveNegotiatiorDetails(valuesList);
                return negotiatiorResponse.map(r => new StyleDetailDto(r, r.id, r.negotiatior));
            case DetailsType.Designer:
                const designerResponse = await this.purchaseStyleService.saveDesignerDetails(valuesList);
                return designerResponse.map(r => new StyleDetailDto(r, r.id, r.designer));
            case DetailsType.Merchandiser:
                const merchandiserResponse = await this.purchaseStyleService.saveMerchandiserDetails(valuesList);
                return merchandiserResponse.map(r => new StyleDetailDto(r, r.id, r.merchandiser));
            case DetailsType.PM:
                const productManagerResponse = await this.purchaseStyleService.saveProductManagerDetails(valuesList);
                return productManagerResponse.map(r => new StyleDetailDto(r, r.id, r.productManager));
            case DetailsType.BM:
                const brandManagerResponse = await this.purchaseStyleService.saveBrandManagerDetails(valuesList);
                return brandManagerResponse.map(r => new StyleDetailDto(r, r.id, r.brandManager));
            case DetailsType.Rse:
                const rseResponse = await this.purchaseStyleService.saveRseDetails(valuesList);
                return rseResponse.map(r => new StyleDetailDto(r, r.id, r.rse.id.toString()));
            case DetailsType.Gauge:
                const gaugeResponse = await this.purchaseStyleService.saveGaugeDetails(valuesList);
                return gaugeResponse.map(r => new StyleDetailDto(r, r.id, r.gauge));
            case DetailsType.SeasonSticker:
                const seasonStickerResponse = await this.purchaseStyleService.saveSeasonSticker(valuesList);
                return seasonStickerResponse.map(r => new StyleDetailDto(r, r.id, r.seasonSticker.id.toString()));
            case DetailsType.FabricWight:
                const fabricWightResponse = await this.purchaseStyleService.saveFabricWightDetails(valuesList);
                return fabricWightResponse.map(r => new StyleDetailDto(r, r.id, r.fabricWight));
            case DetailsType.FabricConstruction:
                const fabricConstructionResponse = await this.purchaseStyleService.saveFabricConstructionDetails(valuesList);
                return fabricConstructionResponse.map(r => new StyleDetailDto(r, r.id, r.fabricConstruction));
            case DetailsType.FabricWeaving:
                const fabricWeavingResponse = await this.purchaseStyleService.saveFabricWeavingDetails(valuesList);
                return fabricWeavingResponse.map(r => new StyleDetailDto(r, r.id, r.fabricWeaving));
            case DetailsType.Composition:
                const compositionResponse = await this.purchaseStyleService.saveCompositionDetails(valuesList);
                return compositionResponse.map(r => new StyleDetailDto(r, r.id, r.composition));
            case DetailsType.AdditionalAccesory:
                const additionalAccesoryResponse = await this.purchaseStyleService.saveAdditionalAccesoryDetails(valuesList);
                return additionalAccesoryResponse.map(r => new StyleDetailDto(r, r.id, r.additionalAccesory));
            case DetailsType.FobReferencial:
                const fobReferencialResponse = await this.purchaseStyleService.saveFobReferencialDetails(valuesList);
                return fobReferencialResponse.map(r => new StyleDetailDto(r, r.id, r.fobReferencial.toString()));
            case DetailsType.ReferencialProvider:
                const referencialProviderResponse = await this.purchaseStyleService.saveReferencialProviderDetails(valuesList);
                return referencialProviderResponse.map(r => new StyleDetailDto(r, r.id, r.referencialProvider));
            case DetailsType.Collection:
                const collectionResponse = await this.purchaseStyleService.saveCollectionDetails(valuesList);
                return collectionResponse.map(r => new StyleDetailDto(r, r.id, r.collection));
            case DetailsType.Event:
                const eventResponse = await this.purchaseStyleService.saveEventDetails(valuesList);
                return eventResponse.map(r => new StyleDetailDto(r, r.id, r.event));
            case DetailsType.StyleCodeColors:
                const styleColorResponse = await this.purchaseStyleService.saveStyleColor(valuesList, user);
                return styleColorResponse;
            case DetailsType.Status:
                const statusResponse = await this.purchaseStyleService.saveStatusColor(valuesList);
                return statusResponse.map(r => new StyleDetailDto(r, r.id, r.status.id.toString()));
            default:
                break;
        }
    }

    async getStylesDetails(dto: number[]) {
        const responseDetails = await this.purchaseStyleService.getDetailsByIds(dto);
        return responseDetails;
    }

    async checkApprovedStylesColors(ids: number[]) {
        const purchaseStylesApproved = await this.purchaseStyleColorRepository.find({
            where: { approved: true, state: true, styleColorId: In(ids) }
        });
        return purchaseStylesApproved.map(ps => ps.styleColorId);
    }

    async getAllByFilterNegotiation(filter: FilterNegotiationDto, user: UserDecode) {
        const statusIds = [];
        if (user.roles.find(rol => rol.id === RoleType.Merchant || rol.id === RoleType.Master)) {
            statusIds.push(Status.PendingNegotiation);
            statusIds.push(Status.Cotizations);
        }
        if (user.roles.find(rol => rol.id === RoleType.PM || rol.id === RoleType.BM || rol.id === RoleType.Master)) {
            statusIds.push(Status.InNegotiation);
        }

        let query = this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
            .where('status.id IN (:...ids)', {ids: statusIds});

        if (filter.seasons && filter.seasons.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    filter.seasons.forEach((seasonId) => {
                        qb = qb.orWhere('seasonCommercial.id=' + seasonId);
                    });
                }));
        }
        if (filter.tripDates && filter.tripDates.length > 0) {
            query = query.andWhere(
                new Brackets((qb) => {
                    filter.tripDates.forEach((tripDate) => {
                        qb = qb.orWhere(`purchase."tripDate::date='${tripDate}'`);
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

        const purchaseDbList = await query.getMany();
        const departmentsIds = _.flatten(_.uniq(purchaseDbList.map(p => p.departments)));
        const departments = await this.externalStyleService.getDepartmentDataByIds(departmentsIds);
        const brandsIds = _.flatten(_.uniq(purchaseDbList.map(p => p.brands)));
        const brands = await this.externalStyleService.getBrandsByFilter(brandsIds);
        return purchaseDbList.map(p => new PurchaseListDto(p, brands, departments));
    }

    async getPurchaseConfirmNegotiation(purchaseId: number): Promise<PurchaseNegotiationConfirm[]> {
        let stylesInfo: PurchaseNegotiationConfirm[] = [];
        const purchaseEntity = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('purchase.negotiations', 'negotiations', 'negotiations.deleteDate is null')
            .leftJoinAndSelect('negotiations.provider', 'negotiationProvider')
            .leftJoinAndSelect('negotiations.exitPort', 'exitPort')
            .leftJoinAndSelect('stores.store', 'store')
            .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
            .leftJoinAndSelect('stores.styles', 'style', 'style.deleteDate is null')
            .leftJoinAndSelect('style.colors', 'colors', 'colors.deleteDate is null')
            .leftJoinAndSelect('colors.shippings', 'shippings', 'shippings.deleteDate is null')
            .leftJoinAndSelect('style.details', 'detail', 'detail.deleteDate is null')
            .leftJoinAndSelect('style.status', 'styleStatus')
            .leftJoinAndSelect('detail.provider', 'provider')
            .leftJoinAndSelect('provider.originCountry', 'originCountry')
            .leftJoinAndSelect('detail.size', 'size')
            .leftJoinAndSelect('detail.ratio', 'ratio')
            .leftJoinAndSelect('detail.packingMethod', 'packingMethod')
            .leftJoinAndSelect('detail.shippingMethod', 'shippingMethod')
            .leftJoinAndSelect('detail.origin', 'origin')
            .leftJoinAndSelect('detail.category', 'category')
            .leftJoinAndSelect('detail.purchaseStyleNegotiation', 'negotiation', 'negotiation.deleteDate is null')
            .leftJoinAndSelect('negotiation.provider', 'selectedProvider')
            .where({ id: purchaseId })
            .andWhere(`status.id IN (${Status.Cotizations}, ${Status.InNegotiation})`)
            .andWhere('style.active=:active', { active: true })
            .andWhere('colors.state = true')
            .getOne();
        if (!purchaseEntity) { return; }

        const stylesIds = _.uniq(_.flatten(purchaseEntity.stores.map(s => s.styles.filter(item => item.status.id === StatusPurchaseColorEnum.Negotiated).map(st => st.styleId))));
        const stylesData: StyleDto[] = await this.externalStyleService.getStylesDataByIds(stylesIds);
        const dollarsActive = await this.dollarService.getBySeasonAndDestinyCountry({ destinyId: 1, seasonId: purchaseEntity.seasonCommercialId });
        const tax = purchaseEntity.stores[0].store.destinyCountry.iva / 100;
        let uniqImportFactorsDto = [];

        stylesData.map((styleInfo: StyleDto) => {
            purchaseEntity.stores.forEach(store => {
                store.styles.forEach(style => {
                        style.details.forEach(detail => {
                            uniqImportFactorsDto.push({ 
                                destinyId: store.store.destinyCountryId, 
                                originId: detail.origin.id, 
                                departmentId: styleInfo.departmentId, 
                                shipmethodId: detail.shippingMethod.id
                            });
                        });
                });
            });
        });
        uniqImportFactorsDto = _.uniq(uniqImportFactorsDto);
        const importFactors = await this.importFactorService.getByDestinyAndOriginAndDepartment(uniqImportFactorsDto);

        stylesData.map((styleInfo: StyleDto) => {
            purchaseEntity.stores.forEach(store => {
                store.store.destinyCountryId
                store.styles.forEach(style => {
                    if (styleInfo.id === style.styleId) {
                        let imuRegular = 0;
                        let imuSato = 0;

                        styleInfo.colors.forEach(color => {
                            color.approved = style.colors.findIndex(col => col.styleColorId === color.id) >= 0 ? true : false;
                        });
                        style.details.forEach(detail => {
                            detail.origin.id
                            styleInfo.details = (!styleInfo.details) ? detail : (detail.size.code.split('-').length > styleInfo.details.size.code.split('-').length) ? detail : styleInfo.details;
                        });
                        const importFactor = importFactors.find(imp => imp.departmentId === styleInfo.departmentId 
                            && imp.destinyCountry.id === store.store.destinyCountryId
                            && imp.originCountry.id === styleInfo.details.origin.id
                            && imp.shipmethod.id === styleInfo.details.shippingMethod.id)?.factor || 0;
                        
                        if (tax > 0) {
                            imuSato = (styleInfo.details.sato > 0) ? 
                                ((styleInfo.details.sato / (1 + tax)) - styleInfo.details.fob * dollarsActive * importFactor) / (styleInfo.details.sato / (1 + tax))
                                : 0;
                            imuRegular = (styleInfo.details.price > 0) ? 
                                ((styleInfo.details.price / (1 + tax)) - styleInfo.details.fob * dollarsActive * importFactor) / (styleInfo.details.price / (1 + tax))
                                : 0;
                        }

                        const negotiations = purchaseEntity.negotiations.filter(negotiation => negotiation.styleId === styleInfo.id);
                        stylesInfo.push({
                            purchaseId: purchaseId,
                            styleId: styleInfo.id,
                            department: styleInfo.department,
                            subDepartment: styleInfo.subDepartment,
                            classType: styleInfo.classType,
                            brand: styleInfo.brand,
                            season: styleInfo.seasonProduct,
                            category: styleInfo.details.category.name,
                            tripDate: moment.utc(purchaseEntity.tripDate).format('MMM-yyyy'),
                            style: styleInfo.code,
                            colorQty: styleInfo.colors.filter(col => col.approved).length,
                            composition: styleInfo.details.composition,
                            fabricWeaving: styleInfo.details.fabricWeaving,
                            fabricConstruction: styleInfo.details.fabricConstruction,
                            fabricWeight: styleInfo.details.fabricWight,
                            gauge: styleInfo.details.gauge,
                            packingMethod: styleInfo.details.packingMethod.name,
                            vstTag: styleInfo.details.vstTag,
                            hanger: styleInfo.details.hanger,
                            fob: styleInfo.details.fob,
                            referencialProvider: styleInfo.details.referencialProvider,
                            totalUnits: style.getTotalUnits(),
                            ecommerce: purchaseEntity.stores.find(st => st.store.id === 4) ? true : false,
                            regularPrice: styleInfo.details.price,
                            satoPrice: styleInfo.details.sato,
                            imuRegular: imuRegular,
                            imuSato: imuSato,
                            tax: tax,
                            dollar: dollarsActive,
                            importFactor: importFactor,
                            purchaseStyleNegotiation: styleInfo.details.purchaseStyleNegotiation?.id || null,
                            vendorName: styleInfo.details.purchaseStyleNegotiation?.provider.name || null,
                            quotations: negotiations.map(negotiation => { 
                                return {
                                    id: negotiation.id,
                                    vendorName: negotiation.provider.name,
                                    vendorFob: negotiation.fob,
                                    exitPort: negotiation.exitPort.name,
                                    vendorComments: negotiation.comments,
                                    suggested: (negotiation.suggestedVendor) ? 'SI' : '',
                                }
                            })
                        })
                    }
                });
            });
        });

        stylesInfo = _.uniqBy(stylesInfo, 'styleId');
        return stylesInfo;
    }

    async saveQuotationSelectionData(dto: SaveQuotationSelectionDataDto, user: UserDecode): Promise<saveQuotationStatusResponse> {
        if (dto.type === 'save') { // Solo grabar cambios
            if (dto.styles.find(quotation => isNaN(quotation.fob))) { return saveQuotationStatusResponse.invalidFob; }
            if (dto.styles.find(quotation => isNaN(quotation.regularPrice))) { return saveQuotationStatusResponse.invalidPrice; }
            if (dto.styles.find(quotation => isNaN(quotation.satoPrice))) { return saveQuotationStatusResponse.invalidSato; }
        } else {
            if (dto.styles.find(quotation => !quotation.purchaseStyleNegotiation)) { return saveQuotationStatusResponse.notSelectedQuotation; }
            if (dto.styles.find(quotation => !quotation.fob || isNaN(quotation.fob))) { return saveQuotationStatusResponse.invalidFob; }
            if (dto.styles.find(quotation => !quotation.regularPrice || isNaN(quotation.regularPrice))) { return saveQuotationStatusResponse.invalidPrice; }
            if (dto.styles.find(quotation => isNaN(quotation.satoPrice))) { return saveQuotationStatusResponse.invalidSato; }
        }

        const purchaseEntity = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.status', 'status')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('purchase.negotiations', 'negotiations')
            .leftJoinAndSelect('negotiations.provider', 'provider')
            .leftJoinAndSelect('negotiations.exitPort', 'exitPort')
            .leftJoinAndSelect('stores.styles', 'style')
            .leftJoinAndSelect('style.colors', 'colors')
            .leftJoinAndSelect('style.details', 'detail')
            .where({ id: dto.purchaseId })
            .andWhere('status.id = 11')
            .andWhere('style.active=:active', { active: true })
            .andWhere('colors.state = true')
            .getOne();
        if (!purchaseEntity) { return saveQuotationStatusResponse.purchaseNotFound; }

        for await (const store of purchaseEntity.stores) {
            for await (const style of store.styles) {
                for await (const detail of style.details) {
                    const updatedStyleInfo = dto.styles.find(styleInfo => styleInfo.styleId === style.styleId);
                    if (updatedStyleInfo) {
                        const selectedQuotation = purchaseEntity.negotiations.find(negotiation => negotiation.id === updatedStyleInfo.purchaseStyleNegotiation);
                        if (!selectedQuotation && dto.type != 'save') { return saveQuotationStatusResponse.notSelectedQuotation; } // Just in case ;)
                        await this.purchaseStyleDetailsRepository.update(detail.id, { price: updatedStyleInfo.regularPrice || null,
                                                                           sato: updatedStyleInfo.satoPrice || null,
                                                                           fob: updatedStyleInfo.fob || null,
                                                                           provider: selectedQuotation?.provider || null,
                                                                           exitPort: selectedQuotation?.exitPort || null,
                                                                           purchaseStyleNegotiation: selectedQuotation || null });
                    }
                }
            }
        }
        // Actualizamos a compra completada
        if (dto.type != 'save') {
            const statusId = (dto.type === 'toAprove') ? 7 : 4;
            this.purchaseRepository.update(dto.purchaseId, { status: { id: statusId } });
        }

        return saveQuotationStatusResponse.success;
    }

    async revertStatus(purchaseId: number, user: UserDecode): Promise<revertPurchaseStatusResponse> {
        const purchaseEntity = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .leftJoinAndSelect('purchase.status', 'purchaseStatus')
            .leftJoinAndSelect('purchase.stores', 'stores')
            .leftJoinAndSelect('stores.styles', 'style')
            .leftJoinAndSelect('style.status', 'styleStatus')
            .leftJoinAndSelect('style.colors', 'colors')
            .leftJoinAndSelect('colors.status', 'colorStatus')
            .leftJoinAndSelect('colors.shippings', 'shippings')
            .where({ id: purchaseId })
            .andWhere('purchaseStatus.id in (8, 9, 11)')
            .andWhere('style.active=:active', { active: true })
            .andWhere('colors.state = true')
            .getOne();
        if (!purchaseEntity) { return revertPurchaseStatusResponse.purchaseNotFound; }

        if (!user.roles.find(rol => rol.id === RoleType.Master)) {
            return revertPurchaseStatusResponse.userNotAllowed;
        }

        switch (purchaseEntity.status.id) {
            case Status.Approvement:
            case Status.PendingNegotiation:
                for await (const stores of purchaseEntity.stores) {
                    for await (const styles of stores.styles) {
                        this.purchaseStyleRepository.update(styles.id, {
                            status: { id: 3 }
                        });
                        for await (const color of styles.colors) {
                            this.purchaseStyleColorRepository.update(color.id, {
                                status: { id: 3 },
                                approved: false,
                                piName: ''
                            })
                            for await (const shipping of color.shippings) {
                                this.purchaseStyleColorShippingRepository.update(shipping.id, {
                                    piName: ''
                                });
                            }
                        }
                    }
                }
                this.purchaseRepository.update(purchaseEntity.id, {
                    status: { id: Status.CompletePurchase }
                });

                break;

            case Status.InNegotiation:
                this.purchaseRepository.update(purchaseEntity.id, {
                    status: { id: Status.PendingNegotiation }
                });
            
                break;
        
            default:
                break;
        }

        return revertPurchaseStatusResponse.success;
    }

    async getPurchaseOwners() {
        const purchases = await this.purchaseRepository.createQueryBuilder('purchase')
            .select(['purchase.userId'])
            .distinctOn(['purchase.userId'])
            .getMany();

        const usersIds = purchases.map(p => p.userId);
        const users = await this.securityProxyService.getUsers({ ids: usersIds, departments: [], roles: [] });
        return users.map(u => {
            return {
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
            };
        });
    }

    async subtitutionDatesPurchaseStyleColorShippings() {
        let queryPurchase = this.purchaseStyleColorShippingRepository.createQueryBuilder('purchaseStyleColorShipping')
            .innerJoinAndSelect('purchaseStyleColorShipping.purchaseStyleColor', 'purchaseStyleColor')
            .innerJoinAndSelect('purchaseStyleColor.purchaseStyle', 'purchaseStyle')
            .innerJoin('purchaseStyle.purchaseStore', 'purchaseStore')
            .innerJoin('purchaseStore.purchase', 'purchase')
            .leftJoinAndMapOne('purchaseStyleColorShipping.store', Store, 'Store', 'purchaseStore.store = Store.id')
            .getMany();

        return queryPurchase;
    }

    async exportStepThree(dto: ExportPurchaseStep3Dto) {
        try {
            const { data } = dto;
            let excel = new Excel();
            let wb = excel.getWorkBook();
            let workSheet1 : IWorkSheet = {
                name: 'Hoja 1',
            }
            const options = {
                'hidden': true
            }
            let workSheet2 : IWorkSheet = {
                name: 'BASE',
                options: options
            }

            excel.setWorkSheets(workSheet1);
            excel.setWorkSheets(workSheet2);

            const headerTypesStep4 = [
                'MARCA',
                'DEPTO',
                'SUBDTO',
                'CLASE',
                'PERFIL',
                'ESTILO',
                'TIPO DE ARTICULO',
                'ORIGEN',
                'ATC',
                'TALLA',
                'CURVA',
                'INNER',
                'MASTER',
                'SHIPPING METHOD',
                'PACKING METHOD',
                'HANGER',
                'VST TAG',
                'SEASON STICKER',
                'COMPOSICIÓN',
                'TEJIDO DE TELA',
                'CONSTRUCCIÓN',
                'PESO',
                'GALGA',
                'RSE',
                'ACCESORIO ADICIONAL',
                'TEST',
                'CSO',
                'CATEGORIA',
                'MERCHANT',
                'BRAND MANAGER',
                'DISEÑADOR',
                'PRODUCT MANAGER',
                'NEGOCIADOR',
                'TECH FILE',
                'SIZE SPEC',
                'PROVEEDOR',
                'PROVEEDOR REFERENCIAL',
                'PUERTO DE SALIDA',
                'DESCRIPCION I.',
                'COLECCIÓN',
                'EVENTO',
            ];
            
            const lengthRows = data.length;

            // Fill Header Row Sheet Hoja 1
            excel.setHeaders(workSheet1.name, headerTypesStep4);
            
            const headerStyleRequired = {​​​​​​​​
                fill: {​​​​​​​​
                    type: 'pattern',
                    patternType:'solid',
                    bgColor: '#ff8a65',
                    fgColor: '#ff8a65',
                }​​​​​​​​,
            }​​​​​​​​;

            // set Styles Headers
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 8);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 10, 1, 11);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 14, 1, 15);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 18);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 24);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 27, 1, 33);
            excel.setCellStyle(workSheet1.name, headerStyleRequired, 1, 39);

            // Fill data Sheet Hoja 1
            excel.setDataToWorksheet(workSheet1.name, data);

            const filterDto = {
                active: "true",
                filterActive: "true"
            }

            const sortByProperty = (arrayObject: any[], property: string) : any[] => {
                return arrayObject.sort((a,b) => a[property] > b[property] ? 1 : b[property] > a[property] ? -1 : 0);
            }

            // get data of dropdowns lists
            const originCountryArray = await this.originService.getAll();
            const sizeArray = await this.sizeService.getAll(filterDto, 1, 1000);
            // const ratioArray = await this.ratioService.getAll();
            const shipmethodArray = await this.shipmethodService.getAll();
            const packagingArray = await this.packagingService.getAll();
            const seasonStickerArray = await this.seasonStickerService.getAll();
            const rseArray = await this.rseService.getAll();
            const csoArray = await this.csoService.getAll();
            let categoryArray = await this.categoryService.getAll();
            categoryArray = sortByProperty(categoryArray, 'name');
            let MerchantArray = await this.securityProxyService.getUsers({ ids: [], roles: [RoleType.Merchant], departments: [] });
            MerchantArray = sortByProperty(MerchantArray, 'firstName');
            let BMArray = await this.securityProxyService.getUsers({ ids: [], roles: [RoleType.BM], departments: [] });
            BMArray = sortByProperty(BMArray, 'firstName');
            let DesignerArray = await this.securityProxyService.getUsers({ ids: [], roles: [RoleType.Designer], departments: [] });
            DesignerArray = sortByProperty(DesignerArray, 'firstName');
            let PMArray = await this.securityProxyService.getUsers({ ids: [], roles: [RoleType.PM], departments: [] });
            PMArray = sortByProperty(PMArray, 'firstName');
            const filterExitPort : FindExitPortsDto = { filterActive: 'true' }
            const exitportsArray = await this.exitportsService.getAllFilterExitPort(filterExitPort, 1, 9999, ExitPortsOrderBy.name, 'ASC');
            const filterProvider : FindProviderDto = { filterActive: 'true' }
            const providerArray = await this.providerService.getAllFilter(filterProvider, 1, 9999, ProviderOrderBy.name, 'ASC');

            // Add validation list to columns
            const originCountryNames = originCountryArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 1);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$A$1:$A$${originCountryNames.length}`, `H2:H${lengthRows + 1}`);

            excel.setValidationList(workSheet1.name, `YES,NO`, `I2:I${lengthRows + 1}`);
            excel.setValidationList(workSheet1.name, `YES,NO`, `P2:P${lengthRows + 1}`);
            excel.setValidationList(workSheet1.name, `YES,NO`, `Q2:Q${lengthRows + 1}`);
            excel.setValidationList(workSheet1.name, `YES,NO`, `Z2:Z${lengthRows + 1}`);
            excel.setValidationList(workSheet1.name, `YES,NO`, `AH2:AH${lengthRows + 1}`);
            excel.setValidationList(workSheet1.name, `YES,NO`, `AI2:AI${lengthRows + 1}`);

            const sizeNames = sizeArray.items.map((item, index) => {
                excel.setCell(workSheet2.name, item.size, index + 1, 2);
                return item.size;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$B$1:$B$${sizeNames.length}`, `J2:J${lengthRows + 1}`);

            // const ratioNames = ratioArray.map((item, index) => {
            //     excel.setCell(workSheet2.name, index + 1, 3, item.ratio);
            //     return item.ratio;
            // });
            // excel.setValidationList(workSheet1.name, `K2:K${lengthRows + 1}`, `=BASE!$C$1:$C$${ratioNames.length}`);

            const shipmethodNames = shipmethodArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 4);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$D$1:$D$${shipmethodNames.length}`, `N2:N${lengthRows + 1}`);

            const packagingNames = packagingArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 5);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$E$1:$E$${packagingNames.length}`, `O2:O${lengthRows + 1}`);

            const seasonStickerNames = seasonStickerArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 6);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$F$1:$F$${seasonStickerNames.length}`, `R2:R${lengthRows + 1}`);

            const rseNames = rseArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 7);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$G$1:$G$${rseNames.length}`, `X2:X${lengthRows + 1}`);

            const csoNames = csoArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 8);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$H$1:$H$${csoNames.length}`, `AA2:AA${lengthRows + 1}`);

            const categoryNames = categoryArray.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 9);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$I$1:$I$${categoryNames.length}`, `AB2:AB${lengthRows + 1}`);

            const MerchantNames = MerchantArray.map((item, index) => {
                excel.setCell(workSheet2.name, `${item.firstName} ${item.lastName}`, index + 1, 10);
                return `${item.firstName} ${item.lastName}`;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$J$1:$J$${MerchantNames.length}`, `AC2:AC${lengthRows + 1}`);

            const BMNames = BMArray.map((item, index) => {
                excel.setCell(workSheet2.name, `${item.firstName} ${item.lastName}`, index + 1, 11);
                return `${item.firstName} ${item.lastName}`;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$K$1:$K$${BMNames.length}`, `AD2:AD${lengthRows + 1}`);

            const DesignerNames = DesignerArray.map((item, index) => {
                excel.setCell(workSheet2.name, `${item.firstName} ${item.lastName}`, index + 1, 12);
                return `${item.firstName} ${item.lastName}`;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$L$1:$L$${DesignerNames.length}`, `AE2:AE${lengthRows + 1}`);

            const PMNames = PMArray.map((item, index) => {
                excel.setCell(workSheet2.name, `${item.firstName} ${item.lastName}`, index + 1, 13);
                return `${item.firstName} ${item.lastName}`;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$M$1:$M$${PMNames.length}`, `AF2:AF${lengthRows + 1}`);

            const providerNames = providerArray.items.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 14);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$N$1:$N$${providerNames.length}`, `AJ2:AJ${lengthRows + 1}`);

            const exitportsNames = exitportsArray.items.map((item, index) => {
                excel.setCell(workSheet2.name, item.name, index + 1, 15);
                return item.name;
            });
            excel.setValidationList(workSheet1.name, `=BASE!$O$1:$O$${exitportsNames.length}`, `AL2:AL${lengthRows + 1}`);

            // Lock Cells
            excel.lockCells(workSheet1.name, `A1:G${lengthRows + 1}`);
            excel.lockCells(workSheet1.name, `K1:L${lengthRows + 1}`);
            excel.lockCells(workSheet1.name, `K1:M${lengthRows + 1}`);
            excel.lockCells(workSheet1.name, `Z1:Z${lengthRows + 1}`);

            // Hide Columns
            excel.hideCol(workSheet1.name, 12);
            excel.hideCol(workSheet1.name, 13);

            // Write buffer file
            const buffer = await wb.writeToBuffer();
            const name = `${dto.name}.xlsx`;

            // Upload to S3
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            const url = await S3.uploadFile(Buffer.from(buffer, 'binary'), name, 'application/msexcel', 600, this.logger);
            return url;
        } catch (error) {
            console.log(error);
            this.logger.error(`CATCH Error generando el archivo excel: ${error}`);  
            throw new InternalServerErrorException();
        }
    }
    
    /**
     * Obtener un listado de PI por marca, depto, proveedor según filtro dto
     * @param dto FilterApprovalDto
     * @returns IPurchaseOrderList[]
     * @example return [{ 
            "ocNameFile": "OIAAZE1575", 
            "brand": "ALANIZ",
            "department": "TRAJE DE BAÑOS",
            "provider": "STITCH BD KNITWEAR",
            "piName": "607AZPACHSTII21SZXE103SEP",
            "styles": 1,
            "stylesWithSku": 1,
            "stylesWithOc": 1
        }]
     */
    async getPurchaseOrdersList(dto: FilterApprovalDto): Promise<IPurchaseOrderList[]> {
        try
        {
            const { purchaseStyles, stylesData } = await this.purchaseStyleService.getPurchaseStylesByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);
    
            if (!stylesData || (purchaseStyles.length > 0 && stylesData.length === 0)) { return null; }
    
            const shippingsGrouped = _.groupBy(_.flatten(_.flatten(purchaseStyles.map(p => p.colors.map(c => c.shippings.map(sh => ({
                ...sh,
                sku: p['sku'],
                styleId: p.styleId,
                styleColorId: c.styleColorId,
                userId: p.purchaseStore.purchase.userId,
                localCode: p.purchaseStore.store.localCode,
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
    
            const response = [];
    
            for (const piName of Object.keys(shippingsGrouped)) {
                const stylesShippings = shippingsGrouped[piName];
                const styleProviderNameReference = stylesShippings[0].providerName;
                const styleDataReference = stylesData.find(s => s.id === stylesShippings[0].styleId);
    
                const ocNameFile = `OIA${styleDataReference.brandCode}${stylesShippings[0].shipping}${(Math.random() * 1000).toFixed().padStart(3, '0')}`;
                response.push({ 
                    ocNameFile: ocNameFile,
                    brand: styleDataReference.brand,
                    department: styleDataReference.department,
                    provider: styleProviderNameReference,
                    piName: piName,
                    styles: stylesShippings.length,
                    stylesWithSku: stylesShippings.filter(style => style.sku.length > 0).length,
                    stylesWithOc: stylesShippings.filter(style => style.oc.length > 0).length
                });
            }

            return response;
        } catch (error) {
            this.logger.error(`Ha ocurrido un error: ${error}`);
            throw new InternalServerErrorException();
        }
    }

    async getFilteredPurchaseList(dto: FilterApprovalDto): Promise<IPurchaseList[]> {
        try
        {
            const purchases = await this.getPurchaseListByFilter(dto, StatusPurchaseColorEnum.Confirmed, true);
            const usersId = _.uniq(purchases.map(p => p.userId));
            const users = await this.securityProxyService.getUsers({ ids: usersId, departments: [], roles: [] });

            const groupedPurchase = [];
            const departmentsIds = _.flatten(purchases.map(purchase => purchase.departments).filter((v, i, a) => a.indexOf(v) === i)) as number[];
            const departments = await this.externalStyleService.getDepartmentDataByIds(departmentsIds);
            const brandIds = _.flatten(purchases.map(purchase => purchase.brands).filter((v, i, a) => a.indexOf(v) === i)) as number[];
            const brands = await this.externalStyleService.getBrandsByFilter(brandIds);
            for (let index = 0; index < purchases.length; index++) {
                const purchaseId = purchases[index].id;
                if (!groupedPurchase.find(p => p.id === purchaseId)) {
                    const user = users.find(user => user.id === purchases[index].userId);
                    groupedPurchase.push({
                        id: purchaseId,
                        brands: brands.filter(brand => purchases[index].brands.find(b => b === brand.id)).map(brand => brand.name),
                        departments: departments.filter(department => purchases[index].departments.find(d => d === department.id)).map(d => d.name),
                        seasonCommercial: purchases[index].seasonCommercial,
                        tripDate: purchases[index].tripDate,
                        usuario: user ? `${user.firstName} ${user.lastName}` : 'No user',
                        unidadNegocio: purchases[index].stores.map(store => store.store)
                    });
                }
            }

            return groupedPurchase;
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error}`);
        }
    }
    
    async exportStepFour(dto: ExportPurchaseStep3Dto) {
        try {
            const { data } = dto;
            let excel = new Excel();
            let wb = excel.getWorkBook();
            let workSheet1 : IWorkSheet = {
                name: 'Hoja 1',
            }
            const options = {
                'hidden': true
            }
            let workSheet2 : IWorkSheet = {
                name: 'BASE',
                options: options
            }

            excel.setWorkSheets(workSheet1);
            excel.setWorkSheets(workSheet2);

            const headerTypesStep4 = [
                'MARCA',
                'DEPTO',
                'SUBDTO',
                'CLASE',
                'PERFIL',
                'ESTILO',
                'COLOR',
                'SEGMENTO',
                'FOB',
                'FOB REFERENCIAL',
                'PRECIO',
                'SATO',
                'IMU',
                'TOTAL',
                'E1',
                'E2',
                'E3',
                'E4',
                'E5',
                'E6',
                'FECHA E1',
                'FECHA E2',
                'FECHA E3',
                'FECHA E4',
                'FECHA E5',
                'FECHA E6',
            ];

            const lengthRows = data.length;

            // Fill Header Row Sheet Hoja 1
            excel.setHeaders(workSheet1.name, headerTypesStep4);
            
            // Fill data Sheet Hoja 1
            excel.setDataToWorksheet(workSheet1.name, data);

            const segments = await this.segmentService.getAll();

            const segmentNames = segments.map((segment, index) =>  {
                excel.setCell(workSheet2.name, segment.name, index + 1, 1);
                return segment.name;
            });
            excel.setValidationList(workSheet1.name, `H3:H${lengthRows + 1}`, `=BASE!$A$1:$A$${segmentNames.length}`);

            // Lock Cells
            excel.lockCells(workSheet1.name, `A1:G${lengthRows + 1}`);
            excel.lockCells(workSheet1.name, `M1:N${lengthRows + 1}`);
            excel.lockCells(workSheet1.name, `A2:Z2`);

            // Set Formulas
            
            excel.setFormula(workSheet1.name, 2, 14, `SUM(N3:N${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 15, `SUM(O3:O${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 16, `SUM(P3:P${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 17, `SUM(Q3:Q${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 18, `SUM(R3:R${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 19, `SUM(S3:S${lengthRows + 1})`);
            excel.setFormula(workSheet1.name, 2, 20, `SUM(T3:T${lengthRows + 1})`);

            data.forEach((value, index) => {
                if (index >= 1) {
                    excel.setFormula(workSheet1.name, index + 2, 14, `SUM(O${index + 2}:T${index + 2})`);
                }
            });

            // Hide Columns
            excel.hideCol(workSheet1.name, 21);
            excel.hideCol(workSheet1.name, 22);
            excel.hideCol(workSheet1.name, 23);
            excel.hideCol(workSheet1.name, 24);
            excel.hideCol(workSheet1.name, 25);
            excel.hideCol(workSheet1.name, 26);

            // Write buffer file
            const buffer = await wb.writeToBuffer();
            const name = `${dto.name}.xlsx`;

            // Upload to S3
            const S3 = new AwsS3(this.s3, this.AWS_S3_BUCKET_NAME);
            const url = await S3.uploadFile(Buffer.from(buffer, 'binary'), name, 'application/msexcel', 600, this.logger);
            return url;
        } catch (error) {
            console.log(error);
            this.logger.error(`CATCH Error generando el archivo excel: ${error}`);
            throw new InternalServerErrorException();
        }
    }

    async getPurchaseListByFilter(filter: FilterApprovalDto, statusColor: StatusPurchaseColorEnum, approved?) {
        try {
            let query = this.purchaseRepository.createQueryBuilder('purchase')
                .leftJoinAndSelect('purchase.status', 'status')
                .leftJoinAndSelect('purchase.seasonCommercial', 'seasonCommercial')
                .leftJoinAndSelect('purchase.stores', 'purchaseStore')
                .leftJoinAndSelect('purchaseStore.styles', 'purchaseStyle')
                .leftJoinAndSelect('purchaseStore.store', 'store')
                .leftJoinAndSelect('purchaseStyle.colors', 'colors')
                .leftJoinAndSelect('colors.status', 'colorStatus')
                .where({ active: true })
                .andWhere('colors.state = true');

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
            return await query.getMany();
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

interface IPurchaseOrderList {
    ocNameFile: string;
    brand: string;
    department: string;
    provider: string;
    piName: string;
    styles: number;
    stylesWithSku: number;
    stylesWithOc: number;
}

interface IPurchaseList {
    id: number,
    brands: string[],
    departments: string[],
    seasonCommercial: string,
    tripDate: string,
    usuario: number,
    unidadNegocio: string[]
}