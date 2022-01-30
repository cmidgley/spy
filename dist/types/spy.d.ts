/*! ********************************************************************************
 * Disclaimer:
 * This is implementation of Spy is influenced from Aurelia2's Spy implementation
 * for internal usage.
 * Refer: https://github.com/aurelia/aurelia/blob/master/packages/__tests__/Spy.ts
 ******************************************************************************** */
export declare type MethodNames<TObject> = {
    [Method in keyof TObject]: TObject[Method] extends Function ? Method : never;
}[keyof TObject];
export declare type PickOnlyMethods<TObject> = {
    [Method in MethodNames<TObject>]: (...args: unknown[]) => unknown;
};
export declare type MethodParameters<TObject, TMethod extends MethodNames<TObject>> = Parameters<PickOnlyMethods<TObject>[TMethod]>;
export declare type Indexable<TObject> = {
    [key in keyof TObject]: TObject[key];
};
export declare type ArgumentTransformer<TObject, TMethod extends MethodNames<TObject>> = (args: MethodParameters<TObject, TMethod> | MethodParameters<TObject, TMethod>[] | undefined) => unknown;
export declare class Spy<TObject extends object> {
    private readonly originalObject;
    static create<TObject extends object, TMethod extends MethodNames<TObject>>(objectToMock: TObject, methodName: TMethod, callThrough: boolean, mockImplementation?: TObject[TMethod]): Spy<TObject>;
    static create<TObject extends object>(objectToMock: TObject, callThrough: boolean, mockImplementation?: Partial<TObject>): Spy<TObject>;
    callRecords: Map<MethodNames<TObject>, Parameters<PickOnlyMethods<TObject>[MethodNames<TObject>]>[]>;
    readonly proxy: TObject;
    constructor(originalObject: TObject, callThrough?: boolean, mocks?: Partial<TObject>);
    callThrough<TMethod extends MethodNames<TObject>>(propertyKey: TMethod, ...args: MethodParameters<TObject, TMethod>): ReturnType<(...fargs: unknown[]) => unknown>;
    clearCallRecords<TMethod extends MethodNames<TObject>>(method?: TMethod): void;
    getCallCount(methodName: MethodNames<TObject>): number;
    getArguments<TMethod extends MethodNames<TObject>>(methodName: TMethod): MethodParameters<TObject, TMethod>[] | undefined;
    getArguments<TMethod extends MethodNames<TObject>>(methodName: TMethod, callIndex: number): MethodParameters<TObject, TMethod> | undefined;
    isCalled(methodName: MethodNames<TObject>, times?: number): void;
    isCalledWith<TMethod extends MethodNames<TObject>>(methodName: TMethod, expectedArgs: MethodParameters<TObject, TMethod>, callIndex: number): void;
    isCalledWith<TMethod extends MethodNames<TObject>>(methodName: TMethod, expectedArgs: MethodParameters<TObject, TMethod>[]): void;
    isCalledWith<TMethod extends MethodNames<TObject>>(methodName: TMethod, expectedArgs: MethodParameters<TObject, TMethod> | MethodParameters<TObject, TMethod>[] | unknown, callIndex: number | undefined, argsTransformer: ArgumentTransformer<TObject, TMethod>): void;
    private isMethod;
}
export declare const createSpy: typeof Spy.create;
//# sourceMappingURL=spy.d.ts.map