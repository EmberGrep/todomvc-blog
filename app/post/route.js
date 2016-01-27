import Ember from 'ember';
import ResetScrollMixin from 'ember-cli-reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {
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
