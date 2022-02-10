'use strict';

import { awsSdkPromiseResponse, DocumentClient } from '../../../__mocks__/aws-sdk/clients/dynamodb';
import { Config, DynamodbProvider } from '../../../src';
import { Stream } from '../../../src/model/stream';

jest.useFakeTimers();
describe('EventStory Dynamodb Provider', () => {

    const NOW = new Date();


    const dynamodbConfig = {
        awsConfig: {
            region: 'us-east-1',
        },
        dynamodb: {
            tableName: 'events',
        },
    } as Config;

    const eventItemReturned = {
        aggregation_streamid: 'orders:1',
        commitTimestamp: NOW.getTime(),
        eventType: 'SENT',
        payload: 'EVENT PAYLOAD',
        stream: { aggregation: 'orders', id: '1' }
    };

    const db = new DocumentClient();

    beforeEach(() => {
        db.get.mockClear();
        db.put.mockClear();
        db.query.mockClear();
    });

    afterAll(() => {
        jest.useRealTimers();
    })

    describe('addEvent', () => {
        describe('should be able to add an Event to the Event Stream', () => {
            it('when the eventType property is present in the Event', async () => {
                const dynamodbProvider = new DynamodbProvider(dynamodbConfig);
                await dynamodbProvider.addEvent({ aggregation: 'orders', id: '1' }, { text: 'EVENT PAYLOAD', eventType: 'SENT' });
                expect(db.put).toHaveBeenLastCalledWith(
                    {
                        Item: {
                            aggregation_streamid: 'orders:1',
                            commitTimestamp: NOW.getTime(),
                            eventType: 'SENT',
                            payload: {
                                eventType: 'SENT',
                                text: 'EVENT PAYLOAD'
                            },
                            stream: {
                                aggregation: 'orders',
                                id: '1',
                            },
                        },
                        TableName: 'events',
                    }
                );
            });

            it('when the ttl property is settled in the table', async () => {
                const dynamodbConfig = {
                    awsConfig: {
                        region: 'us-east-1',
                    },
                    dynamodb: {
                        tableName: 'events',
                        ttl: 10,
                    },
                } as Config;
                const dynamodbProvider = new DynamodbProvider(dynamodbConfig);
                await dynamodbProvider.addEvent({ aggregation: 'orders', id: '1' }, { text: 'EVENT PAYLOAD', eventType: 'SENT' });
                expect(db.put).toHaveBeenLastCalledWith(
                    {
                        Item: {
                            aggregation_streamid: 'orders:1',
                            commitTimestamp: NOW.getTime(),
                            eventType: 'SENT',
                            ttl: Math.floor(NOW.getTime() / 1000) + 10,
                            payload: {
                                eventType: 'SENT',
                                text: 'EVENT PAYLOAD'
                            },
                            stream: {
                                aggregation: 'orders',
                                id: '1',
                            },
                        },
                        TableName: 'events',
                    }
                );
            });

            it('when table events exists', async () => {

                const dynamodbProvider = new DynamodbProvider(dynamodbConfig);
                await dynamodbProvider.addEvent({ aggregation: 'orders', id: '1' }, 'EVENT PAYLOAD');
                expect(db.put).toHaveBeenLastCalledWith(
                    {
                        Item: {
                            aggregation_streamid: 'orders:1',
                            commitTimestamp: NOW.getTime(),
                            payload: 'EVENT PAYLOAD',
                            stream: {
                                aggregation: 'orders',
                                id: '1',
                            },
                        },
                        TableName: 'events',
                    }
                );
            });

            it('when table does not exist', async () => {
                const config = {
                    awsConfig: {
                        region: 'us-east-1',
                    },
                    dynamodb: {
                        createTable: true,
                        tableName: 'events',
                    },
                } as Config;


                const dynamodbProvider: any = new DynamodbProvider(config);
                const eventAdded = await dynamodbProvider.addEvent({ aggregation: 'orders', id: '1' }, { payload: 'EVENT PAYLOAD', eventType: 'SENT' });

                expect(eventAdded).toEqual({
                    commitTimestamp: NOW.getTime(),
                    eventType: 'SENT',
                    payload: 'EVENT PAYLOAD',
                });
                expect(db.put).toHaveBeenCalledTimes(1);
                expect(db.put).toHaveBeenCalledWith(
                    {
                        Item: {
                            aggregation_streamid: 'orders:1',
                            commitTimestamp: NOW.getTime(),
                            eventType: 'SENT',
                            payload: {
                                eventType: 'SENT',
                                payload: 'EVENT PAYLOAD',
                            },
                            stream: {
                                aggregation: 'orders',
                                id: '1',
                            },
                        },
                        TableName: 'events',
                    }
                );
            });
        });



    });

    describe('getEvents', () => {
        it('should be able to get the all the events when eventType does not exist', async () => {
            const eventItemReturnedWithoutEventType = { ...eventItemReturned };
            eventItemReturnedWithoutEventType.eventType = undefined;
            awsSdkPromiseResponse.mockReturnValue(Promise.resolve({ Items: [eventItemReturnedWithoutEventType] }));

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: 'orders', id: '1' } as Stream);

            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), payload: 'EVENT PAYLOAD', sequence: 0 }]
            );

            expect(db.query).toBeCalledWith({
                ExpressionAttributeValues: {
                    ':key': 'orders:1',
                },
                KeyConditionExpression: 'aggregation_streamid = :key',
                ScanIndexForward: false,
                TableName: 'events',
            });
        });

        it('should be able to get the all the events', async () => {

            awsSdkPromiseResponse.mockReturnValue(Promise.resolve({ Items: [eventItemReturned] }));

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: 'orders', id: '1' } as Stream);

            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: 'EVENT PAYLOAD', sequence: 0 }]
            );

            expect(db.query).toBeCalledWith({
                ExpressionAttributeValues: {
                    ':key': 'orders:1',
                },
                KeyConditionExpression: 'aggregation_streamid = :key',
                ScanIndexForward: false,
                TableName: 'events',
            });
        });

        it('should be able to get events paginated', async () => {
            awsSdkPromiseResponse.mockReturnValue(Promise.resolve({
                Items: [eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned]
            }));

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: "orders", id: "1" } as Stream, 1, 4);

            expect(events.length).toEqual(4);
            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 1 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 2 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 3 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 4 }]
            );
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                {
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    Limit: 4,
                    ScanIndexForward: false,
                    TableName: "events",
                }
            );
        });

        it('should be able to get the all the events when page is 0', async () => {

            awsSdkPromiseResponse.mockReturnValue(Promise.resolve({ Items: [eventItemReturned] }));

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: 'orders', id: '1' } as Stream,
                0, 0);

            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: 'EVENT PAYLOAD', sequence: 0 }]
            );

            expect(db.query).toBeCalledWith({
                ExpressionAttributeValues: {
                    ':key': 'orders:1',
                },
                KeyConditionExpression: 'aggregation_streamid = :key',
                ScanIndexForward: false,
                TableName: 'events',
            });
        });

        it('should be able to get events paginated elements from second page', async () => {
            awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve(
                {
                    Items: [eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned,
                        eventItemReturned, eventItemReturned, eventItemReturned],

                }));
            expect.assertions(10);


            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: "orders", id: "1" } as Stream, 2, 2);

            expect(events.length).toEqual(2);
            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 2 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 3 }],
            );
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                {
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    Limit: 2,
                    ScanIndexForward: false,
                    TableName: "events",
                }
            );

            awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve(
                {
                    Items: [eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned, eventItemReturned,
                        eventItemReturned, eventItemReturned, eventItemReturned],
                    LastEvaluatedKey: 2,
                }));

            const eventsPage3 = await dynamodbProvider.getEvents({ aggregation: "orders", id: "1" } as Stream, 5, 5);

            expect(eventsPage3.length).toEqual(5);
            expect(eventsPage3).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 5 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 6 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 7 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 8 },
                { commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 9 },],
            );
            expect(db.query).toHaveBeenCalledTimes(3);
            expect(db.query).toHaveBeenNthCalledWith(1,
                {
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    Limit: 2,
                    ScanIndexForward: false,
                    TableName: "events",
                }
            );
            expect(db.query).toHaveBeenNthCalledWith(2,
                {
                    ExclusiveStartKey: 2,
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    Limit: 5,
                    ScanIndexForward: false,
                    TableName: "events",
                }
            );
            expect(db.query).toHaveBeenNthCalledWith(3,
                {
                    ExclusiveStartKey: 2,
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    Limit: 5,
                    ScanIndexForward: false,
                    TableName: "events",
                }
            );
        });

        it('should be able to get all events when table does not exist', async () => {
            awsSdkPromiseResponse.mockReturnValue(Promise.resolve({
                Items: [eventItemReturned]
            }));

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);
            const events = await dynamodbProvider.getEvents({ aggregation: "orders", id: "1" } as Stream);

            expect(events).toEqual(
                [{ commitTimestamp: NOW.getTime(), eventType: 'SENT', payload: "EVENT PAYLOAD", sequence: 0 }]
            );
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                {
                    ExpressionAttributeValues: { ':key': "orders:1" },
                    KeyConditionExpression: "aggregation_streamid = :key",
                    ScanIndexForward: false,
                    TableName: "events"
                }
            );
        });
    });

    describe('getAggregations', () => {
        it('should not be implemented', async () => {
            expect.assertions(1);

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);

            await expect(async () => await dynamodbProvider.getAggregations()).rejects.toThrow('Method not supported');
        });

    });

    describe('getStreams', () => {
        it('should not be implemented', async () => {
            expect.assertions(1);

            const dynamodbProvider: DynamodbProvider = new DynamodbProvider(dynamodbConfig);

            await expect(async () => await dynamodbProvider.getStreams('')).rejects.toThrow('Method not supported');
        });

    });
});

