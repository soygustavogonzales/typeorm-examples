import { Module, HttpModule } from '@nestjs/common';
import { StyleProxyService } from './style-proxy/style-proxy.service';
import { SecurityProxyService } from './security-proxy/security-proxy.service';
import { NotificationPublisherService } from './events/notification-publisher.service';
import { StoreProxyService } from './store-proxy/store-proxy/store-proxy.service';
import * as http from 'http';
import * as https from 'https';
@Module({
    imports: [
        HttpModule.register({
            timeout: 1000 * 60 * 10,
            maxRedirects: 5,
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
        }),
    ],
    providers: [StyleProxyService, SecurityProxyService, NotificationPublisherService, StoreProxyService],
    exports: [StyleProxyService, SecurityProxyService, NotificationPublisherService, StoreProxyService]
})
export class ExternalServicesModule {

}
