import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cso } from '../../entities/cso.entity';
import { Repository } from 'typeorm';
import { CsoDto } from '../dtos/cso.dto';
import { PurchaseStyleDetails } from '../../entities/purchaseStyleDetails.entity';
import { FindCsoDto } from '../dtos/findCso.dto';
import { CsoOrderBy } from '../dtos/csoOrderBy.enum.dto';
import { CsoResponseDto } from '../dtos/cso.response.dto';

@Injectable()
export class CsoService {
    // Create a logger instance
    private logger = new Logger('CsoService');

    constructor(
      @InjectRepository(Cso)
      private readonly csoRepository: Repository<Cso>,
      @InjectRepository(PurchaseStyleDetails)
      private readonly purchaseRepository: Repository<PurchaseStyleDetails>,
    ) {}

    async getAllFilterCso(filter: FindCsoDto, page: number,
      size: number,
      orderBy?: CsoOrderBy,
      order: 'ASC' | 'DESC' = 'ASC') {
  
      let query = this.csoRepository
          .createQueryBuilder('cso')
          .skip(size * (page - 1))
          .take(size);
  
      if (filter && JSON.parse(filter.filterActive)) {
          const active = JSON.parse(filter.active);
          query = query.andWhere('cso.active=:active', { active });
      }
      if (filter && filter.name) {
          query = query.andWhere('cso.name=:name', { name: filter.name });
      }
      if (filter.ids) {
          const ids= filter.ids.split(',').map((i) => parseInt(i, null));
          query = query.andWhereInIds(ids);
      }
      if (orderBy) {
          switch (orderBy) {
              case CsoOrderBy.name:
                  query.addOrderBy('cso.name', order);
                  break;
              default:
                  break;
          }
      }
      const cso = await query.getManyAndCount();
      const result = new CsoResponseDto(cso[1], size);
      result.size = cso.length;
      result.items = cso[0];
      return result;
    }

    async getAll() {
      const cso = await this.csoRepository.find({ where: { active: true } });
      return cso;
    }

    async getCso(id: number): Promise<CsoDto> {
      const response = await this.csoRepository.findOne(id)
      return response
    }

    async create(createDto: CsoDto): Promise<Cso> {
      const newCso = new CsoDto();
      newCso.active = true;
      Object.assign(newCso, createDto);
      const response = await this.csoRepository.save(newCso);
      return response;
    }

    async update(updateDto: CsoDto) {
      const cso = await this.csoRepository.findOne(updateDto.id);
      if (!cso) { throw new BadRequestException('CSO no existe'); }
      try {
          await this.csoRepository.update(updateDto.id, updateDto);
          return updateDto.id;
      } catch (error) {
          console.log(error)
          throw new BadRequestException('Error en request');
      }
    }

    async deleteById(updateDto: CsoDto) {
      await this.csoRepository.findOne(updateDto.id);
      if (updateDto) {
          updateDto.active = false;
          await this.csoRepository.save(updateDto);
      }
  }
}
