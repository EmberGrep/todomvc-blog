import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('post-footer', 'Integration | Component | post footer', {
  integration: true
});

const postsStub = Ember.Service.extend({
  allPosts: [
    {
      fullText: 'My First Post\n Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veritatis libero sequi, ullam blanditiis, cumque dolores magni, voluptates, ipsa vel nam odio similique corporis. Nihil sint laboriosam nulla perspiciatis, deleniti, odio.',
      body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veritatis libero sequi, ullam blanditiis, cumque dolores magni, voluptates, ipsa vel nam odio similique corporis. Nihil sint laboriosam nulla perspiciatis, deleniti, odio.',
      title: 'My First Post',
      slug: '00-my-first-post',
    }
  ],
});

test('it renders', function(assert) {
  this.register('service:posts', postsStub);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{post-footer}}`);

  assert.equal(this.$('li .post-footer__title').length, 1, 'There are titles for each post');
  assert.equal(this.$('li .post-footer__title').text().trim(), 'My First Post');
});
