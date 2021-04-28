import { Injectable, Logger } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import { ConfigService } from 'nestjs-config';
import { inspect } from 'util';
import AWS = require('aws-sdk');

@Injectable()
export class NotificationPublisherService {
    private topicNotificationArn: string;
    private sns: SNS;
    private readonly logger = new Logger('NotificationPublisherService');
    private asyncConfiguration: Promise<string>;

    constructor(private readonly config: ConfigService) {
        this.config = config;
        // this.topicNotificationArn = this.config.get('aws').aws_topic_notification_arn;
        this.asyncConfiguration = this.configure();
    }

    async configure() {
        try {
            AWS.config.update({
                accessKeyId: this.config.get('aws').aws_access_key_id,
                secretAccessKey: this.config.get('aws').aws_secret_access_key,
            });
            this.sns = new SNS({ region: this.config.get('aws').aws_region });
            // const createTopicData = (await this.sns
            //     .createTopic({
            //         Name: `cl-ecom-notification-sent`,
            //     })
            //     .promise()) as any;
            // this.topicNotificationArn = createTopicData.TopicArn;
            // this.logger.log( this.config.get('aws').aws_sns_topic_arn);
            this.topicNotificationArn = this.config.get('aws').aws_sns_topic_arn;
            this.logger.log('Creation topic finished successfully');
            return this.topicNotificationArn;
        } catch (error) {
            this.logger.error({
                message: `Consumer creation failed`,
                externalSystem: 'AWS',
                errorMessage: error.toString(),
            });
        }
    }

    publishMessageToTopic(message: string) {
        const params = {
            Message: message,
            TopicArn: this.topicNotificationArn,
        };
        const orderResponseDto = JSON.parse(message);
        this.logger.debug({
            message: `Publishing message in ARN:${this.topicNotificationArn}, message: ${inspect(
                message,
                false,
                null,
            )}`,
            orderNumber: orderResponseDto.origin_order_number,
        });
        return this.sns
            .publish(params)
            .promise()
            .catch(error =>
                this.logger.error({
                    message: `Fail to publish SNS message`,
                    externalSystem: 'AWS',
                    errorMessage: error.toString(),
                }),
            );
    }

    async getTopicArn() {
        return this.asyncConfiguration.then(() => this.topicNotificationArn);
    }
}
