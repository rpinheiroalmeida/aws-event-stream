import { Event } from "@eventstore.net/event.store";

export interface EventType extends Event {
    /**
     * The type of event
     */
    eventType: string;
}
