import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['top-nav'],

  actions: {
    toggleMenu() {
      this.$().toggleClass('active');
    },
  },
});
