export interface Assert {
  strictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
  isAbove(actual: number, expected: number, errorMessage: string): void;
  deepStrictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
}

export class AssertionFactory {
  private static _assert: Assert | null = null;
  public static configure(assert: Assert): Assert {
    return this._assert = assert;
  }

  public static get assert(): Assert {
    if (this._assert == null) 
      AssertionFactory.configureDefault();
    if (this._assert == null)
      throw new Error('Assertion is not configured for Spy.');
    return this._assert;
  }

  public static configureDefault() {
    const assert: Assert = {
			strictEqual(actual: unknown, expected: unknown, message: string) {
				try {
					expect(actual).toBe(expected);
				} catch (err) {
					throw Error(`${message}: ${<string>err}`);
				}
			},
			deepStrictEqual(actual: unknown, expected: unknown, message: string) {
				try {
					expect(actual).toEqual(expected);
				} catch (err) {
					throw Error(`${message}: ${<string>err}`);
				}
			},
			isAbove(actual: number, expected: number, message: string) {
				try {
					expect(actual).toBeGreaterThan(expected);
				} catch (err) {
					throw Error(`${message}: ${<string>err}`);
				}
			},
		};
		AssertionFactory.configure(assert);
  }
}