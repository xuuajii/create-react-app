import initialProperties from './initial-properties';
import definition from './definition/index';
import support from './support';
import paint from './paint/index';

export default {
  initialProperties: initialProperties,
  definition: definition,
  support: support,
  paint: (el, qLayout, qlik, qExtension) =>
    paint(el, qLayout, qlik, qExtension),
};
