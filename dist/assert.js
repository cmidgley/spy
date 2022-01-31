export class AssertionFactory {
    static _assert = null;
    static configure(assert) {
        return this._assert = assert;
    }
    static async configureDefault() {
        return this.configure((await import('chai')).assert);
    }
    static get assert() {
        const assert = this._assert;
        if (assert !== null) {
            return assert;
        }
        throw new Error('Assertion is not configured for Spy.');
    }
}
//# sourceMappingURL=assert.js.map