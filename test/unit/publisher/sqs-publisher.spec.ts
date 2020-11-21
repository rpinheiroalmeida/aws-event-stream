
'use strict';

import { awsSdkPromiseResponse, SQS } from '../../../__mocks__/aws-sdk/clients/sqs';
import { SQSPublisher } from '../../../src/publisher/sqs';

describe('EventStory SQS Publisher', () => {

    const sqs = new SQS();

    beforeEach(() => {
        sqs.sendMessage.mockClear();
        awsSdkPromiseResponse.mockClear();
    });

    it('should be able to publish events to sqs', async () => {

        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            MessageId: '12345'
        }));
        expect.assertions(3);

        const sqsPublisher = new SQSPublisher('http://local', { region: 'any region' });

        const messageBody = {
            event: {
                commitTimestamp: 1234567,
                payload: 'anything',
                sequence: 1,
            },
            stream: { aggregation: 'orders', id: '1' },
        };
        const published = await sqsPublisher.publish(messageBody);

        expect(published).toBeTruthy();
        expect(sqs.sendMessage).toBeCalledTimes(1);
        expect(sqs.sendMessage).toBeCalledWith({
            MessageAttributes: {
                aggregation: { DataType: "String", StringValue: "orders" },
                commitTimestamp: { DataType: "Number", StringValue: "1234567" },
                id: { DataType: "String", StringValue: "1" }
            },
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: "http://local"
        });

    });

    it('should not be able to publish events to sqs when an no messageId is returned', async () => {

        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({}));
        expect.assertions(4);

        const sqsPublisher = new SQSPublisher('http://local', { region: 'any region' });

        const messageBody = {
            event: {
                commitTimestamp: 1234567,
                payload: 'anything',
                sequence: 1,
            },
            stream: { aggregation: 'orders', id: '1' },
        };
        const published = await sqsPublisher.publish(messageBody);

        expect(sqs.sendMessage).toBeCalledTimes(1);
        expect(published).toBeFalsy();
        expect(sqs.sendMessage).toHaveBeenCalled();
        expect(sqs.sendMessage).toBeCalledWith({
            MessageAttributes: {
                aggregation: { DataType: "String", StringValue: "orders" },
                commitTimestamp: { DataType: "Number", StringValue: "1234567" },
                id: { DataType: "String", StringValue: "1" }
            },
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: "http://local"
        });
    });

    it('should not be able to publish events to sqs when an error happened', async () => {

        awsSdkPromiseResponse.mockReturnValueOnce(Promise.reject(new Error('some error')));
        expect.assertions(4);

        const sqsPublisher = new SQSPublisher('http://local', { region: 'any region' });

        const messageBody = {
            event: {
                commitTimestamp: 1234567,
                payload: 'anything',
                sequence: 1,
            },
            stream: { aggregation: 'orders', id: '1' },
        };

        expect(async () => await sqsPublisher.publish(messageBody)).rejects.toThrowError('some error');

        expect(sqs.sendMessage).toBeCalledTimes(1);
        expect(sqs.sendMessage).toHaveBeenCalled();
        expect(sqs.sendMessage).toBeCalledWith({
            MessageAttributes: {
                aggregation: { DataType: "String", StringValue: "orders" },
                commitTimestamp: { DataType: "Number", StringValue: "1234567" },
                id: { DataType: "String", StringValue: "1" }
            },
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: "http://local"
        });
    });

    // it('should be able to subscribe to listen changes in the eventstore', async () => {
    //     const sqsPublisher = new SQSPublisher('http://local', { region: 'any region' });

    //     const subscriberOrdersStub = jest.fn();
    //     const consumer = await sqsPublisher.subscribe('orders', subscriberOrdersStub);

    //     const consumerExpected = {
    //         handleMessage: subscriberOrdersStub,
    //         queueUrl: 'http://local',
    //     };
    //     expect(consumerStub).toHaveBeenCalled();
    //     expect(consumerStub).toHaveBeenCalledWith(consumerExpected);
    //     expect(startConsumerStub.start).toHaveBeenCalled();
    //     expect(consumer).toEqual(startConsumerStub);
    // });
});