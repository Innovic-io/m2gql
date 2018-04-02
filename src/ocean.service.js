"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var mongodb_1 = require("mongodb");
var convert_1 = require("../lib/convert");
/**
 * Service to control data of Ocean type and Ocean collection
 */
var OceanService = (function () {
    function OceanService() {
        this.collectionName = 'ocean';
    }
    OceanService.prototype.connectToDB = function (uri, name) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongodb_1.MongoClient.connect(uri)];
                    case 1:
                        connection = _a.sent();
                        this.database = connection.db(name)
                            .collection(this.collectionName);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    OceanService.prototype.getSingle = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var item, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database.findOne((_a = {}, _a[key] = value, _a))];
                    case 1:
                        item = _b.sent();
                        this.transformObject(item);
                        this.mapRelations(item);
                        return [2 /*return*/, item];
                }
            });
        });
    };
    OceanService.prototype.getAllObjects = function (objectType, start, limit) {
        if (start === void 0) { start = 0; }
        if (limit === void 0) { limit = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var query, aggregation, _i, aggregation_1, item, _a, _b, relation, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        query = {};
                        if (objectType) {
                            query = {
                                objectType: objectType,
                            };
                        }
                        return [4 /*yield*/, this.database.find(query).skip(start).limit(limit).toArray()];
                    case 1:
                        aggregation = _g.sent();
                        aggregation.forEach(function (item) { return _this.transformObject(item); });
                        _i = 0, aggregation_1 = aggregation;
                        _g.label = 2;
                    case 2:
                        if (!(_i < aggregation_1.length)) return [3 /*break*/, 8];
                        item = aggregation_1[_i];
                        if (!('relations' in item)) return [3 /*break*/, 6];
                        _a = 0, _b = item.relations;
                        _g.label = 3;
                    case 3:
                        if (!(_a < _b.length)) return [3 /*break*/, 6];
                        relation = _b[_a];
                        _c = item;
                        _d = relation.name;
                        _e = this.transformObject;
                        return [4 /*yield*/, this.database
                                .findOne({ 'meta.guid.value': relation.id, 'objectType': relation.objectType })];
                    case 4:
                        _c[_d] = _e.apply(this, [_g.sent()]);
                        _g.label = 5;
                    case 5:
                        _a++;
                        return [3 /*break*/, 3];
                    case 6:
                        delete item.relations;
                        _g.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, (_f = {}, _f[this.collectionName] = aggregation, _f)];
                }
            });
        });
    };
    OceanService.prototype.updateObject = function (_id, key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var op, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .findOneAndUpdate({ '_id': new mongodb_1.ObjectID(_id), 'properties.definition.name': convert_1.capitilize(key) }, {
                            $set: {
                                'properties.$.value.value': value,
                            },
                        })];
                    case 1:
                        op = _a.sent();
                        item = op.value;
                        this.transformObject(item);
                        return [2 /*return*/, item];
                }
            });
        });
    };
    /**
     * Map related object to this object.
     *
     * @param item
     */
    OceanService.prototype.mapRelations = function (item) {
        var _this = this;
        item.relations.forEach(function (relation) {
            _this.transformObject(relation.object);
            item[convert_1.toCamelCase(relation.name)] = relation.object;
        });
        delete item.relations;
    };
    /**
     * Wrapper function for moving meta nad properties to top level, remove meta and properties as keys.
     *
     * @param object
     * @returns {any}
     */
    OceanService.prototype.transformObject = function (object) {
        if (!object) {
            return;
        }
        // transform meta
        var meta = object.meta;
        var properties = object.properties;
        delete object.meta;
        delete object.properties;
        return OceanService.stripObject(object, meta, properties);
    };
    /**
     * Move from meta and properties to top level
     *
     * @param object
     * @param meta
     * @param properties
     * @returns {any}
     */
    OceanService.stripObject = function (object, meta, properties) {
        for (var item in meta) {
            if (meta.hasOwnProperty(item)) {
                object[item] = meta[item].value;
            }
        }
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var property = properties_1[_i];
            if (property.hasOwnProperty('definition')) {
                if (property.definition.hasOwnProperty('name')) {
                    object[property.definition.name] = property.value.value;
                }
            }
        }
        return object;
    };
    return OceanService;
}());
exports.default = OceanService;
//# sourceMappingURL=object.js.map