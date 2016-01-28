# Ember Testing TodoMVC - Unit Testing

> [See the finished app in action](todomvc-example.embergrep.com)

So far in our app, we've created a functioning application.
But, how do we assure that things are working, and how can we assure that these features will continue working in the future?

The answer here is to add tests to our application.
Since we are adding these tests after the fact, we are writting regression tests instead of some of the more traditional "Test Driven Development".
We'll take a few steps to get full coverage, but we'll start small, then work our way up.

## Running Tests With Ember CLI

To get up and running, we'll need a way to continuously test our app as we write code.
In our terminal, let's run the following command:

```bash
ember test --server
```

This will run a `testem` server which can build and test our application in the background.
However, if we look at what testem is saying now, the errors are overflowing from our terminal.
Instead we can visit `http://localhost:7357/` to run these tests in Chrome for ourselves and it should auto-refresh just like when we run `ember serve`.

## JSHint Errors

If we look at the failing tests so far in the application, we can't get very far because of a group of JSHint errors.
Unfortunately, this isn't an error with the code we've written so far...
Instead, it is an issue with with JSHint support for the ES6 Object Rest/Spread operator.

So for now, until JSHint supports all of the Stage 2 ECMA Script proposals, we will need to turn off JSHint.
We can do this by modifying the `ember-cli-build.js` file:

```js
var app = new EmberApp(defaults, {
  'ember-cli-qunit': {
    useLintTree: false
  }
});
```

Now our app will not run JSHint tests.

> **NOTE** I would like to get some sort of lint/hint tests working, but they are not worth losing the Object Rest/Spread operator.

If we look back at the test runner in Chrome, we can see that there are failing tests.
This is because the generators along the way created tests for our helpers, routes, controllers, and components.
For the routes and controllers, there isn't anything that we've changed to make those tests fail since they really only look for boot errors.
However we will have to re-write the tests for our components and template helpers to match the behavior we've created.

## Unit Test - `arr-length`

To start, we'll write some tests for our two helpers.
Right now however, we are getting a lot of noise from our component.
We can hide these errors by filtering our tests in the test runner.
In the filter box type in "Helper" and press enter to only run the unit tests for our template helpers.

Now, we see that we have a test that says "it works" for our `arr-length` helper.
Let's use the drop down in the test runner to only run tests for our `arr-length` helper.
This isn't very useful, so let's go to the `tests/unit/helpers/arr-length-test.js` file and make this pass.

Before we can write the test, we have to first understand the way that HTMLBars and Ember send arguments to our helper.
Each helper has two arguments: an array of the unnamed arguments sent to the helper, and an object of named attributes sent to the helper.
This can make the function signature a bit strange for our helper, but now that we have a basic understanding of this structure, we can move on.

So, let's write our first test to cover our most happy path: we pass in an array and the helper gives us back a resulting length:

```js
test('it calculates the length of an array', function(assert) {
  let arr = [42, 12, 15];

  let result = arrLength([arr]);
  assert.equal(result, 3);
});
```

Now our test is passing, but we need to cover some other scenarios to make our helper a bit more bulletproof.
Since we don't have complete control over what is passed in to this helper, we could either decide that we EXPECT perfect arguments, or put in some fail-safes to cover possible errors.

What happens if we pass in an object?
Let's try writing a test.
Since an object isn't an array and we definitely expect a numerical result, I think that we should return `0`.


```js
test('it returns a good default for non-arrays', function(assert) {
  let notArray = {foo: 'bar'};

  let result = arrLength([notArray]);
  assert.equal(result, 0);
});
```

Now we have a failing test, and we need to update the code for our `arr-length` helper to return our default value:

```js
export function arrLength([arr]/*, hash*/) {
  if (!Array.isArray(arr)) {
    return 0;
  }

  return arr.length;
}
```

We use the `Array.isArray` ES5 function to check that what we receive from the template is an array and then send our default value of `0` if this check does not pass.

Let's also create a few more tests for sending in `null`, `undefined`, and a string value to check that our helper works for nearly any possible scenario:

```js
test('it returns a good default for non-arrays', function(assert) {
  let obj = {foo: 'bar'};

  let resultObj = arrLength([notArray]);
  assert.equal(resultObj, 0);

  let n = {foo: 'bar'};

  let resultNull = arrLength([n]);
  assert.equal(resultNull, 0);

  let u = undefined;

  let resultUndefined = arrLength([u]);
  assert.equal(resultUndefined, 0);

  let str = `I'm a teapot`;

  let resultStr = arrLength([str]);
  assert.equal(resultStr, 0);
});
```

These tests continue to pass, but give us better coverage and checks if we ever need to refactor.

## Unit Test - `active-only`

Next, we will need to add tests for our `active-only` helper.
These tests will still test a pure function, but the setup will be a bit more complex since we are dealing with a larger set of edgecases.
Let's use the select box in the qUnit test runner to run the tests for "Unit | Helper | active only".

This time, we'll start with our sensible defaults, then create our happy path tests.
I think since we are expecting this function to filter, it should return an empty array if filtering is not possible.

```js
test('it returns a good default for non-arrays', function(assert) {
  let obj = {foo: 'bar'};

  let resultObj = activeOnly([obj]);
  assert.equal(resultObj, []);

  let n = {foo: 'bar'};

  let resultNull = activeOnly([n]);
  assert.equal(resultNull, []);

  let u = undefined;

  let resultUndefined = activeOnly([u]);
  assert.equal(resultUndefined, []);

  let str = `I'm a teapot`;

  let resultStr = activeOnly([str]);
  assert.equal(resultStr, []);
});
```

In the test runner, we are getting the error: "todos.filter is not a function", because our helper does not check that our `todos` argument is actually something that is filterable.
Here, let's check that `todos` is an object and that it has a function called `filter`.
If these conditions aren't met, we'll send back an empty array:

```js
import Ember from 'ember';

export function activeOnly([todos]/*, hash*/) {
  if (typeof todos !== 'object' || typeof todos.filter !== 'function') {
    return [];
  }

  return todos.filter((todo) => {
    return !todo.isComplete;
  });
}

export default Ember.Helper.helper(activeOnly);
```

The reason that we check for `typeof` "object" instead of using `Array.isArray` is because we may want to support `Ember.ArrayProxy` at a later time, and at least at the time of this post, `Array.isArray(new Ember.ArrayProxy({content: []}))` will return false.
However, ArrayProxys do support filtering of content.

If we look at our tests, they are still failing right now.
This is because of the way we wrote our tests.
One thing to be aware of is that `assert.equal` in qUnit compares reference values.
So just like `[] == []` returns false, `assert.equal` will fail even if two arrays with the same values are passed in.
To fix this we can use the `assert.deepEqual` to compare the contents instead of the memory location of our arrays:

```js
test('it returns a good default for non-arrays', function(assert) {
  let obj = {foo: 'bar'};

  let resultObj = activeOnly([obj]);
  assert.deepEqual(resultObj, []);

  let n = {foo: 'bar'};

  let resultNull = activeOnly([n]);
  assert.deepEqual(resultNull, []);

  let u = undefined;

  let resultUndefined = activeOnly([u]);
  assert.deepEqual(resultUndefined, []);

  let str = `I'm a teapot`;

  let resultStr = activeOnly([str]);
  assert.deepEqual(resultStr, []);
});
```

Now, it's time to test actual work on arrays of todos:

```js
test('it returns an array of active todos', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: false},
    {title: 'Milk', isComplete: false},
  ];

  let resultObj = activeOnly([todos]);
  assert.deepEqual(resultObj, todos);
});
```

All the tests should be passing with no extra work.
To cover other edgecases, we need to test a few other scenarios:

```js
test('it returns no tasks if all are done', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: true},
    {title: 'Milk', isComplete: true},
  ];

  let resultObj = activeOnly([todos]);
  assert.deepEqual(resultObj, []);
});

test('it returns no tasks if all are done', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: true},
    {title: 'Milk', isComplete: true},
  ];

  let resultObj = activeOnly([todos]);
  assert.deepEqual(resultObj, []);
});

test('it returns only incomplete tasks from a mixed set', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: true},
    {title: 'Milk', isComplete: false},
  ];

  let resultObj = activeOnly([todos]);
  assert.deepEqual(resultObj, [{title: 'Milk', isComplete: false}]);
});

test('it returns empty when there are no todos', function(assert) {
  let todos = [];

  let resultObj = activeOnly([todos]);
  assert.deepEqual(resultObj, []);
});
```

We can duplicate the tests for `active-only` and modify them to test our `complete-only` helper in `tests/unit/helpers/complete-only-test.js`

```js
import { completeOnly } from '../../../helpers/complete-only';
import { module, test } from 'qunit';

module('Unit | Helper | complete only');

// Replace this with your real tests.
test('it returns a good default for non-arrays', function(assert) {
  let obj = {foo: 'bar'};

  let resultObj = completeOnly([obj]);
  assert.deepEqual(resultObj, []);

  let n = {foo: 'bar'};

  let resultNull = completeOnly([n]);
  assert.deepEqual(resultNull, []);

  let u = undefined;

  let resultUndefined = completeOnly([u]);
  assert.deepEqual(resultUndefined, []);

  let str = `I'm a teapot`;

  let resultStr = completeOnly([str]);
  assert.deepEqual(resultStr, []);
});

test('it returns an array of complete todos', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: true},
    {title: 'Milk', isComplete: true},
  ];

  let resultObj = completeOnly([todos]);
  assert.deepEqual(resultObj, todos);
});

test('it returns no tasks if no are done', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: false},
    {title: 'Milk', isComplete: false},
  ];

  let resultObj = completeOnly([todos]);
  assert.deepEqual(resultObj, []);
});

test('it returns only incompletee tasks from a mixed set', function(assert) {
  let todos = [
    {title: 'Cereal', isComplete: true},
    {title: 'Milk', isComplete: false},
  ];

  let resultObj = completeOnly([todos]);
  assert.deepEqual(resultObj, [{title: 'Cereal', isComplete: true}]);
});

test('it returns empty when there are no todos', function(assert) {
  let todos = [];

  let resultObj = completeOnly([todos]);
  assert.deepEqual(resultObj, []);
});
```

And we will need to modify our helper to accommodate the defaults:

```js
import Ember from 'ember';

export function completeOnly([todos]/*, hash*/) {
  if (typeof todos !== 'object' || typeof todos.filter !== 'function') {
    return [];
  }

  return todos.filter((todo) => {
    return !!todo.isComplete;
  });
}

export default Ember.Helper.helper(completeOnly);
```

Now all of our template helpers are fully tested and we can rest assured that they function as expected.

## Refactoring

One of the things that is bothering me about our code so far is that we have duplicated code in our `complete-only` and `active-only` helpers and tests.
This is where we can start to refactor out a utility function instead of having this duplicate code.
We'll start by running the following to create a new util file and test:

```js
ember g util arr-filter
```

Then let's copy the guts of our `active-only` helper function and paste it into the new `app/utils/arr-filter.js` file:

```js
export default function arrFilter() {
  function activeOnly([todos]/*, hash*/) {
    if (typeof todos !== 'object' || typeof todos.filter !== 'function') {
      return [];
    }

    return todos.filter((todo) => {
      return !todo.isComplete;
    });
  }
}
```

Now the purpose of our `arr-filter` utility isn't to ACTUALLY filter our results.
Instead, it just allows us to compose our `active-only` and `complete-only` helper functions by only worrying about what's different: the filter function.
So, this `arr-filter` helper will return a function that will serve as our handlebars helper.

```js
export default function arrFilter() {
  return function([todos]/*, hash*/) {
    if (typeof todos !== 'object' || typeof todos.filter !== 'function') {
      return [];
    }

    return todos.filter((todo) => {
      return !todo.isComplete;
    });
  }
}
```

Before moving forward, let's use this util to replace our code in `active-only` and see if our tests are passing:

```js
import Ember from 'ember';
import arrFilter from '../utils/arr-filter';

export let activeOnly = arrFilter();

export default Ember.Helper.helper(activeOnly);
```

And if we check our test runner for `active-only`, it is still passing.
What if we try this for our `complete-only`?

```js
import Ember from 'ember';
import arrFilter from '../utils/arr-filter';

export let completeOnly = arrFilter();

export default Ember.Helper.helper(completeOnly);
```

Now, our tests are failing for complete only so we will need to make some modifications.
Back in the `app/utils/arr-filter`, let's add an argument to take in the filter function we want to use to compose our helper and pass it to the `todos.filter` function:

```js
export default function arrFilter(filter) {
  return function([todos]/*, hash*/) {
    if (typeof todos !== 'object' || typeof todos.filter !== 'function') {
      return [];
    }

    return todos.filter(filter);
  };
}
```

Now in `complete-only`, we can pass in the filter callback to `arrFilter`:

```js
import Ember from 'ember';
import arrFilter from '../utils/arr-filter';

export let completeOnly = arrFilter((todo) => todo.isComplete);

export default Ember.Helper.helper(completeOnly);
```

And we'll do the same for `active-only` with the proper filter function there:

```js
import Ember from 'ember';
import arrFilter from '../utils/arr-filter';

export let activeOnly = arrFilter((todo) => !todo.isComplete);

export default Ember.Helper.helper(activeOnly);
```

We were able to refactor our code because we had our regression tests in place to check that everything remained working the same.
