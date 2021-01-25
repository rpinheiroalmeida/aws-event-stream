import { eventMerge } from '../../../src/model/event-util';

describe('util', () => {

    describe('eventMerge', () => {
        it('when there is just one event', () => {
            const eventSent = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'SENT',
                    amount: 123,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 0,
            };

            const history = eventMerge([eventSent]);
            expect(history).toEqual(
                {
                    aggregation_streamid: 'orders:1',
                    stream: { aggregation: 'orders', id: '1' },
                    eventTypes: ['SENT'],
                    payload: {
                        eventType: 'SENT',
                        amount: 123,
                    },
                    sequence: 0,
                }
            );
        });

        it('when there is more than one event', () => {
            const eventSent = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'SENT',
                    amount: 123,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 1,
            };

            const eventPaied = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'PAID',
                    amount: 456,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 0,
            };

            const history = eventMerge([eventPaied, eventSent]);
            expect(history).toEqual(
                {
                    aggregation_streamid: 'orders:1',
                    stream: { aggregation: 'orders', id: '1' },
                    eventTypes: ['PAID', 'SENT'],
                    payload: {
                        eventType: 'PAID',
                        amount: 456,
                    },
                    sequence: 0,
                }
            );
        });

        it('when there is more three event', () => {
            const eventSent = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'SENT',
                    amount: 123,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 2,
            };

            const eventPaied = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'PAID',
                    amount: 456,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 1,
            };

            const eventRejected = {
                aggregation_streamid: 'orders:1',
                payload: {
                    eventType: 'REJECTED',
                    amount: 789,
                },
                stream: { aggregation: 'orders', id: '1' },
                sequence: 0,
            };

            const history = eventMerge([eventRejected, eventPaied, eventSent]);
            expect(history).toEqual(
                {
                    aggregation_streamid: 'orders:1',
                    stream: { aggregation: 'orders', id: '1' },
                    eventTypes: ['REJECTED', 'PAID', 'SENT'],
                    payload: {
                        eventType: 'REJECTED',
                        amount: 789,
                    },
                    sequence: 0,
                }
            );
        });
    });
});
