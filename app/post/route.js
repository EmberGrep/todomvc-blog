import Ember from 'ember';

export default Ember.Route.extend({
  model({ 'post-slug': slug }) {
    return this.modelFor('application').find((post) => {
      return slug === post.slug;
    });
  },

  serialize(post) {
    return {
      'post-slug': post.slug,
    };
  },
});
