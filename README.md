# @cmidgley/spy fork of @netawork/spy

This fork has the following changes:

1) Project name change to @cmidgley/dispy (Moddable has limitation where package name and separate class can not use the same name)
2) Support for embedded systems use with [Moddable](http://moddable.com) by adding a `manifest.json` file.
3) Switch to ESM (was CommonJS)
4) Adjusted types in `spy.ts` to correct TSC compilation errors when using ESM.
5) Changed default asserts to using `jest`, and removed need to call `AssertionFactory.configureDefault`.
6) Since we are not making an NPM package (at this time), added `dist` to `.gitignore` to save compiled version.
7) Added tracking of instantiated spies and a `getSpy` method to locate a spy
   based on an instantiated proxy object.  This is useful for when dependency
   injection is being used for the creation of the mock, and the original spy
   needs to be located.  For long running tests, the `resetTracking` method can
   be used to clear the tracking table (all objects are cleared, so this should
   only be done when all running tests are over and before the next set of tests
   begin).a

README below is unchanged from original.  Aside from switching to ESM, the only other breaking change is no longer having a `chai` default for assertions.

# @netatwork/spy

[![npm version](https://img.shields.io/npm/v/@netatwork/spy)](https://www.npmjs.com/package/@netatwork/spy)
[![npm download](https://img.shields.io/npm/dt/@netatwork/spy?label=npm%20download)](https://www.npmjs.com/package/@netatwork/spy)
![build status](https://github.com/Netatwork-de/spy/workflows/build/badge.svg)

Mock the dependencies in unit tests with this proxy-based spy implementation.
This is easy to use because of the straight forward and simple API.
Additionally it provides better development experience with great IntelliSense, also for the object being spied, when used with TypeScript.

```typescript
import { Spy, AssertionFactory } from '@netatwork/spy';

class Service {
  public getData(): Promise<any> {
    // here we make HTTP requests
  }
}

class Sut {
  public constructor(
    public readonly service: Service
  ) { }
}

const spy = Spy.create(
  /* object to mock       */ new Service(),
  /* call through         */ false,
  /* mock implementations */ {
    getData() {
      return Promise.resolve([]);
    }
  }
);

// Do it once
await AssertionFactory.configureDefault();

const sut = new Sut(spy.proxy); //<-- !Important: inject the mock service
await sut.service.getData();
// assert method call
serviceSpy.isCalled('getData');
```

## API

For this section of documentation let us consider the following classes as the target for mocking and test.

```typescript
class Dependency {
  public readonly member: number = 42;

  public get prop(): number { return 42; }

  public foo() {
    return 'real foo';
  }

  public bar() {
    return 'real bar';
  }

  public add(num1: number, num2: number) {
    return num1 + num2;
  }
}

class Sut {
  public constructor(
    private readonly dep: Dependency,
  ) { }

  public doSomething() {
    const dep = this.dep;
    return `${dep.foo()} - ${dep.bar()}`;
  }
  public add(num1: number | NumWrapper, num2: number | NumWrapper) {
    return this.dep.add(num1, num2);
  }
}
```

### `Spy.create` and basic usage

Creates the spy.

```typescript
// with call-through
const spy = Spy.create(new Dependency(), true);
const proxy = spy.proxy;
proxy.foo() === 'real foo'; // true

// without call-through
Spy.create(new Dependency(), false);
const proxy = spy.proxy;
proxy.foo() === 'real foo'; // false
proxy.foo() === undefined;  // true
```

Mock implementations can be provided.

```typescript
// with call-through
const spy = Spy.create(new Dependency(), true, { foo() { return '42'; }, member: 43 });
const proxy = spy.proxy;
proxy.foo()  === '42';       // true
proxy.bar()  === 'real bar'; // true
proxy.member === 43;         // true
proxy.prop   === 42;         // true

// without call-through
const spy = Spy.create(new Dependency(), false, { foo() { return '42'; }, prop: 43 });
const proxy = spy.proxy;
proxy.foo()  === '42';       // true
proxy.bar()  === undefined;  // true
proxy.member === undefined;  // true
proxy.prop   === 43;         // true
```

Mocking a single function can be less verbose.

```typescript
// with call-through
const spy = Spy.create(new Dependency(), 'foo', true, () => '42');
const proxy = spy.proxy;
proxy.foo()  === '42';       // true
proxy.bar()  === 'real bar'; // true
proxy.member === 42;         // true
proxy.prop   === 42;         // true

// without call-through
const spy = Spy.create(new Dependency(), 'foo', false, () => '42');
const proxy = spy.proxy;
proxy.foo()  === '42';       // true
proxy.bar()  === undefined;  // true
proxy.member === undefined;  // true
proxy.prop   === undefined;  // true
```

The package also exposes a `createSpy` method which is just an alias of `Spy.create`.
Feel free to use whatever suits your esthetics.

### `callThrough`

The original method can be called from the mock implementation using `callThrough`.

```typescript
let fooCounter = 0, addCounter = 0;
const spy: Spy<Dependency> = Spy.create(new Dependency(), false, {
  foo() {
    fooCounter++;
    return fooCounter % 2 !== 0
      ? `fake foo#${fooCounter}`
      : spy.callThrough('foo');
  },
  add(num1, num2) {
    addCounter++;
    return addCounter % 2 !== 0
      ? num1 * num2
      : spy.callThrough('add', num1, num2);
  }
});
const sut = new Sut(spy.proxy);
sut.doSomething() === 'fake foo#1 - undefined' // true
sut.doSomething() === 'real foo - undefined'   // true
sut.doSomething() === 'fake foo#3 - undefined' // true
sut.add(2, 40)    === 80                       // true
sut.add(40, 2)    === 42                       // true
```

Note that from the mock implementation of `foo`, we can also call through `bar`.

```typescript
let fooCounter = 0;
const spy: Spy<Dependency> = Spy.create(new Dependency(), false, {
  foo() {
    fooCounter++;
    return fooCounter % 2 !== 0
      ? `fake foo#${fooCounter}`
      : spy.callThrough('bar');
  }
});
const sut = new Sut(spy.proxy);
sut.doSomething() === 'fake foo#1 - undefined' // true
sut.doSomething() === 'real bar - undefined'   // true
sut.doSomething() === 'fake foo#3 - undefined' // true
```

Note that the examples above are without call-through (`false` as the 2nd argument in `Spy.create`).
`callThrough` also works with call-through for the whole object.
Why don't you try that on your own!

### `getCallCount`

As the name suggests it returns the number of times a method is called.

```typescript
const spy: Spy<Dependency> = Spy.create(new Dependency(), false);
const sut = new Sut(spy.proxy);
sut.doSomething();
spy.getCallCount('foo') === 1 // true
spy.getCallCount('bar') === 1 // true
```

### `clearCallRecords`

Clears all the captured call records.

```typescript
const spy = Spy.create(new Dependency(), true);
const sut = new Sut(spy.proxy);
sut.add(1, 2);
sut.add(2, 3);
sut.doSomething();
spy.getCallCount('add') === 2 // true
spy.getCallCount('foo') === 1 // true
spy.getCallCount('bar') === 1 // true

spy.clearCallRecords('foo');
spy.getCallCount('add') === 2 // true
spy.getCallCount('foo') === 0 // true
spy.getCallCount('bar') === 1 // true

spy.clearCallRecords();
spy.getCallCount('add') === 0 // true
spy.getCallCount('foo') === 0 // true
spy.getCallCount('bar') === 0 // true

sut.add(40, 2);
spy.getCallCount('add') === 1 // true
```

### Assertion

By default this package uses `chai` to provide the assertions.
The assertions should be configured once before starting the tests.

```typescript
import { AssertionFactory } from '@netatwork/spy';

// do this in the bootstrapping code for you test
await AssertionFactory.configureDefault();
```

If you are not using `chai` as assertion library, you can customize the `AssertionFactory` with any other assertion implementation, using `configureDefault`.
The implementation needs to agree the following interface.

```typescript
interface Assert {
  strictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
  isAbove(actual: number, expected: number, errorMessage: string): void;
  deepStrictEqual<TValue>(actual: TValue, expected: TValue, errorMessage: string): void;
}
```

Below is an example of such customization.

```typescript
import { Assert, AssertionFactory } from '@netatwork/spy';
import { strict, AssertionError } from 'assert';

const assert: Assert = {
  strictEqual: strict.strictEqual,
  deepStrictEqual: strict.deepStrictEqual,
  isAbove(actual, expected, message) {
    if (actual <= expected) {
      throw new AssertionError({ message, actual, expected });
    }
  }
}

AssertionFactory.configure(assert);
```

**`isCalled`**

Asserts if a method is called and how many times.

```typescript
const spy = Spy.create(new Dependency(), true);
const sut = new Sut(spy.proxy);
sut.add(1, 2);
sut.add(2, 3);

spy.isCalled('add');    // works
spy.isCalled('add', 2); // works
spy.isCalled('add', 3); // throws

spy.isCalled('foo', 0); // works
spy.isCalled('foo');    // throws
spy.isCalled('foo', 1); // throws
```

**`isCalledWith`**

Asserts the arguments for a method call.

```typescript
const spy = Spy.create(new Dependency(), true);
const sut = new Sut(spy.proxy);
sut.add(1, 2);
sut.add(2, 3);

spy.isCalledWith('add', [[1, 2], [2, 3]]);    // works
spy.isCalledWith('add', [1, 2], 0);           // works
spy.isCalledWith('add', [2, 3], 1);           // works
spy.isCalledWith('add', [2, 5], 1);           // throws
```

When dealing with complex argument list, a transformation function also be used.

```typescript
const spy = Spy.create(new Dependency(), true);
const sut = new Sut(spy.proxy);
sut.add(1, 2);
sut.add(2, 3);

spy.isCalledWith(
  'add',
  '1 + 2',
  0,
  (args) => {
    const [arg0, arg2] = args as [number, number];
    return `${arg0} + ${arg2}`
  });

spy.isCalledWith(
  'add',
  '1 + 2 | 2 + 3',
  undefined,
  (args) => {
    return (args as [number, number][]).map(([arg0, arg1, arg2]) => `${arg0} + ${arg2}`).join(' | ');
  });
```

> For more examples refer the tests.

## Acknowledgements

The original work is highly influenced by the work done for [Aurelia2](https://github.com/aurelia/aurelia).