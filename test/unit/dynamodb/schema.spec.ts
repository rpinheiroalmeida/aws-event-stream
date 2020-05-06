
import AWS = require('aws-sdk');
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Config } from '../../../src/dynamodb/dynamodb-config';
import { Schema } from '../../../src/dynamodb/schema';

chai.use(sinonChai);

const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('Config', () => {

    let dynamodbStub: sinon.SinonStub;
    let createTableStub: sinon.SinonStubbedInstance<any>;
    let promiseStub: sinon.SinonStubbedInstance<any>;
    let listTablesStub: sinon.SinonStubbedInstance<any>;

    beforeEach(() => {

        createTableStub = sinon.spy((data: any): any => {
            return {
                promise: (): any => ({})
            };
        });

        promiseStub = sinon.stub();
        listTablesStub = sinon.spy((data: any): any => {
            return {
                promise: promiseStub,
            };
        });

        sinon.stub(AWS, "config").returns({ update: (): any => null });
        dynamodbStub = sinon.stub(AWS, 'DynamoDB').returns({
            createTable: createTableStub,
            listTables: listTablesStub,
        });
    });

    afterEach(() => {
        dynamodbStub.restore();
    });

    it('should create table with read and write default capacity', async () => {
        const dynamoDBConfig: Config = {
            awsConfig: { region: 'any region' },
            dynamodb: {
                tableName: 'events',
            }
        };
        promiseStub.returns({ TableNames: ['table_a', 'table_b', 'table_c'] });

        await new Schema(dynamoDBConfig).createTables();

        expect(createTableStub).to.have.been.calledOnce;
        expect(createTableStub).to.have.been.calledWith({
            AttributeDefinitions: [{ AttributeName: "aggregation_streamid", AttributeType: "S" }, { AttributeName: "commitTimestamp", AttributeType: "N" }],
            KeySchema: [{ AttributeName: "aggregation_streamid", KeyType: "HASH" }, { AttributeName: "commitTimestamp", KeyType: "RANGE" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
            TableName: "events"
        });
        expect(listTablesStub).to.have.been.calledOnce;
    });

    it('should create table', async () => {
        const dynamoDBConfig: Config = {
            awsConfig: { region: 'any region' },
            dynamodb: {
                readCapacityUnit: 5,
                tableName: 'events',
                writeCapacityUnit: 5,
            }
        };
        promiseStub.returns({ TableNames: ['table_a', 'table_b', 'table_c'] });

        await new Schema(dynamoDBConfig).createTables();

        expect(createTableStub).to.have.been.calledOnce;
        expect(createTableStub).to.have.been.calledWith({
            AttributeDefinitions: [{ AttributeName: "aggregation_streamid", AttributeType: "S" }, { AttributeName: "commitTimestamp", AttributeType: "N" }],
            KeySchema: [{ AttributeName: "aggregation_streamid", KeyType: "HASH" }, { AttributeName: "commitTimestamp", KeyType: "RANGE" }],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
            TableName: "events"
        });
        expect(listTablesStub).to.have.been.calledOnce;
    });

    it('should not create table', async () => {
        const dynamoDBConfig: Config = {
            awsConfig: { region: 'any region' },
            dynamodb: {
                tableName: 'events',
            }
        };
        promiseStub.returns({ TableNames: ['events', 'table_a', 'table_b', 'table_c'] });

        await new Schema(dynamoDBConfig).createTables();

        expect(createTableStub).not.have.been.called;
        expect(listTablesStub).to.have.been.calledOnce;
    });
});