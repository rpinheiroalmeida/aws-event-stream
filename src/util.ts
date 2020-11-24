export const getEndpointUrl = (endpoint?: string) => {
    if (process.env.NODE_ENV === 'test' && endpoint !== undefined) {
        return endpoint;
    }
    return undefined;
};