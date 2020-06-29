const isInQlikExtensions = path =>
  path.match(/Documents\\Qlik\\Sense\\Extensions/g) > 0;

module.exports = isInQlikExtensions;
