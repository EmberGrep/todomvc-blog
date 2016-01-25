import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['top-nav'],

  click() {
    this.$().toggleClass('active');
  },
});
