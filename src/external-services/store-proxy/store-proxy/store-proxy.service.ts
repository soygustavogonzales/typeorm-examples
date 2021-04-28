import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class StoreProxyService {

  private api: string = '';
  private apiKey: string = '';
  // Create a logger instance
  private logger = new Logger('StyleProxyService');

  constructor(private httpService: HttpService, private config: ConfigService) {
    this.api = `${this.config.get('app').api_store}`;
    this.apiKey = `${this.config.get('app').api_store_key}`;
  }

  async setZeroQuantityStoreStuffingBySku(skus: String[]) {
    try {
      const url = `${this.api}/store-stuffing/quantity-zero`;
      const body = {
        skus: skus
      };
      const result = await this.httpService.patch(url, body, { headers: { 'api-key': this.apiKey } }).toPromise();
      if (result.status === 200) {
          return result.data;
      }
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

}
