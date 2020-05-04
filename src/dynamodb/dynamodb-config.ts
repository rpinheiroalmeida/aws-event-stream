import { AWSConfig } from "../aws/config";

export interface Config {
    readonly awsConfig: AWSConfig;
    readonly dynamodb: {
        tableName: string;
        readCapacityUnit?: number;
        writeCapacityUnit?: number;
    };
}