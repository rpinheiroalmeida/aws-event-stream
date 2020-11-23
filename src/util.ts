export const getEndpointUrl = () => {
    if (process.env.NODE_ENV === 'test') {
        return { endpoint: 'http://localhost:4566' };
    }
    return undefined;
};