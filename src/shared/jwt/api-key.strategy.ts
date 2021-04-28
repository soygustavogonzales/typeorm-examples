import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private configService: ConfigService) {
        super({
            header: 'api-key',
            prefix: '',
        }, true,
            (apikey: string, done: any, req: any, next: () => void) => {
                const key = this.configService.get('app').api_key || process.env.API_KEY;
                if (key !== apikey) {
                    return done(
                        new HttpException('Unauthorized access, verify the token is correct', HttpStatus.UNAUTHORIZED),
                        false,
                    );
                }
                return done(null, true, next);
            });
    }
}