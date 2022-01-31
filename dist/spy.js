/*! ********************************************************************************
 * Disclaimer:
 * This is implementation of Spy is influenced from Aurelia2's Spy implementation
 * for internal usage.
 * Refer: https://github.com/aurelia/aurelia/blob/master/packages/__tests__/Spy.ts
 ******************************************************************************** */
import { AssertionFactory } from './assert';
let assert = null;
const noop = () => { };
const identity = (_) => _;
export class Spy {
    originalObject;
    static create(objectToMock, ...args) {
        let methodName;
        let callThrough;
        let mockImplementation = {};
        switch (args.length) {
            case 3: {
                let methodImpl;
                [methodName, callThrough, methodImpl] = args;
                mockImplementation = { [methodName]: methodImpl };
                break;
            }
            case 2: {
                const [arg1, arg2] = args;
                if (typeof arg1 === 'string' && typeof arg2 === 'boolean') {
                    methodName = arg1;
                    callThrough = arg2;
                }
                else if (typeof arg1 === 'boolean') {
                    callThrough = arg1;
                    mockImplementation = arg2;
                }
                else {
                    throw new Error(`unconsumed arguments: ${String(arg1)}, ${String(arg2)}`);
                }
                break;
            }
            case 1: {
                const arg1 = args[0];
                if (typeof arg1 !== 'boolean') {
                    throw new Error(`unconsumed argument: ${String(arg1)}`);
                }
                callThrough = arg1;
                break;
            }
            default:
                throw new Error('Unexpected number of arguments');
        }
        assert ??= AssertionFactory.assert;
        return new Spy(objectToMock, callThrough, mockImplementation);
    }
    callRecords = new Map();
    proxy;
    constructor(originalObject, callThrough = true, mocks = {}) {
        this.originalObject = originalObject;
        const spy = this;
        this.proxy = new Proxy(originalObject, {
            get(target, p, _receiver) {
                const propertyKey = p;
                const original = target[propertyKey];
                const mock = mocks[propertyKey];
                if (spy.isMethod(original)) {
                    if (spy.isMethod(mock)) {
                        return spy.createCallRecorder(propertyKey, mock);
                    }
                    return callThrough
                        ? spy.createCallRecorder(propertyKey, original)
                        : spy.createCallRecorder(propertyKey, noop);
                }
                return mock ?? (callThrough ? original : undefined);
            }
        });
    }
    callThrough(propertyKey, ...args) {
        const original = this.originalObject;
        return original[propertyKey].apply(original, args);
    }
    createCallRecorder(propertyKey, trapped) {
        const spy = this;
        return function (...args) {
            spy.setCallRecord(propertyKey, args);
            return trapped.apply(this, args);
        };
    }
    setCallRecord(methodName, args) {
        let record = this.callRecords.get(methodName);
        if (record) {
            record.push(args);
        }
        else {
            record = [args];
        }
        this.callRecords.set(methodName, record);
    }
    clearCallRecords(method = null) {
        if (method !== null) {
            this.callRecords.delete(method);
            return;
        }
        this.callRecords.clear();
    }
    getCallCount(methodName) {
        const calls = this.callRecords.get(methodName);
        return calls?.length ?? 0;
    }
    getArguments(methodName, callIndex) {
        const calls = this.callRecords.get(methodName);
        if (calls === undefined) {
            return undefined;
        }
        if (callIndex !== null && callIndex !== undefined) {
            return calls[callIndex];
        }
        return calls;
    }
    isCalled(methodName, times) {
        const callCount = this.getCallCount(methodName);
        if (times != null) {
            assert.strictEqual(callCount, times, `call count mismatch for ${String(methodName)}`);
        }
        else {
            assert.isAbove(callCount, 0, `expected ${String(methodName)} to have been called at least once, but wasn't`);
        }
    }
    isCalledWith(methodName, expectedArgs, callIndex, argsTransformer = identity) {
        const actual = argsTransformer(this.getArguments(methodName, callIndex));
        assert.deepStrictEqual(actual, expectedArgs, `argument mismatch for ${String(methodName)}`);
    }
    isMethod(arg) {
        return typeof arg === 'function';
    }
}
export const createSpy = Spy.create.bind(Spy);
//# sourceMappingURL=spy.js.map