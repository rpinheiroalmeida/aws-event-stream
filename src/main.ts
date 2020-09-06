
// import { DynamodbProvider, EventStore } from ".";

import { Config, DynamodbProvider } from ".";
import { EventStore } from "./event-store";
// import { EventStore } from './event-store';
import { SNSPublisher } from "./publisher/sns";

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
const awsConfig = { region: 'us-east-1' };

const dynamodbConfig = {
    awsConfig: awsConfig,
    dynamodb: {
        tableName: 'boleto-events'
    }
} as Config;

const eventStore = new EventStore(
    new DynamodbProvider(dynamodbConfig),
    new SNSPublisher('arn:aws:sns:us-east-1:773374622004:BOLETO_POC', awsConfig),
);

const orderStream = eventStore.getEventStream('BOLETO', '21813f20-957d-4d5d-a908-');
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
