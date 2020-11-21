export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));

const sendMessageFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class SQS {
    public sendMessage = sendMessageFn;
}
