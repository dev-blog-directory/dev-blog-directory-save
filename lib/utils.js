'use strict';

module.exports = {
  isArray: Array.isArray,

  unique: (array) => [...new Set(array)],

  filterEmpties: (array) => array.filter((v) => Boolean(v))
};
