jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');
jest.setTimeout(100000);
import { SQS } from "aws-sdk";
import { Config, DynamodbProvider, EventStore } from "../../src";
import { SNSPublisher } from "../../src/publisher/sns";

describe.only('EventStream', () => {

    const awsConfign = {
        credentials: {
            accessKeyId: '123456-localstack',
            secretAccessKey: '123456-localstack',
        },
        region: "us-east-1"
    };

    const dynamodbConfig: Config = {
        awsConfig: awsConfign,
        dynamodb: {
            endpointUrl: 'http://localhost:4566',
            tableName: 'order-events',
        },
    };

    const sqs = new SQS({
        endpoint: 'http://localhost:4566',
        region: 'us-east-1',
    });

    it('publish a message', async () => {
        const eventStore = new EventStore(
            new DynamodbProvider(dynamodbConfig),
            new SNSPublisher('arn:aws:sns:us-east-1:000000000000:order-events', { region: 'us-east-1' }, { endpointUrl: 'http://localhost:4566' }),
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