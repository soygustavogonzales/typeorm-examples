import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class StyleProxyService {


    private api: string = '';
    private apiKey: string = '';
    // Create a logger instance
    private logger = new Logger('StyleProxyService');


    constructor(private httpService: HttpService, private config: ConfigService) {
        this.api = `${this.config.get('app').api_styles}`;
        this.apiKey = `${this.config.get('app').api_styles_key}`;
    }

    async getStylesDataByIds(ids: number[]) {
        try {
            const url = `${this.api}/style`;
            const idsParams = ids.join(',');
            const params = { page: 1, size: 1000, ids: idsParams };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data.items;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }

    async getStylesDataByIdsBatch(ids: number[]) {
        try {
            const url = `${this.api}/style/getstyles-batch`;
            const idsParams = ids.join(',');
            const params = { page: 1, size: 1000, filters: { ids: idsParams } };
            const result = await this.httpService.post(url, params, { headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 201) {
                return result.data.items;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }

    async getAttributes() {
        try {
            const url = `${this.api}/enhancement/attribute`;
            const result = await this.httpService.get(url, { headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }


    async getStyleEnhancementDataByIds(ids: number[]) {
        try {
            const url = `${this.api}/style-enhancement`;
            const idsParams = ids.join(',');
            const params = { page: 1, size: 1000, ids: idsParams };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }


    async getDepartmentDataByIds(ids: number[]) {
        try {
            const url = `${this.api}/department/byId`;
            const result = await this.httpService.post(url, ids, { headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 201) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }

    }
    
    async getDepartmentsByCodeDepartmentCountry(codes: number[]) {
        try {
            const url = `${this.api}/department/filter-by-code-department-country`;
            const result = await this.httpService.post(url, codes, { headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 201) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }

    }

    async getClassTypesByFilter(ids: number[]) {
        try {
            const url = `${this.api}/class-type`;
            const idsParams = ids.join(',');
            const params = { page: 1, size: 1000, ids: idsParams };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data.items;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }
    async getBrandsByFilter(ids: any) {
        try {
            const url = `${this.api}/brand/filter`;
            const idsParams = ids.join(',');
            const params = { page: 1, size: 1000, ids: idsParams, active: true, filterActive: true };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data.items;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }
    async getProfilesByFilter(ids: any) {
        try {
            const url = `${this.api}/profile/filter`;
            const idsParams = ids.join(',');
            const params = { ids: idsParams };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }

    async getStyleColorByIds(ids: Number[]) {
        try {
            const url = `${this.api}/style-color`;
            const idsParams = ids.join(',');
            const params = { ids: idsParams };
            const result = await this.httpService.get(url, { params, headers: { 'api-key': this.apiKey } }).toPromise();
            if (result.status === 200) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }
}
