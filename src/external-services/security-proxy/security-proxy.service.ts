import { Injectable, Logger, HttpService } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { GetUserDto } from './dtos/getUser.dto';
import { RoleType } from '../../shared/enums/role.enum';
import { NotificationEmailDto } from './dtos/NotificationEmailDto';

@Injectable()
export class SecurityProxyService {

    private api: string = '';
    private apiKey: string = '';
    // Create a logger instance
    private logger = new Logger('SecurityProxyService');


    constructor(private httpService: HttpService, private config: ConfigService) {
        this.api = `${this.config.get('app').api_security}`;
        this.apiKey = `${this.config.get('app').api_security_key}`;
    }

    // async checkUserExist(email: string): Promise<number[]> {
    //     try {
    //         const url = `${this.api}/user/byFilter`;
    //         const params = { page: 1, size: 1000, emails: [email] };
    //         const result = await this.httpService.get(url, { params, headers: { api_key: this.apiKey } }).toPromise();
    //         if (result.status === 200 && result.data.items?.length > 0) {
    //             return result.data.items[0];
    //         } else {
    //             return null;
    //         }
    //     } catch (error) {
    //         this.logger.error(error);
    //         return null;
    //     }
    // }
    async getUsers(arg0: { ids: number[]; roles: RoleType[]; departments: number[] }): Promise<GetUserDto[]> {
        try {
            const url = `${this.api}/user/byFilter`;
            const idsParams = arg0.ids?.join(',') || null;
            const rolesParams = arg0.roles?.join(',') || null;
            const departmentIds = arg0.departments?.join(',') || null;
            const params = { page: 1, size: 1000, ids: idsParams, roles: rolesParams, departmentIds };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data.items;
            } else {
                return null;
            }
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async sendNotificationEmail(dto: NotificationEmailDto) {
        try {
            const url = `${this.api}/notification-email`;
            const body = dto;
            const result = await this.httpService.post(url, body, { headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result;
            }
        } catch(error) {
            this.logger.error(error);
            return null;
        }
    }
}
