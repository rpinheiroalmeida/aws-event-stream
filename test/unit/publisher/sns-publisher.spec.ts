
'use strict';

import { awsSdkPromiseResponse, SNS } from '../../../__mocks__/aws-sdk/clients/sns';
import { MessageType } from '../../../src/model/message';
import { Protocols, SNSOption, SNSPublisher } from '../../../src/publisher/sns';

describe('EventStory SNS Publisher', () => {

    const sns = new SNS();

    beforeEach(() => {
        sns.publish.mockClear();
        awsSdkPromiseResponse.mockClear();
    });

    describe('publish', () => {
        it('should be able to publish events to SNS', async () => {

            awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
                MessageId: '12345'
            }));
            expect.assertions(3);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' });

            const messageBody = {
                event: {
                    commitTimestamp: 1234567,
                    eventType: 'SENT',
                    payload: 'anything',
                    sequence: 1,
                },
                stream: { aggregation: 'orders', id: '1' },
            } as MessageType;
            const published = await snsPublisher.publish(messageBody);

            expect(published).toBeTruthy();
            expect(sns.publish).toBeCalledTimes(1);
            expect(sns.publish).toBeCalledWith(
                {
                    Message: "{\"event\":{\"commitTimestamp\":1234567,\"eventType\":\"SENT\",\"payload\":\"anything\",\"sequence\":1},\"stream\":{\"aggregation\":\"orders\",\"id\":\"1\"}}",
                    MessageAttributes: {
                        eventType: {
                            DataType: "String",
                            StringValue: "SENT",
                        },
                    },
                    TopicArn: "http://local",
                }
            );

        });

        it('should not be able to publish events to sqs when a messageId is null', async () => {

            awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
                MessageId: null
            }));
            expect.assertions(4);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' });

            const messageBody = {
                event: {
                    commitTimestamp: 1234567,
                    eventType: 'SENT',
                    payload: 'anything',
                    sequence: 1,
                },
                stream: { aggregation: 'orders', id: '1' },
            };
            const published = await snsPublisher.publish(messageBody);

            expect(sns.publish).toBeCalledTimes(1);
            expect(published).toBeFalsy();
            expect(sns.publish).toHaveBeenCalled();
            expect(sns.publish).toBeCalledWith(
                {
                    Message: "{\"event\":{\"commitTimestamp\":1234567,\"eventType\":\"SENT\",\"payload\":\"anything\",\"sequence\":1},\"stream\":{\"aggregation\":\"orders\",\"id\":\"1\"}}",
                    MessageAttributes: {
                        eventType: {
                            DataType: "String",
                            StringValue: "SENT",
                        },
                    },
                    TopicArn: "http://local",
                }
            );
        });

        it('should not be able to publish events to sqs when an no messageId is returned', async () => {

            awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({}));
            expect.assertions(4);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' });

            const messageBody = {
                event: {
                    commitTimestamp: 1234567,
                    eventType: 'SENT',
                    payload: 'anything',
                    sequence: 1,
                },
                stream: { aggregation: 'orders', id: '1' },
            };
            const published = await snsPublisher.publish(messageBody);

            expect(sns.publish).toBeCalledTimes(1);
            expect(published).toBeFalsy();
            expect(sns.publish).toHaveBeenCalled();
            expect(sns.publish).toBeCalledWith(
                {
                    Message: "{\"event\":{\"commitTimestamp\":1234567,\"eventType\":\"SENT\",\"payload\":\"anything\",\"sequence\":1},\"stream\":{\"aggregation\":\"orders\",\"id\":\"1\"}}",
                    MessageAttributes: {
                        eventType: {
                            DataType: "String",
                            StringValue: "SENT",
                        },
                    },
                    TopicArn: "http://local",
                }
            );
        });

        it('should not be able to publish events to sqs when an error happened', async () => {

            awsSdkPromiseResponse.mockReturnValueOnce(Promise.reject(new Error('some error')));
            expect.assertions(4);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' });

            const messageBody = {
                event: {
                    commitTimestamp: 1234567,
                    eventType: 'SENT',
                    payload: 'anything',
                    sequence: 1,
                },
                stream: { aggregation: 'orders', id: '1' },
            };

            expect(async () => await snsPublisher.publish(messageBody)).rejects.toThrowError('some error');

            expect(sns.publish).toBeCalledTimes(1);
            expect(sns.publish).toHaveBeenCalled();
            expect(sns.publish).toBeCalledWith(
                {
                    Message: "{\"event\":{\"commitTimestamp\":1234567,\"eventType\":\"SENT\",\"payload\":\"anything\",\"sequence\":1},\"stream\":{\"aggregation\":\"orders\",\"id\":\"1\"}}",
                    MessageAttributes: {
                        eventType: {
                            DataType: "String",
                            StringValue: "SENT",
                        },
                    },
                    TopicArn: "http://local",
                }
            );
        });
    });

    describe('subscribe', () => {
        it('when sns optins is undefined', async () => {

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' });
            expect.assertions(1);

            expect(snsPublisher.subscribe('', null)).rejects.toThrowError('SNSOption is required to subscriber');

        });

        it('when protocol and subscribe url does not match', async () => {
            const snsOption: SNSOption = {
                endpointSubscriber: 'http://localhost',
                protocol: Protocols.HTTPS,
            };
            expect.assertions(1);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' }, snsOption);

            expect(snsPublisher.subscribe('', null)).rejects.toThrowError('Protocol and endpoint subscriber does not match');
        });

        it('should subscribe with success', async () => {
            const snsOption: SNSOption = {
                endpointSubscriber: 'https://localhost',
                protocol: Protocols.HTTPS,
            };
            expect.assertions(2);

            const snsPublisher = new SNSPublisher('http://local', { region: 'any region' }, snsOption);
            const result = await snsPublisher.subscribe('', null);

            expect(result).not.toBeUndefined();
            result.remove();

            expect(sns.unsubscribe).toBeCalled();
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