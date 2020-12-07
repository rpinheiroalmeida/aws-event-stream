/**
 * An Event in the stream of events
 */
export interface Event {
    /**
     * The event payload. The payload can be any data associated with the event
     */
    payload: any;
    /**
     * The time where the event was persisted in the {@link EventStream}
     */
    commitTimestamp?: number;
    /**
     * The sequence order for the event in the {@link EventStream}
     */
    sequence?: number;

    type?: string;

    id?: string;
}

export interface EventType extends Event {
    /**
     * The type of event
     */
    eventType: string;
}
