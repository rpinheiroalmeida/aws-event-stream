import { HTTPOptions } from "aws-sdk";
import { AWSConfig } from "../aws/config";

export interface Config {
    readonly awsConfig: AWSConfig;
    readonly dynamodb: {
        tableName: string;
        createTable?: boolean;
        readCapacityUnit?: number;
        writeCapacityUnit?: number;
        endpointUrl?: string;
        maxRetries?: number;
        httpOptions?: HTTPOptions;
        ttl?: number;
        conditionalExpression?: string;
    };
}