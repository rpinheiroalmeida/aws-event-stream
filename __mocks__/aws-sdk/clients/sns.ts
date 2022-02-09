export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));

const publishFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
const subscribeFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
const unsubscribeFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
export class SNS {
    public publish = publishFn;
    public subscribe = subscribeFn;
    public unsubscribe = unsubscribeFn;
}
