'use strict';

import { Event } from './event';

export const eventMerge = (events: Array<Event>) => {
    const eventTypes = events.map((event) => {
        const eventType = event.payload.eventType || event.eventType;
        return eventType;
    });

    const reduce = (result: any, entry: any): any => {
        entry.eventType = undefined;
        return { ...result, ...entry };
    };

    const history = (events.reduceRight(reduce) as any);
    delete history.eventType;
    history.eventTypes = eventTypes;
    return history;
};