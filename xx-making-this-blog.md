# Making This Blog

When working on my the posts on how I would create TodoMVC using Ember, I started to get a bit worried about the freshness of [my old blog](http://ryantablada.com).
There were a lot of things I wanted, that just didn't exist with my old version 1.0 Wardrobe blog.

So, I did what only seemed natural: make something new!

As a rule it had to have a few things:

* Markdown
* Free Hosting
* Community Editing
* Continuous Deployment
* Highlight.js Syntax Highlighting

So, clearly the only sane thought would be to get a free theme off for Jekyll and go.
But, I also had some other rules:

* No Weird File Names
* No Front Matter
* No Ruby

So..
I began to think again.
And I came up with the idea to make a small blogging app (the one you are likely reading this on now) using Ember CLI.

# Loading Posts

To start, I am incredibly lazy: So I thought to myself, what is the easiest way to get markdown files into Ember as POJOs.
Well, `config/environment.js` is actually running in Node.js not client side.
So, I can just do some filesystem work in a `posts/index.js` to turn markdown files into an array of strings.

```js
const fs = require('fs');

const postFiles = fs.readdirSync(__dirname);

module.exports = postFiles.filter((filename) => {
  return filename.indexOf('.md') > -1;
}).map((filename) => {
  return fs.readFileSync(`${__dirname}/${filename}`, 'utf8');
});
```

This would work, but since I didn't want a crazy file naming convention or front matter, I would need some way to grab the `title` from the first line of each file.
While I was thinking about this, I went ahead and threw in properties for a `slug` based on the file name and `body` which would be everything EXCEPT for the title.

```js
const fs = require('fs');

const postFiles = fs.readdirSync(__dirname);

function getPostTitle(post) {
  return post.match(/#\s*(.+)\n/)[1];
}

function getPostBody(post) {
  return post.match(/#(.+)\n([\S\s]*)/m)[2];
}

module.exports = postFiles.filter((filename) => {
  return filename.indexOf('.md') > -1;
}).map((filename) => {
  const post = fs.readFileSync(`${__dirname}/${filename}`, 'utf8');

  return {
    fullText: post,
    body: getPostBody(post),
    title: getPostTitle(post),
    slug: filename,
  };
});
```

Now in `config/environment.js` I am able to add `posts: require('../posts')` to the ENV variables.

## Listing All Posts From a Route

Ok, so I have the posts as POJOs in my config variables.
Now, I want to actually show them to the user.
For this, I went ahead and created a small service to store posts since I will be using them across all parts of my blog:

```bash
ember g service posts -p
```

Ok, then in this service, I can expose the config variable `posts` as a new `allPosts` property.

```js
import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  allPosts: config.posts,
});
```

Later on, this service will provide an abstraction for when posts are retrieved in some other way.

I have a service with all of my posts, now time to show it off.
For the home page, I will need a route:

```bash
ember g route index -p
```

Then in the route I can set the model hook to grab `allPosts` from the `posts` service:

```js
import Ember from 'ember';

export default Ember.Route.extend({
  posts: Ember.inject.service(),

  model() {
    return this.get('posts.allPosts');
  },
});
```

And for the template, I just loop over each post and grab the title:

```htmlbars
{{#each model as |post|}}
  <h2>{{post.title}}</h2>
{{/each}}
```

## Showing Posts Content

Ok, I have titles showing up from the markdown files in my `posts` directory.
What about the content?
While it's not too hard to wrap highlight.js and marked by myself, it is more work than I want to do (see the part about me being lazy).
So instead, I search [emberaddons.com](http://emberaddons.com) for `markdown` and find a result for `markdown-code-highlighting`.
Time to try this out!

```bash
ember install markdown-code-highlighting
```

And reading the documentation I need to use the `{{format-markdown}}` component and just pass in the markdown I want parsed.
Simple enough!

```htmlbars
{{#each model as |post|}}
  <h2>{{post.title}}</h2>

  {{format-markdown post.body}}
{{/each}}
```

So...
The markdown is parsing, but none of the syntax highlighting seems to be working.
What gives?

--- Fumbles through three other addons ---

OH...
I forgot to include the CSS outlined in the docs...
So jump over to the `ember-cli-build.js` and add an import hook: `app.import('bower_components/highlightjs/styles/github.css');`.

JACKPOT!

## Deployment

Ok, so I have the blog running (although a bit bare bones), so what about deploying it to the masses?
I knew I wouldn't want to host this on my own, I knew I would want custom domain names, I knew I wanted it to be free, and I knew that I didn't want to use Github pages (because subtrees are weird).

For hosting I chose [surge.sh](http://surge.sh).
I still have some issues with auth from time to time, but for what I need, it will work.
Now I just need to create a script to deploy things easily.
I will need to do three things:

* Build the Ember CLI Project with the production environment
* Copy `index.html` into a `200.html` so that Surge can use Ember's router
* Run `surge` to deploy the files

Three steps, all bash commands, something I don't want to type over and over?
Time to add an npm script:

```json
{
  "scripts": {
    "build": "ember build",
    "start": "ember server",
    "test": "ember test",
    "deploy": "ember build -e production && cp dist/index.html dist/200.html && surge dist todomvc.embergrep.com"
  },
}
```

Now, I don't want to have to run deploys any time I change things.
So, let's look at how to hook up Surge with Codeship.

I don't have any real tests to run at this point, but I just need a shell script run every time I push to Github.
Luckily, this is pretty easy at this point.
Start a new Codeship project, point it at the Github repo for the blog, set it up as a Node project and add a deploy bash script of `npm run deploy`.

Let's try it out!

Hmmm... I go out to dinner and Codeship is emailing me that my tests timed out...
That's funny: I don't have ANY tests!
Let's see, what's going on.

Looks like Surge is asking for my email to login.
Whoops! I forgot to publish my `SURGE_LOGIN` (the email address I signed up with) and `SURGE_TOKEN` (an API token which I can find by running `surge token`) to Codeship.
I update those environment variables, rerun my CI and looks like it's good to go.

## DNS Woes

I go to my DNS provider and set `todomvc.embergrep.com` to point to Surge's IP address.
I immediately go to the site and I'm redirected to the homepage for EmberGrep.
Looks like DNS failed...
Grab a drink, see if the DNS propagates.

10 minutes later and still nothing.
Well, let's check Firefox.
Works there!

Ok...
So what's wrong with Chrome?
Turns out Chrome cached the DNS redirect since it pointed to an SSL encrypted site.
Clear DNS cache and there's the site!

## Still Room to Grow

This blog is admittedly hacked together.
As the number and size of posts increase, sending everything in environment variables will start to really kill initial rendering.
Same goes for client-side rendering for each article's markdown.

I think that when I really start feeling these pains alot, I will move to making post parsing part of the build process.
So instead of passing posts as an environment variable, the list of posts (with titles and slugs) will be created as a `posts.json` file and then the full post will be flat markdown files that can be deployed with the app, loaded and parsed.

But for now...
I am really happy that I can post this by just running `git push`.
