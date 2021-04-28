import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import AWS = require('aws-sdk');
import { Consumer } from 'sqs-consumer';
import { JdaskusyncService } from '../service/jdaskusync.service';

@Injectable()
export class JdaSkuSyncConsumerService {

    private readonly logger = new Logger('JdaSkuSyncConsumerService');

    constructor(private readonly config: ConfigService, private jdaskusyncService: JdaskusyncService) {
        this.logger.log('Start Configure JdaSkuSyncConsumerService');
        this.configure();
        this.logger.log('Configured JdaSkuSyncConsumerService');
    }

    async configure() {
        try {
            AWS.config.update({
                accessKeyId: this.config.get('aws').aws_access_key_id,
                secretAccessKey: this.config.get('aws').aws_secret_access_key,
            });
            const appConsumer = Consumer.create({
                queueUrl: this.config.get('aws').aws_queue_sqs_jda_sku_sync_url,
                handleMessage: async (messageSns) => {
                    const bodyMessage = messageSns.Body;
                    const { Type, MessageId, TopicArn, Message } = JSON.parse(bodyMessage);

                    this.jdaskusyncService.jdasync();
                    this.logger.log('message received: ' + MessageId);
                },
                sqs: new AWS.SQS(),
            });
            appConsumer.on('error', (err) => {
                this.logger.error(err.message);
            });

            appConsumer.on('processing_error', (err) => {
                this.logger.error(err.message);
            });

            appConsumer.on('timeout_error', (err) => {
                this.logger.error(err.message);
            });

            appConsumer.start();

        } catch (error) {
            this.logger.error({
                message: `Consumer creation failed`,
                externalSystem: 'AWS',
                errorMessage: error.toString(),
            });
        }
    }
}
