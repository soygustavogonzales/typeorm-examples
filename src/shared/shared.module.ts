import { Module } from '@nestjs/common';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [],
    providers: [ApiKeyAuthGuard, JwtAuthGuard],
    exports: [ApiKeyAuthGuard, JwtAuthGuard]
  })
export class SharedModule {}
