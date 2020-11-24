import { getEndpointUrl } from '../../src/util';

describe('util', () => {
    describe('getEndpointUrl', () => {
        it('should return localhost when NODE_ENV is test', () => {
            process.env.NODE_ENV = 'test';

            expect(getEndpointUrl('http://localhost:4566')).toEqual('http://localhost:4566');
        });

        it('should return undefined when NODE_ENV is prd', () => {
            process.env.NODE_ENV = 'prd';

            expect(getEndpointUrl()).toBeUndefined();
        });
    });
});