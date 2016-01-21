import Ember from 'ember';

export default Ember.Route.extend({
  posts: Ember.inject.service(),

  model() {
    return this.get('posts.allPosts');
  },
});
