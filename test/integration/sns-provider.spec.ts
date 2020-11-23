'use strict';

jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');
jest.unmock('aws-sdk/clients/SNS');
import { SNSPublisher } from '../../src';
jest.setTimeout(10000);

// tslint:disable:no-unused-expression
describe('EventStory Dynamodb Provider (Integration)', () => {

    const awsConfign = {
        credentials: {
            accessKeyId: '123456-localstack',
            secretAccessKey: '123456-localstack',
        },
        region: "us-east-1"
    };

    const snsPublisher = new SNSPublisher('arn:aws:sns:us-east-1:000000000000:events', awsConfign);

    it('should be able to get event list from the event stream', async () => {
        const published = await snsPublisher.publish({
            event: {
                eventType: 'SENT',
                payload: 'anything',
            },
            stream: {
                aggregation: 'order',
                id: '1',
            }
        });

        expect(published).toBeTruthy();
    });

    // it('should be able to add an event to the event stream', async () => {
    //     const event = await ordersStream.addEvent(EVENT_PAYLOAD);

    //     expect(event).not.toBeNull();
    //     expect(event.commitTimestamp).not.toBeNull();
    //     expect(event.sequence).not.toBeNull();
    // });

});
