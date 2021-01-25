'use strict';

export const getEndpointUrl = (endpoint?: string) => {
    if (endpoint !== undefined) {
        return endpoint;
    }
    return undefined;
};
