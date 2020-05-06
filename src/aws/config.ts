'use strict';

export interface AWSConfig {
    region: string;
    endpoint?: string;
    apiVersion?: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}
