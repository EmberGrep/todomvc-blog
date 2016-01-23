import Ember from 'ember';

export function currentYear(/*, hash*/) {
  const now = new Date();

  return now.getFullYear();
}

export default Ember.Helper.helper(currentYear);
