import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('top-nav', 'Integration | Component | top nav', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{top-nav}}`);

  assert.equal(this.$('.top-nav').hasClass('active'), false);

  this.$('.top-nav__toggle').click();

  assert.equal(this.$('.top-nav').hasClass('active'), true, 'Clicking toggle will set active');
});
