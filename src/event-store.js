"use strict";
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
var _ = require("lodash");
var event_stream_1 = require("./event-stream");
/**
 * The EventStore itself. To create EventStore instances, use the {@link EventStoreBuilder}
 */
var EventStore = /** @class */ (function () {
    function EventStore(provider, publisher) {
        this.persistenceProvider = provider;
        this.storePublisher = publisher;
    }
    Object.defineProperty(EventStore.prototype, "provider", {
        get: function () {
            if (_.isNil(this.persistenceProvider)) {
                throw new Error('No Provider configured in EventStore.');
            }
            return this.persistenceProvider;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventStore.prototype, "publisher", {
        get: function () {
            return this.storePublisher;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieve an event stream.
     * @param aggregation The parent aggregation for the event stream
     * @param streamId The stream identifier. Can be any string
     * @return The existing stream. If no stream exists for to the given id, a new one
     * will be created when the first event is added to the stream.
     */
    EventStore.prototype.getEventStream = function (aggregation, streamId) {
        return new event_stream_1.EventStreamImpl(this, { aggregation: aggregation, id: streamId });
    };
    /**
     * Add a new subscription to notifications channel associated with the given aggregation.
     * It is necessary to have a valid {@link Publisher} configured that supports subscriptions.
     * @param aggregation The aggregation for the stream events
     * @param subscriber Declares the function to be called to handle new messages
     * @return A subscription. Can be used to remove the subscription to the publisher channel.
     */
    EventStore.prototype.subscribe = function (aggregation, subscriber) {
        if (this.publisher && this.publisher.subscribe) {
            return this.publisher.subscribe(aggregation, subscriber);
        }
        throw new Error('There is no valid Publisher configured. '
            + 'Configure a Publisher that implements HasSubscribers int erface');
    };
    /**
     * Retrieves a ranged aggregation list
     * @param offset The start position in the aggregation list
     * @param limit The desired quantity aggregations
     * @return The aggregation list
     */
    EventStore.prototype.getAggregations = function (offset, limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.provider.getAggregations(offset, limit)];
            });
        });
    };
    /**
     * Retrieves a ranged stream list
     * @param aggregation The aggregation
     * @param offset The start position in the stream list
     * @param limit The desired quantity streams
     * @return The stream list
     */
    EventStore.prototype.getStreams = function (aggregation, offset, limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.provider.getStreams(aggregation, offset, limit)];
            });
        });
    };
    return EventStore;
}());
exports.EventStore = EventStore;
