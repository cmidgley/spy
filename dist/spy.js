"use strict";
/*! ********************************************************************************
 * Disclaimer:
 * This is implementation of Spy is influenced from Aurelia2's Spy implementation
 * for internal usage.
 * Refer: https://github.com/aurelia/aurelia/blob/master/packages/__tests__/Spy.ts
 ******************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpy = exports.Spy = void 0;
var assert_1 = require("./assert");
var assert = null;
var noop = function () { };
var identity = function (_) { return _; };
var Spy = (function () {
    function Spy(originalObject, callThrough, mocks) {
        if (callThrough === void 0) { callThrough = true; }
        if (mocks === void 0) { mocks = {}; }
        this.originalObject = originalObject;
        this.callRecords = new Map();
        var spy = this;
        this.proxy = new Proxy(originalObject, {
            get: function (target, p, _receiver) {
                var propertyKey = p;
                var original = target[propertyKey];
                var mock = mocks[propertyKey];
                if (spy.isMethod(original)) {
                    if (spy.isMethod(mock)) {
                        return spy.createCallRecorder(propertyKey, mock);
                    }
                    return callThrough
                        ? spy.createCallRecorder(propertyKey, original)
                        : spy.createCallRecorder(propertyKey, noop);
                }
                return mock !== null && mock !== void 0 ? mock : (callThrough ? original : undefined);
            }
        });
    }
    Spy.create = function (objectToMock) {
        var _a, _b;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var methodName;
        var callThrough;
        var mockImplementation = {};
        switch (args.length) {
            case 3: {
                var methodImpl = void 0;
                _a = args, methodName = _a[0], callThrough = _a[1], methodImpl = _a[2];
                mockImplementation = (_b = {}, _b[methodName] = methodImpl, _b);
                break;
            }
            case 2: {
                var _c = args, arg1 = _c[0], arg2 = _c[1];
                if (typeof arg1 === 'string' && typeof arg2 === 'boolean') {
                    methodName = arg1;
                    callThrough = arg2;
                }
                else if (typeof arg1 === 'boolean') {
                    callThrough = arg1;
                    mockImplementation = arg2;
                }
                else {
                    throw new Error("unconsumed arguments: " + String(arg1) + ", " + String(arg2));
                }
                break;
            }
            case 1: {
                var arg1 = args[0];
                if (typeof arg1 !== 'boolean') {
                    throw new Error("unconsumed argument: " + String(arg1));
                }
                callThrough = arg1;
                break;
            }
            default:
                throw new Error('Unexpected number of arguments');
        }
        assert !== null && assert !== void 0 ? assert : (assert = assert_1.AssertionFactory.assert);
        return new Spy(objectToMock, callThrough, mockImplementation);
    };
    Spy.prototype.callThrough = function (propertyKey) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var original = this.originalObject;
        return original[propertyKey].apply(original, args);
    };
    Spy.prototype.createCallRecorder = function (propertyKey, trapped) {
        var spy = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            spy.setCallRecord(propertyKey, args);
            return trapped.apply(this, args);
        };
    };
    Spy.prototype.setCallRecord = function (methodName, args) {
        var record = this.callRecords.get(methodName);
        if (record) {
            record.push(args);
        }
        else {
            record = [args];
        }
        this.callRecords.set(methodName, record);
    };
    Spy.prototype.clearCallRecords = function (method) {
        if (method === void 0) { method = null; }
        if (method !== null) {
            this.callRecords.delete(method);
            return;
        }
        this.callRecords.clear();
    };
    Spy.prototype.getCallCount = function (methodName) {
        var _a;
        var calls = this.callRecords.get(methodName);
        return (_a = calls === null || calls === void 0 ? void 0 : calls.length) !== null && _a !== void 0 ? _a : 0;
    };
    Spy.prototype.getArguments = function (methodName, callIndex) {
        var calls = this.callRecords.get(methodName);
        if (calls === undefined) {
            return undefined;
        }
        if (callIndex !== null && callIndex !== undefined) {
            return calls[callIndex];
        }
        return calls;
    };
    Spy.prototype.isCalled = function (methodName, times) {
        var callCount = this.getCallCount(methodName);
        if (times != null) {
            assert.strictEqual(callCount, times, "call count mismatch for " + String(methodName));
        }
        else {
            assert.isAbove(callCount, 0, "expected " + String(methodName) + " to have been called at least once, but wasn't");
        }
    };
    Spy.prototype.isCalledWith = function (methodName, expectedArgs, callIndex, argsTransformer) {
        if (argsTransformer === void 0) { argsTransformer = identity; }
        var actual = argsTransformer(this.getArguments(methodName, callIndex));
        assert.deepStrictEqual(actual, expectedArgs, "argument mismatch for " + String(methodName));
    };
    Spy.prototype.isMethod = function (arg) {
        return typeof arg === 'function';
    };
    return Spy;
}());
exports.Spy = Spy;
exports.createSpy = Spy.create.bind(Spy);
//# sourceMappingURL=spy.js.map