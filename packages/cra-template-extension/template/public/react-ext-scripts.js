define([
  'qlik',
  'text!./index.html',
  'http://localhost:3000/bundle.js',
], function (qlik, template, main) {
  'use strict';
  return {
    template: template,
    initialProperties: main.initialProperties,
    definition: main.definition,
    support: main.support,
    paint: function ($element, layout) {
      main.paint($element, layout, qlik, this);
      return qlik.Promise.resolve();
    },
  };
});
