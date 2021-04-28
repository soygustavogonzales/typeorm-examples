import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '../../entities/provider.entity';
import { Repository } from 'typeorm';
import { ProviderDto } from '../dtos/provider.dto';
import { ProviderUpdateDto } from '../dtos/providerUpdate.dto';
import { FindProviderDto } from '../dtos/findProvider.dto';
import { ProviderOrderBy } from '../dtos/providerOrderBy.enum';
import { ProvidersResponseDto } from '../dtos/provider.response.dto';
@Injectable()
export class ProviderService {
    // Create a logger instance
    private logger = new Logger('ProviderService');

    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
    ) { }

    async getAll() {
        const providers = await this.providerRepository.find({
            where: { active: true },
        });
        return providers;
    }

    async getProvider(id: number): Promise<ProviderDto> {
        const provider = await this.providerRepository.findOne(id)
        return provider
    }

    async updateProvider(updateDto: ProviderUpdateDto) {
        const provider = await this.providerRepository.findOne(updateDto.id);
        if (!provider) { throw new BadRequestException('Proveedor no existe'); }
        try {
            await this.providerRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error en request');
        }
    }

    async getAllFilter(
        filter: FindProviderDto,
        page: number,
        size: number,
        orderBy?: ProviderOrderBy,
        order: 'ASC' | 'DESC' = 'ASC') {

        let query = this.providerRepository
            .createQueryBuilder('provider')
            .skip(size * (page - 1))
            .take(size);
        if (filter && filter.codeJda) {
            query = query.andWhere('LOWER(provider.codeJda) LIKE :codeJda', { codeJda: `%${filter.codeJda.toLowerCase()}%` });
        }
        if (filter && filter.name) {
            query = query.andWhere('LOWER(provider.name) LIKE :name', { name: `%${filter.name.toLowerCase()}%` });
        }
        if (filter && filter.paymentTerm1) {
            query = query.andWhere('LOWER(provider.paymentTerm1) LIKE :paymentTerm1', { paymentTerm1: `%${filter.paymentTerm1.toLowerCase()}%` });
        }
        if (filter && filter.paymentTerm2) {
            query = query.andWhere('LOWER(provider.paymentTerm2) LIKE :paymentTerm2', { paymentTerm2: `%${filter.paymentTerm2.toLowerCase()}%` });
        }
        if (filter.ids) {
            const ids = filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (filter && filter.filterActive) {
            query = query.andWhere('provider.active = :active', { active: filter.filterActive === 'true' ? true : false });
        }
        if (orderBy) {
            switch (orderBy) {
                case ProviderOrderBy.codeJda:
                    query.addOrderBy('provider.codeJda', order);
                    break;
                case ProviderOrderBy.name:
                    query.addOrderBy('provider.name', order);
                    break;
                case ProviderOrderBy.paymentTerm1:
                    query.addOrderBy('provider.paymentTerm1', order);
                    break;
                case ProviderOrderBy.paymentTerm2:
                    query.addOrderBy('provider.paymentTerm2', order);
                    break;
                default:
                    break;
            }
        }
        const providers = await query.getManyAndCount();
        const result = new ProvidersResponseDto(providers[1], size);
        result.size = providers.length;
        result.items = providers[0];
        return result;
    }

    async updateById(updateDto: ProviderUpdateDto) {
        const providers = await this.providerRepository.findOne(updateDto.id);
        if (providers) {
            providers.active = updateDto.active;
            await this.providerRepository.save(providers);
        }
    }
}
