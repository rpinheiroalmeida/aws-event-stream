import { Message } from "@eventstore.net/event.store";
import { EventType } from "./event";

export interface MessageType extends Message {
    event: EventType;
}
