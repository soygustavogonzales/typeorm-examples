import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '../../entities/store.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StoreService {
  // Create a logger instance
  private logger = new Logger('StoreService');

  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async getAll(destinyCountry?: string) {
    let queryStore = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.destinyCountry', 'destinyCountry')
      .orderBy('store.priority', 'ASC');

    if (destinyCountry) {
      queryStore = queryStore.where('store.destinyCountry = :destinyCountry', {
        destinyCountry: +destinyCountry,
      });
    }
    const stores = queryStore.getMany();
    return stores;
  }

  async getAllByIds(storesId: number[]) {
    const stores = await this.storeRepository.findByIds(storesId);
    return stores;
  }
  
  async getByShortName(shortName: string) {
    return await this.storeRepository.find({ where: { shortName } });
  }
}
