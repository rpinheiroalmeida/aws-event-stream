'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = require("aws-sdk");
var AWS = require("aws-sdk");
var _ = require("lodash");
var schema_1 = require("../dynamodb/schema");
/**
 * A Persistence Provider that handle all the data in Dynamodb.
 */
var DynamodbProvider = /** @class */ (function () {
    function DynamodbProvider(config) {
        this.config = config;
        AWS.config.update(config.awsConfig);
        this.documentClient = new aws_sdk_1.DynamoDB.DocumentClient({ convertEmptyValues: true });
        this.schema = new schema_1.Schema(this.config);
    }
    DynamodbProvider.prototype.addEvent = function (stream, data) {
        return __awaiter(this, void 0, void 0, function () {
            var now, commitTimestamp, event, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureTables()];
                    case 1:
                        _a.sent();
                        now = new Date();
                        commitTimestamp = now.getTime();
                        event = {
                            aggregation_streamid: "" + this.getKey(stream),
                            commitTimestamp: commitTimestamp,
                            payload: data,
                            stream: stream
                        };
                        record = {
                            Item: event,
                            TableName: this.config.dynamodb.tableName,
                        };
                        return [4 /*yield*/, this.documentClient.put(record).promise()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                commitTimestamp: commitTimestamp,
                                eventType: data.eventType,
                                payload: data.payload,
                            }];
                }
            });
        });
    };
    DynamodbProvider.prototype.getEvents = function (stream, offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = -1; }
        return __awaiter(this, void 0, void 0, function () {
            var exclusiveStartKey, filter, pageSize, items, queryOutput, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureTables()];
                    case 1:
                        _a.sent();
                        filter = {
                            ExpressionAttributeValues: { ':key': this.getKey(stream) },
                            KeyConditionExpression: 'aggregation_streamid = :key',
                            ScanIndexForward: false,
                            TableName: this.config.dynamodb.tableName,
                        };
                        pageSize = offset + limit;
                        if (pageSize > 0) {
                            filter = _.merge(filter, { Limit: limit });
                        }
                        items = [];
                        _a.label = 2;
                    case 2:
                        if (exclusiveStartKey) {
                            filter = _.merge(filter, { ExclusiveStartKey: exclusiveStartKey });
                        }
                        return [4 /*yield*/, this.documentClient.query(filter).promise()];
                    case 3:
                        queryOutput = (_a.sent());
                        exclusiveStartKey = queryOutput.LastEvaluatedKey || null;
                        items = items.concat(queryOutput.Items);
                        _a.label = 4;
                    case 4:
                        if (items.length < pageSize) return [3 /*break*/, 2];
                        _a.label = 5;
                    case 5:
                        events = items.map(function (data, index) {
                            return {
                                commitTimestamp: data.commitTimestamp,
                                payload: data.payload,
                                sequence: index,
                            };
                        });
                        return [2 /*return*/, pageSize === -1 ? events.slice(offset) : events.slice(offset, pageSize)];
                }
            });
        });
    };
    DynamodbProvider.prototype.getAggregations = function (offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = -1; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not supported');
            });
        });
    };
    DynamodbProvider.prototype.getStreams = function (aggregation, offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = -1; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not supported');
            });
        });
    };
    DynamodbProvider.prototype.ensureTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.initialized && this.config.dynamodb.createTable)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.schema.createTables()];
                    case 1:
                        _a.sent();
                        this.initialized = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DynamodbProvider.prototype.getKey = function (stream) {
        return stream.aggregation + ":" + stream.id;
    };
    return DynamodbProvider;
}());
exports.DynamodbProvider = DynamodbProvider;
