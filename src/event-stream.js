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
/**
 * An Event Stream
 */
var EventStreamImpl = /** @class */ (function () {
    function EventStreamImpl(eventStore, stream) {
        this.eventStore = eventStore;
        this.stream = stream;
    }
    Object.defineProperty(EventStreamImpl.prototype, "streamId", {
        /**
         * The event stream identifier
         * The event stream
         */
        get: function () {
            return this.stream.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventStreamImpl.prototype, "aggregation", {
        /**
         * The parent aggregation for this event stream
         */
        get: function () {
            return this.stream.aggregation;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Rertieve a list containing all the events in the stream in order.
     * @param offset The start position in the stream list
     * @param limit The desired quantity events
     * @return All the events
     */
    EventStreamImpl.prototype.getEvents = function (offset, limit) {
        return this.getProvider().getEvents(this.stream, offset, limit);
    };
    /**
     * Add a new event to the end of the event stream.
     * @param data The event data
     * @param type The Event type
     * @return The event, updated with informations like its sequence order and commitTimestamp
     */
    EventStreamImpl.prototype.addEvent = function (data, type) {
        return __awaiter(this, void 0, void 0, function () {
            var addedEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider().addEvent(this.stream, data, type)];
                    case 1:
                        addedEvent = _a.sent();
                        if (!this.eventStore.publisher) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.eventStore.publisher.publish({
                                event: addedEvent,
                                stream: this.stream
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, addedEvent];
                }
            });
        });
    };
    EventStreamImpl.prototype.getProvider = function () {
        return this.eventStore.provider;
    };
    return EventStreamImpl;
}());
exports.EventStreamImpl = EventStreamImpl;
