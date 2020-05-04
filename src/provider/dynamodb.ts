'use strict';

import { DynamoDB } from 'aws-sdk';
import AWS = require('aws-sdk');
import { DocumentClient, ItemList, QueryOutput } from 'aws-sdk/clients/dynamodb';
import * as _ from 'lodash';
import { AWSConfig } from '../aws/config';
import { Event } from '../model/event';
import { Stream } from '../model/stream';
import { PersistenceProvider } from './provider';

/**
 * A Persistence Provider that handle all the data in Dynamodb.
 */
export class DynamodbProvider implements PersistenceProvider {
    private documentClient: DocumentClient;

    constructor(awsConfig: AWSConfig) {
        AWS.config.update(awsConfig);

        this.documentClient = new DynamoDB.DocumentClient();
    }

    public async addEvent(stream: Stream, data: any): Promise<Event> {
        const now = new Date();
        const commitTimestamp = now.getTime();
        const event = {
            aggregation_streamid: `${this.getKey(stream)}`,
            commitTimestamp: commitTimestamp,
            payload: data,
            stream: stream
        };
        const record = {
            Item: event,
            TableName: 'events',
        };

        await this.documentClient.put(record).promise();

        return {
            commitTimestamp: commitTimestamp,
            payload: data,
        } as Event;
    }


    public async getEvents(stream: Stream, offset: number = 0, limit: number = -1): Promise<Array<Event>> {
        let exclusiveStartKey: any;
        let filter = {
            ExpressionAttributeValues: { ':key': this.getKey(stream) },
            KeyConditionExpression: 'aggregation_streamid = :key',
            ScanIndexForward: false,
            TableName: 'events',
        };
        const pageSize = offset + limit;
        if (pageSize > 0) {
            filter = _.merge(filter, { Limit: limit });
        }

        let items: ItemList = [];
        do {
            if (exclusiveStartKey) {
                filter = _.merge(filter, { ExclusiveStartKey: exclusiveStartKey });
            }
            const queryOutput: QueryOutput = (await this.documentClient.query(filter).promise());
            exclusiveStartKey = queryOutput.LastEvaluatedKey || null;
            items = items.concat(queryOutput.Items);
        } while (items.length < pageSize);

        const events = items.map((data, index) => {
            return {
                commitTimestamp: data.commitTimestamp,
                payload: data.payload,
                sequence: index,
            } as Event;
        });
        return pageSize === -1 ? events.slice(offset) : events.slice(offset, pageSize);
    }

    public async getAggregations(offset: number = 0, limit: number = -1): Promise<Array<string>> {
        throw new Error('Method not supported');
    }

    public async getStreams(aggregation: string, offset: number = 0, limit: number = -1): Promise<Array<string>> {
        throw new Error('Method not supported');
    }

    private getKey(stream: Stream): string {
        return `${stream.aggregation}:${stream.id}`;
    }
}
