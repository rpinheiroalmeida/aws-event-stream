'use strict';

import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
chai.use(sinonChai);
import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { Stream } from '../../../src/model/stream';
import { DynamodbProvider } from '../../../src/provider/dynamodb';

const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('EventStory Dynamodb Provider', () => {

    let documentClientStub: sinon.SinonStub;
    let putStub: sinon.SinonStubbedInstance<any>;
    let queryStub: sinon.SinonStubbedInstance<any>;
    let scanStub: sinon.SinonStubbedInstance<any>;
    let promiseStub: sinon.SinonStub;

    let clock: sinon.SinonFakeTimers;
    const now = new Date();

    beforeEach(() => {

        clock = sinon.useFakeTimers(now.getTime());

        putStub = sinon.spy((data: any): any => {
            return {
                promise: (): any => ({})
            };
        });

        promiseStub = sinon.stub();
        queryStub = sinon.spy((data: any): any => {
            return {
                promise: promiseStub,
            };
        });

        scanStub = sinon.spy((data: any): any => {
            return {
                promise: promiseStub,
            };
        });

        sinon.stub(AWS, "config").returns({ update: (): any => null });
        documentClientStub = sinon.stub(DynamoDB, 'DocumentClient').returns({
            put: putStub,
            query: queryStub,
            scan: scanStub,
        });
    });

    afterEach(() => {
        clock.restore();
        documentClientStub.restore();
    });

    const eventItem = {
        aggregation_streamid: "orders:1",
        commitTimestamp: now.getTime(),
        payload: "EVENT PAYLOAD",
        stream: { aggregation: "orders", id: "1" }
    };

    it('should be able to add an Event to the Event Stream', async () => {
        const dynamodbProvider: any = new DynamodbProvider({ region: 'any region' });
        await dynamodbProvider.addEvent({ aggregation: 'orders', id: '1' }, 'EVENT PAYLOAD');

        expect(putStub).to.have.been.calledOnce;

        expect(putStub.getCall(0)).to.have.been.calledWithExactly(
            {
                Item: eventItem,
                TableName: "events"
            }
        );
    });


    it('should be able to ask dynamodb the events', async () => {
        promiseStub.resolves({
            Items: [eventItem]
        });

        const dynamodbProvider: DynamodbProvider = new DynamodbProvider({ region: 'any region' });
        const events = await dynamodbProvider.getEvents({ aggregation: "orders", id: "1" } as Stream);

        expect(events).to.eql(
            [{ commitTimestamp: now.getTime(), payload: "EVENT PAYLOAD", sequence: 1 }]
        );
        expect(queryStub).to.have.been.calledOnce;
        expect(queryStub).to.have.been.calledWith(
            {
                ExpressionAttributeValues: { ':key': "orders:1" },
                KeyConditionExpression: "aggregation_streamid = :key",
                TableName: "events"
            }
        );
    });

});
