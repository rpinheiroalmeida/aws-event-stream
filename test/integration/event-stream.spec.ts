jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');
jest.setTimeout(1000000);

import * as AWS from "aws-sdk";
import { SQS } from "aws-sdk";
import { Config, DynamodbProvider, EventStore } from "../../src";
import { AWSConfig } from "../../src/aws/config";
import { SNSPublisher } from "../../src/publisher/sns";

describe.only('EventStream', () => {

    AWS.config.update(
        {
            credentials: {
                accessKeyId: 'aws-event-stream',
                secretAccessKey: 'aws-event-stream',
            },
            region: "us-east-1"
        });

    const awsConfig: AWSConfig = {
        credentials: {
            accessKeyId: '123456-localstack',
            secretAccessKey: '123456-localstack',
        },
        region: "us-east-1"
    };

    const dynamodbConfig: Config = {
        awsConfig: awsConfig,
        dynamodb: {
            endpointUrl: 'http://localhost:4566',
            tableName: 'order-events',
        },
    };

    const sqs = new SQS({
        endpoint: 'http://localhost:4566',
        region: 'us-east-1',
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('publish a message', async () => {

        const params = {
            // Remove DelaySeconds parameter and value for FIFO queues
            DelaySeconds: 10,
            MessageAttributes: {
                "Author": {
                    DataType: "String",
                    StringValue: "John Grisham"
                },
                "Title": {
                    DataType: "String",
                    StringValue: "The Whistler"
                },
                "WeeksOn": {
                    DataType: "Number",
                    StringValue: "6"
                }
            },
            MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
            QueueUrl: "http://localhost:4566/000000000000/order-events-placed"
        };
        sqs.sendMessage(params);
        await sleep(5000);

        const message = await sqs.receiveMessage({
            AttributeNames: ['All'],
            MessageAttributeNames: ['All'],
            QueueUrl: 'http://localhost:4566/000000000000/order-events-placed',
        }).promise();
        expect(message).toEqual({});

        const eventStore = new EventStore(
            new DynamodbProvider(dynamodbConfig),
            new SNSPublisher('arn:aws:sns:us-east-1:000000000000:order-events', awsConfig, { endpointUrl: 'http://localhost:4566' }),
        );
        const event = {
            document: {
                identifier: '321'
            },
            eventType: 'PLACED',
            proposal: {
                id: '123',
                offer: 'new-offer'
            },
            version: 1,
        };

        const eventPlaced = await eventStore.getEventStream('Order', '123456').addEvent(event);

        const messageReceived = await sqs.receiveMessage({
            AttributeNames: ['All'],
            MessageAttributeNames: ['All'],
            QueueUrl: 'http://localhost:4566/000000000000/order-events-placed',
        }).promise();


        expect(messageReceived).toEqual({});
        expect(messageReceived).not.toBeUndefined();
        expect(messageReceived.Messages).not.toBeUndefined();
        expect(messageReceived.Messages).toEqual('');
        const eventReceived = JSON.parse(JSON.parse(messageReceived.Messages[0].Body).Message);

        expect(eventReceived.event.commitTimestamp).not.toBeUndefined();
        expect(eventReceived.event).toEqual(
            expect.objectContaining({
                eventType: "PLACED",
                payload: {
                    document: {
                        identifier: "321",
                    },
                    eventType: "PLACED",
                    proposal: {
                        id: "123",
                        offer: "new-offer",
                    },
                    version: 1,
                },
            })
        );
        expect(eventPlaced.commitTimestamp).not.toBeUndefined();

        expect(eventPlaced).toEqual(
            expect.objectContaining({
                eventType: "PLACED",
                payload: {
                    document: {
                        identifier: "321",
                    },
                    eventType: "PLACED",
                    proposal: {
                        id: "123",
                        offer: "new-offer",
                    },
                    version: 1,
                },
            })
        );

        const events = await eventStore.getEventStream('Order', '123456').getEvents();

        expect(events[0].payload).toEqual({
            document: {
                identifier: "321",
            },
            eventType: "PLACED",
            proposal: {
                id: "123",
                offer: "new-offer",
            },
            version: 1,
        });
        expect(events[0].sequence).toEqual(0);
    });
});