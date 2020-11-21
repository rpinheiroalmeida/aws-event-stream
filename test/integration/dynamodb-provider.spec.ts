'use strict';

jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');
import AWS = require('aws-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { DynamodbProvider, EventStore, EventStream } from '../../src';
jest.setTimeout(10000);

// tslint:disable:no-unused-expression
describe('EventStory Dynamodb Provider (Integration)', () => {
    let eventStore: EventStore;
    let ordersStream: EventStream;
    const EVENT_PAYLOAD = 'Event Data';
    const dynamodbURL = 'http://localhost:4566';
    const streamId = '1';
    const aggregation = 'orders';
    AWS.config.update({ region: 'any-region' });
    const documentClient: DocumentClient = new DynamoDB.DocumentClient({ endpoint: 'http://localhost:4566' });

    const dynamodbConfig = {
        awsConfig: {
            endpoint: dynamodbURL,
            region: 'us-east-1',
        },
        dynamodb: {
            createTable: true,
            tableName: 'events-now',
        }
    };

    beforeAll(async () => {
        eventStore = new EventStore(new DynamodbProvider(dynamodbConfig));
        ordersStream = eventStore.getEventStream(aggregation, streamId);
    });

    beforeEach(async () => {
        await truncateTable(ordersStream);
    });

    it('should be able to get event list from the event stream', async () => {
        await ordersStream.addEvent(EVENT_PAYLOAD);
        const events = await ordersStream.getEvents();

        expect(events.length).toEqual(2);
        expect(events[0].payload).toEqual(EVENT_PAYLOAD);
        expect(events[0].sequence).toEqual(0);
    });

    it('should be able to add an event to the event stream', async () => {
        const event = await ordersStream.addEvent(EVENT_PAYLOAD);

        expect(event).not.toBeNull();
        expect(event.commitTimestamp).not.toBeNull();
        expect(event.sequence).not.toBeNull();
    });

    const truncateTable = async (eventStream: EventStream) => {
        const events = await eventStream.getEvents();
        events.forEach(async event => {
            const params = {
                Key: {
                    aggregation_streamid: `${eventStream.aggregation}:${eventStream.streamId}`,
                    commitTimestamp: event.commitTimestamp,
                },
                TableName: 'events-now',
            };

            await documentClient.delete(params).promise();
        });
    };
});
