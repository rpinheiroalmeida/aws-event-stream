import { AWSConfig } from "../aws/config";

export interface Config {
    readonly awsConfig: AWSConfig;
    readonly dynamodb: {
        tableName: string;
        createTable?: boolean;
        readCapacityUnit?: number;
        writeCapacityUnit?: number;
        endpointUrl?: string;
    };
}