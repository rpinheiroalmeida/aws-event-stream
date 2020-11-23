
import { config, SNS } from 'aws-sdk';
import { AWSConfig } from '../aws/config';
import { MessageType } from '../model/message';
import { getEndpointUrl } from '../util';
import { HasSubscribers, Publisher, Subscriber, Subscription } from './publisher';


export interface SNSOption {
    protocol: Protocols;
    endpointSubscriber: string;
}

export enum Protocols {
    HTTP = 'http', HTTPS = 'https'
}
/**
 * A Publisher that use SQS to message communications.
 */
export class SNSPublisher implements Publisher, HasSubscribers {


    private url: string;
    private sns: SNS;
    private snsOption: SNSOption;

    constructor(url: string, awsconfig: AWSConfig, snsOptions?: SNSOption) {
        config.update(awsconfig);
        this.sns = new SNS(getEndpointUrl());
        this.url = url;
        this.snsOption = snsOptions;
    }

    public async publish(message: MessageType): Promise<boolean> {
        const snsData = {
            Message: JSON.stringify(message),
            MessageAttributes: {
                eventType: {
                    DataType: 'String',
                    StringValue: message.event.eventType,
                }
            },
            TopicArn: this.url,
        };

        const messageId = await (await this.sns.publish(snsData).promise()).MessageId;
        return messageId !== null && messageId !== undefined;
    }

    public async subscribe(_: string, __: Subscriber): Promise<Subscription> {
        if (this.snsOption === undefined) {
            throw new Error('SNSOption is required to subscriber');
        }

        const protocolRegex = RegExp(this.snsOption.protocol + ':', 'g');
        if (!protocolRegex.exec(this.snsOption.endpointSubscriber)) {
            throw new Error('Protocol and endpoint subscriber does not match');
        }
        const snsParams = {
            Endpoint: this.snsOption.endpointSubscriber,
            Protocol: this.snsOption.protocol,
            TopicArn: this.url,
        };

        await this.sns.subscribe(snsParams).promise();

        return Promise.resolve({
            remove: () => {
                this.sns.unsubscribe().promise();
                return Promise.resolve();
            }
        });
    }


}