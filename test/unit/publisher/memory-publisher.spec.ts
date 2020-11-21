'use strict';

import { InMemoryPublisher, Message } from '../../../src';

describe('EventStory Memory Publisher', () => {
    const EVENT_PAYLOAD = 'Event Data';
    let memoryPublisher: InMemoryPublisher;

    beforeEach(() => {
        memoryPublisher = new InMemoryPublisher();
    });

    it('should be able to publish messages to listeners', async () => {

        const message: Message = {
            event: {
                commitTimestamp: 123,
                payload: EVENT_PAYLOAD,
                sequence: 2
            },
            stream: {
                aggregation: 'orders',
                id: '1'
            }
        };

        const subscriberStub = jest.fn();
        await memoryPublisher.subscribe('orders', subscriberStub);
        const status = await memoryPublisher.publish(message);

        expect(subscriberStub).toHaveBeenCalledWith(message);
        expect(status).toBeTruthy();
    });

    it('should be able to notify multiple listeners', async () => {
        const message: Message = {
            event: {
                commitTimestamp: 123,
                payload: EVENT_PAYLOAD,
                sequence: 2
            },
            stream: {
                aggregation: 'orders',
                id: '1'
            }
        };

        const subscriberStub = jest.fn();
        const subscriber2Stub = jest.fn();
        await memoryPublisher.subscribe('orders', subscriberStub);
        await memoryPublisher.subscribe('orders', subscriber2Stub);
        const status = await memoryPublisher.publish(message);

        expect(subscriberStub).toHaveBeenCalledWith(message);
        expect(subscriber2Stub).toHaveBeenCalledWith(message);
        expect(status).toBeTruthy();
    });

    it('should be able to check if a message was published', async () => {
        const message: Message = {
            event: {
                commitTimestamp: 123,
                payload: EVENT_PAYLOAD,
                sequence: 2
            },
            stream: {
                aggregation: 'orders',
                id: '1'
            }
        };

        const status = await memoryPublisher.publish(message);

        expect(status).toBeFalsy();
    });
});
