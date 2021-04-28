import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTerms } from '../../../entities/paymentTerms.entity';

@Injectable()
export class PaymentTermsService {

  constructor(
    @InjectRepository(PaymentTerms)
    private readonly paymentTermsRepository: Repository<PaymentTerms>,
  ) {}

  async getAll() {
    const response = await this.paymentTermsRepository.find();
    return response;
  }
  
}
