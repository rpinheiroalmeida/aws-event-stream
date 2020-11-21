
import { DynamoDB } from './aws-sdk/clients/dynamodb';
import { SQS } from './aws-sdk/sqs';

export const config = {
    update: jest.fn()
};

// export const SQS = SQS;
export { SQS };
export { DynamoDB };
