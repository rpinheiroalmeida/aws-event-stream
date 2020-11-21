export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));

const getFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const putFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const queryFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class DocumentClient {
    public get = getFn;
    public put = putFn;
    public query = queryFn;
}

const createTableFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
const listTablesFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class DynamoDB {
    public createTable = createTableFn;
    public listTables = listTablesFn;
}