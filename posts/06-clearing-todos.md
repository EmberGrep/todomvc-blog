# Ember CLI TodoMVC - Clearing Todos

To wrap up the features of TodoMVC, we will need a way to clear completed todos from the list of todos.

## Showing Clear Button

Right now our app is always showing the "Clear completed" button at all times.
But if we look at the example TodoMVC app, it should only show up if we have completed items.
For this, we should use an `if` block in our template.
In our application template, let's replace the HTML for the original button with this code:

```htmlbars
{{#if (arr-length (complete-only model))}}
  <button class="clear-completed">Clear completed</button>
{{/if}}
```

Here we are using the `complete-only` helper to get a list of our existing completed todos.
Then we use the `arr-length` helper to check the length of this list.
So, when the list of completed tasks is empty, `arr-length` will return 0 which will evaluate to a falsy value and the button will no longer be in the DOM.

Here we were able to use our existing handlebars helpers to add this feature without changing any Javascript in our app.

## Hiding the Bottom Bar

If we look at the demo application, the entire status bar and todo list hides when there are no todos in the app.
So, we can wrap the entire status bar in a similar `if` block.
But, we'll use the entire model list instead of just the completed items:

```htmlbars
{{#if (arr-length model)}}
  <section class="main">
    <input class="toggle-all" type="checkbox">
    <label for="toggle-all">Mark all as complete</label>
    {{outlet}}
  </section>
  <!-- This footer should hidden by default and shown when there are todos -->
  <footer class="footer">
    <!-- This should be `0 items left` by default -->
    <span class="todo-count">
      <strong>{{arr-length (active-only model)}}</strong> items left
    </span>
    <!-- Remove this if you don't implement routing -->
    <ul class="filters">
      <li>
        {{#link-to "index" activeClass="selected"}}All{{/link-to}}
      </li>
      <li>
        {{#link-to "active" activeClass="selected"}}Active{{/link-to}}
      </li>
      <li>
        {{#link-to "completed" activeClass="selected"}}Completed{{/link-to}}
      </li>
    </ul>
    <!-- Hidden if no completed items are left ↓ -->
    {{#if (arr-length (complete-only model))}}
      <button class="clear-completed" onclick={{action "deleteTodos" (complete-only model)}}>Clear completed</button>
    {{/if}}
  </footer>
{{/if}}
```

## Clearing Todos

Now, we need a way to clear multiple todos.
So let's start by adding an `onclick` listener to this button:

```htmlbars
<button class="clear-completed" onclick={{action "deleteTodos"}}>Clear completed</button>
```

And like before when we've created actions, we have to add this action to our controller:

```js
deleteTodos() {

},
```

But, right now, we don't have a good way to know which items to delete.
So, once again, we'll use the `complete-only` helper and pass in an array of the items we want to delete:

```htmlbars
<button class="clear-completed" onclick={{action "deleteTodos" (complete-only model)}}>Clear completed</button>
```

We send in the todos we want to delete instead of sending all of the todos so that the `deleteTodos` action can be reused incase we want to delete any list of todos (regardless of completed status).
Now we need to actually loop over our array of todos that we want to delete and run the existing `deleteTodo` action:

```js
deleteTodos(todos) {
  todos.forEach(todo => this.send('deleteTodo', todo));
},
```

We have all of the features of TodoMVC completed and working.
In the next article, we'll look at refactoring some of our code and writing tests.
