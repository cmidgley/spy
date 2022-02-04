export class AssertionFactory {
    static _assert = null;
    static configure(assert) {
        return (this._assert = assert);
    }
    static get assert() {
        if (this._assert == null)
            AssertionFactory.configureDefault();
        if (this._assert == null)
            throw new Error("Assertion is not configured for Spy.");
        return this._assert;
    }
    static configureDefault() {
        const assert = {
            strictEqual(actual, expected, message) {
                try {
                    expect(actual).toBe(expected);
                }
                catch (err) {
                    throw Error(`${message}: ${err}`);
                }
            },
            deepStrictEqual(actual, expected, message) {
                try {
                    expect(actual).toEqual(expected);
                }
                catch (err) {
                    throw Error(`${message}: ${err}`);
                }
            },
            isAbove(actual, expected, message) {
                try {
                    expect(actual).toBeGreaterThan(expected);
                }
                catch (err) {
                    throw Error(`${message}: ${err}`);
                }
            },
        };
        AssertionFactory.configure(assert);
    }
}
//# sourceMappingURL=assert.js.map