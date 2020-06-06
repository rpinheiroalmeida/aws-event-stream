import { Message } from "@eventstore.net/event.store";

export interface MessageType extends Message {
    eventType: string;
}
