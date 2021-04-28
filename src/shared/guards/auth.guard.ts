import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyAuthGuard } from './api-key-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Observable } from 'rxjs';
@Injectable()
export class ComposeGuard implements CanActivate {
    constructor(private apiKeyGuard: ApiKeyAuthGuard, private jwtGuard: JwtAuthGuard) {
    }

    async canActivate(context: ExecutionContext) {
        try {
            await this.apiKeyGuard.canActivate(context);
            return true;
        } catch (error) {
            try {
                await this.jwtGuard.canActivate(context);
                return true;
            } catch (error) {
                throw new UnauthorizedException();
            }
        }
    }

}