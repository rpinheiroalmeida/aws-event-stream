'use strict';

import { DynamoDB } from 'aws-sdk';
import AWS = require('aws-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as chai from 'chai';
import { DynamodbProvider, EventStore, EventStream } from '../../../src';
import '../../unidade/dynamodb/node_modules/mocha';

const expect = chai.expect;
// tslint:disable:no-unused-expression
describe('EventStory Dynamodb Provider (Integration)', () => {
    let eventStore: EventStore;
    let ordersStream: EventStream;
    const EVENT_PAYLOAD = 'Event Data';
    const dynamodbURL = 'http://localhost:8000';
    const streamId = '1';
    const aggregation = 'orders';
    AWS.config.update({ region: 'any-region' });
    const documentClient: DocumentClient = new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8000' });

    const dynamodbConfig = {
        awsConfig: {
            endpoint: dynamodbURL,
            region: 'any-region',
        },
        dynamodb: {
            createTable: true,
            tableName: 'events',
        }
    };

    before(async () => {
        eventStore = new EventStore(new DynamodbProvider(dynamodbConfig));
        ordersStream = eventStore.getEventStream(aggregation, streamId);
    });

    beforeEach(async () => {
        await truncateTable(ordersStream);
    });

    it('should be able to get event list from the event stream', async () => {
        await ordersStream.addEvent(EVENT_PAYLOAD);
        const events = await ordersStream.getEvents();

        expect(events.length).to.equal(1);
        expect(events[0].payload).to.equal(EVENT_PAYLOAD);
        expect(events[0].sequence).to.equal(0);
    });

    it('should be able to add an event to the event stream', async () => {
        const event = await ordersStream.addEvent(EVENT_PAYLOAD);

        expect(event).to.be.not.null;
        expect(event.commitTimestamp).to.be.not.null;
        expect(event.sequence).to.be.not.null;
    });

    const truncateTable = async (eventStream: EventStream) => {
        const events = await eventStream.getEvents();
        events.forEach(async event => {
            const params = {
                Key: {
                    aggregation_streamid: `${eventStream.aggregation}:${eventStream.streamId}`,
                    commitTimestamp: event.commitTimestamp,
                },
                TableName: 'events',
            };

            await documentClient.delete(params).promise();
        });
    };
});
