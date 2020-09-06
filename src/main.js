"use strict";
// import { DynamodbProvider, EventStore } from ".";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var event_store_1 = require("./event-store");
// import { EventStore } from './event-store';
var sns_1 = require("./publisher/sns");
// import { Config } from "./dynamodb/dynamodb-config";
// import { SNSPublisher } from "./publisher/sns";
// tslint: disable: no - unused - expression;
// function createStream(stream: EventStream) {
//     for (let i = 1; i < 50; i++) {
//         stream.addEvent({ eventType: 'init', value: i });
//     }
//     return stream;
// }
// const awsConfig = { region: 'us-east-1', endpoint: 'http://localhost:8000' };
var awsConfig = { region: 'us-east-1' };
var dynamodbConfig = {
    awsConfig: awsConfig,
    dynamodb: {
        tableName: 'boleto-events'
    }
};
var eventStore = new event_store_1.EventStore(new _1.DynamodbProvider(dynamodbConfig), new sns_1.SNSPublisher('arn:aws:sns:us-east-1:773374622004:BOLETO_POC', awsConfig));
var orderStream = eventStore.getEventStream('BOLETO', '21813f20-957d-4d5d-a908-');
orderStream.addEvent({ data: 'any data', eventType: 'REGISTERED_BOLETO' });
// orderStream.getEvents().then(data => {
//     console.log(data);
// });
// const message = {
//     event: {
//         commitTimestamp: 1234567,
//         payload: { message: 'anytging' },
//     },
//     stream: {
//         aggregation: 'ORDER',
//         id: '123',
//     }
// };
// const snsPublisher = new SNSPublisher('arn:aws:sns:us-east-1:773374622004:TEST_TOPIC', awsConfig);
// snsPublisher.publish(message);
// snsPublisher.subscribe('ORDER', undefined).then(result => console.log(`Result = ${result}`));
