export interface Assert {
    strictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
    isAbove(actual: number, expected: number, errorMessage: string): void;
    deepStrictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
}
export declare class AssertionFactory {
    private static _assert;
    static configure(assert: Assert): Assert;
    static get assert(): Assert;
}
//# sourceMappingURL=assert.d.ts.map