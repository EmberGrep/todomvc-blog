/* jshint node: true */
const posts = require('../posts');

module.exports = function(environment) {
  var ENV = {
    posts,
    modulePrefix: 'todomvc-blog',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    googleFonts: [
      'Play:400,700',
      'Open+Sans:400,300',
      'Inconsolata',
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'font-src': `'self' fonts.gstatic.com`,
      'style-src': `'self' fonts.googleapis.com`,
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.googleAnalytics = {
      webPropertyId: process.env.GOOGLE_ID,
    };
  }

  return ENV;
};
