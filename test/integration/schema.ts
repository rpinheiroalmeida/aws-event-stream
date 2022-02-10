import AWS = require('aws-sdk');
import DynamoDB = require("aws-sdk/clients/dynamodb");
import { Config } from '../../src/dynamodb/dynamodb-config';

export class Schema {
    private dynamoDB: DynamoDB;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        AWS.config.update(config.awsConfig);

        this.dynamoDB = new AWS.DynamoDB();
    }

    public async createTables(): Promise<void> {
        const tableExists = await this.exists();
        if (!tableExists) {
            await this.dynamoDB.createTable(this.eventsScheme()).promise();
        }
    }

    private async exists(): Promise<boolean> {
        const tables = await this.dynamoDB.listTables({}).promise();

        return tables.TableNames.filter(tableName => {
            return tableName === this.config.dynamodb.tableName;
        }).length === 1;
    }

    private eventsScheme() {
        return {
            AttributeDefinitions: [
                {
                    AttributeName: "aggregation_streamid",
                    AttributeType: "S"
                },
                {
                    AttributeName: "commitTimestamp",
                    AttributeType: "N"
                }
            ],
            KeySchema: [
                {
                    AttributeName: "aggregation_streamid",
                    KeyType: "HASH",
                },
                {
                    AttributeName: "commitTimestamp",
                    KeyType: "RANGE"
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: this.config.dynamodb.readCapacityUnit || 1,
                WriteCapacityUnits: this.config.dynamodb.writeCapacityUnit || 1,
            },
            TableName: this.config.dynamodb.tableName,
        };
    }
}