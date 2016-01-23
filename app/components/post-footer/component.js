import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['post-footer'],
  tagName: 'ul',

  posts: Ember.inject.service(),
});
