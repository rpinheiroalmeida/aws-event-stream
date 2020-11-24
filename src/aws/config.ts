'use strict';

export interface AWSConfig {
    region: string;
    apiVersion?: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}
