import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['post-footer'],
  tagName: 'ol',

  posts: Ember.inject.service(),
});
