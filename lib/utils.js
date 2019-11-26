'use strict';

module.exports = {
  isArray: Array.isArray,

  unique: arr => [...new Set(arr)],

  filterEmpties: arr => arr.filter(v => Boolean(v))
};
