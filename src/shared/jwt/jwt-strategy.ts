import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { JwtPayload } from './jwt-payload.interface';
import { SecurityProxyService } from '../../external-services/security-proxy/security-proxy.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     *
     */
    constructor(
        private securityProxyService: SecurityProxyService,
        private readonly config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || config.get('app').jwt,
        });
    }

    async validate(payload: JwtPayload): Promise<any> {
        const { id, email } = payload;
        const users = await this.securityProxyService.getUsers({ ids: [id], roles: null, departments: null });
        if (users.length > 0) {
            return users[0];
        }
        return null;
    }
}