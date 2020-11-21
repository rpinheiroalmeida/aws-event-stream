
'use strict';

import { DynamoDB } from '../../../__mocks__/aws-sdk';
import { awsSdkPromiseResponse } from '../../../__mocks__/aws-sdk/clients/dynamodb';
import { Config } from '../../../src/dynamodb/dynamodb-config';
import { Schema } from '../../../src/dynamodb/schema';


describe('Schema', () => {

    const dynamodb = new DynamoDB();

    beforeEach(() => {
        dynamodb.createTable.mockClear();
        dynamodb.listTables.mockClear();
        awsSdkPromiseResponse.mockClear();
    });

    it('should create table with read and write default capacity', async () => {
        const dynamoDBConfig: Config = {
            awsConfig: { region: 'any region' },
            dynamodb: {
                tableName: 'events',
            }
        };
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ TableNames: ['table_a', 'table_b', 'table_c'] }));
        expect.assertions(4);

        await new Schema(dynamoDBConfig).createTables();

        expect(dynamodb.createTable).toHaveBeenCalledTimes(1);
        expect(dynamodb.createTable).toHaveBeenCalledWith({
            AttributeDefinitions: [{ AttributeName: "aggregation_streamid", AttributeType: "S" }, { AttributeName: "commitTimestamp", AttributeType: "N" }],
            KeySchema: [{ AttributeName: "aggregation_streamid", KeyType: "HASH" }, { AttributeName: "commitTimestamp", KeyType: "RANGE" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
            TableName: "events"
        });
        expect(dynamodb.listTables).toHaveBeenCalledTimes(1);
        expect(dynamodb.listTables).toHaveBeenCalledWith({});
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
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ TableNames: ['table_a', 'table_b', 'table_c'] }));
        expect.assertions(4);

        await new Schema(dynamoDBConfig).createTables();

        expect(dynamodb.createTable).toHaveBeenCalledTimes(1);
        expect(dynamodb.createTable).toHaveBeenCalledWith({
            AttributeDefinitions: [{ AttributeName: "aggregation_streamid", AttributeType: "S" }, { AttributeName: "commitTimestamp", AttributeType: "N" }],
            KeySchema: [{ AttributeName: "aggregation_streamid", KeyType: "HASH" }, { AttributeName: "commitTimestamp", KeyType: "RANGE" }],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
            TableName: "events"
        });
        expect(dynamodb.listTables).toHaveBeenCalledTimes(1);
        expect(dynamodb.listTables).toHaveBeenCalledWith({});
    });

    it('should not create table', async () => {
        const dynamoDBConfig: Config = {
            awsConfig: { region: 'any region' },
            dynamodb: {
                tableName: 'events',
            }
        };
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ TableNames: ['events', 'table_a', 'table_b', 'table_c'] }));
        expect.assertions(3);

        await new Schema(dynamoDBConfig).createTables();

        expect(dynamodb.createTable).not.toHaveBeenCalled();
        expect(dynamodb.listTables).toHaveBeenCalledTimes(1);
        expect(dynamodb.listTables).toHaveBeenCalledWith({});
    });
});