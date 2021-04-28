import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './service/provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '../entities/provider.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Provider]), SharedModule],
  controllers: [ProviderController],
  providers: [ProviderService]
})
export class ProviderModule {}
