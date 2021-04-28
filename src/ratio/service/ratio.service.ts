import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ratio } from '../../entities/ratio.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatioService {

    // Create a logger instance
    private logger = new Logger('RatioService');

    constructor(
        @InjectRepository(Ratio)
        private readonly ratioRepository: Repository<Ratio>,
    ) { }

    async getAll() {
        const ratio = await this.ratioRepository.find();
        return ratio;

    }

    async addRange(data: Ratio[]) {
        if (data.length > 0) {
            for (const ratio of data) {
                const existRatio = await this.ratioRepository.find({ where: { ratio: ratio.ratio } });
                if (existRatio.length === 0) {
                    await this.ratioRepository.save(data);
                }
            }
        }
    }


}
