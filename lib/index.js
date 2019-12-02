'use strict';

const path = require('path');
const {URL} = require('url');
const fs = require('fs-extra');
const readFiles = require('node-read-yaml-files');
const readYaml = require('node-read-yaml');
const lockfile = require('proper-lockfile');
const {isWebUri} = require('valid-url');
const LocaleCode = require('locale-code');
const ISO6391 = require('iso-639-1');
const {get} = require('id-generators');
const generator = get('nanoid-simple-good');
const gen = generator({size: 10});
const {isArray, unique, filterEmpties} = require('./utils.js');
const keys = ['name', 'url', 'desc', 'feed', 'author', 'langs', 'github', 'categories', 'tags'];
const baseDir = 'documents';
const filenameLength = 2;
const BLOG_MAP = {};
const BLOG_INDEX = {};

function loadBlogs() {
  if (!fs.existsSync(baseDir)) {
    return Promise.resolve({});
  }

  return Promise.resolve()
    .then(() => readFiles(baseDir, {flatten: true, ignores: ['.git']}))
    .then(blogs => blogs.filter(blog => blog && typeof blog.url === 'string'))
    .then(blogs => {
      blogs.forEach(blog => {
        BLOG_MAP[urlNoProtocal(blog.url)] = blog;
        BLOG_INDEX[urlNoProtocal(blog.url)] = 1;
        BLOG_INDEX[urlAlias(blog.url)] = 1;
      });
    });
}

function urlNoProtocal(url) {
  const regex = /https?:\/\//g;
  url = url.replace(regex, '');
  return url;
}

function urlAlias(url) {
  const regex = /https?:\/\/|www\.|\?.+|#.+|index\.html|\/$/g;
  url = url.replace(regex, '');
  // Replace one more time
  url = url.replace(regex, '');
  return url;
}

function findUrlInDocuments(url) {
  if (BLOG_MAP[urlNoProtocal(url)]) {
    return true;
  }

  if (BLOG_INDEX[urlAlias(url)]) {
    return true;
  }

  return false;
}

function checkDuplicated(blogs) {
  const duplicated = [];
  for (let i = blogs.length - 1; i >= 0; i--) {
    const current = blogs[i];
    for (let j = 0; j < i; j++) {
      const compare = blogs[j];
      if (current.url === compare.url ||
          urlAlias(current.url) === urlAlias(compare.url)) {
        duplicated.push(current.url);
      }
    }
  }

  return duplicated;
}

// eslint-disable-next-line no-unused-vars
function validateUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  return isWebUri(url) === url;
}

function validateCategory(tag) {
  return /^[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]$/.test(tag);
}

function validateTag(tag) {
  const validTags = ['c++', 'c/c++', 'c#', '.net'];
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(tag) || validTags.includes(tag);
}

function stringify(doc, key) {
  let str = '\n' + JSON.stringify(doc, null, 4);
  if (key) {
    const regex = new RegExp(`  ([ ]+"${key}")`);
    str = str.replace(regex, '>>$1');
  }

  return str;
}

function validate(doc, options) {
  options = {merge: false, ...options};

  if (typeof doc !== 'object') {
    throw new TypeError('invalid doc object.');
  }

  if (!doc.url) {
    throw new TypeError('url is required.' + stringify(doc, 'url'));
  }

  try {
    doc.url = doc.url.replace(/index\.html/g, '');
    doc.url = new URL(doc.url).href;
  } catch (_) {
    throw new TypeError('invalid url.' + stringify(doc, 'url'));
  }

  if (!options.merge && findUrlInDocuments(doc.url)) {
    throw new TypeError('Duplicated url.' + stringify(doc, 'url'));
  }

  if (doc.feed) {
    try {
      doc.feed = new URL(doc.feed).href;
    } catch (_) {
      throw new TypeError('invalid feed url.' + stringify(doc, 'feed'));
    }
  }

  if (doc.github) {
    try {
      doc.github = new URL(doc.github).href;
    } catch (_) {
      throw new TypeError('invalid github url.' + stringify(doc, 'github'));
    }
  }

  if (doc.langs) {
    if (typeof doc.langs === 'string') {
      doc.langs = doc.langs.split(/[, ]+/);
    }

    doc.langs = doc.langs.map(lang => {
      if (!ISO6391.validate(lang) && !LocaleCode.validate(lang)) {
        throw new TypeError('invalid language code: ' + lang + stringify(doc, 'langs'));
      }

      return lang.slice(0, 2).toLowerCase();
    });
  } else {
    doc.langs = ['en'];
  }

  if (doc.categories) {
    if (typeof doc.categories === 'string') {
      doc.categories = doc.categories.split(/[, ]+/);
    }

    doc.categories = doc.categories.filter(tag => tag && typeof tag === 'string')
      .map(tag => {
        const orgTag = tag;
        // Categories do not change to lower case
        tag = tag.trim();
        if (!validateCategory(tag)) {
          throw new TypeError('invalid category: ' + orgTag + '\nonly alphabet, number, - are allowed. - can\'t appear at the start and the end.' + stringify(doc, 'categories'));
        }

        return tag;
      });
  }

  if (doc.tags) {
    if (typeof doc.tags === 'string') {
      doc.tags = doc.tags.split(/[, ]+/);
    }

    doc.tags = doc.tags.filter(tag => tag && typeof tag === 'string')
      .map(tag => {
        const orgTag = tag;
        tag = tag.trim().toLowerCase();
        if (!validateTag(tag)) {
          throw new TypeError('invalid tag: ' + orgTag + '\nonly alphabet, number, - are allowed. - can\'t appear at the start and the end.' + stringify(doc, 'tags'));
        }

        return tag;
      });
  }

  return true;
}

function dump(doc) {
  const result = [];
  result.push('-');
  result.push('  _id: ' + doc._id);
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const value = doc[key];
    if (isArray(value)) {
      result.push(`  ${key}: ${JSON.stringify(value)}`);
    } else if (value) {
      result.push(`  ${key}: ${JSON.stringify(value)}`);
    } else {
      result.push(`  ${key}:`);
    }
  }

  console.debug('\nYAML:');
  console.debug(result.join('\n'));
  return result.join('\n') + '\n';
}

function _save(doc) {
  const id = gen();
  const filename = id.slice(0, filenameLength) + '.yml';
  console.info('\n---');
  console.info('id: ' + id);
  console.info('filename: ' + filename);
  doc._id = id;

  console.debug('\nJSON:');
  console.debug(doc);

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  const filepath = path.resolve(baseDir, filename);
  fs.appendFileSync(filepath, dump(doc));
}

function mergeObject(obj1, obj2) {
  for (const key in obj2) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      continue;
    }

    const value = obj2[key];
    if (!value) {
      continue;
    }

    if (isArray(value) || isArray(obj1[key])) {
      const arr = unique(filterEmpties([].concat(obj1[key]).concat(value)));
      obj1[key] = arr;
    } else if (key === 'url') {
      // Copy the value of url only when https.
      if (value.indexOf('https') === 0) {
        obj1[key] = value;
      }
    } else {
      obj1[key] = value;
    }
  }

  return obj1;
}

function _merge(doc) {
  const {url} = doc;
  const oldDoc = BLOG_MAP[urlNoProtocal(url)];
  if (!oldDoc) {
    return Promise.resolve().then(() => _save(doc));
  }

  const id = oldDoc._id;
  const filename = id.slice(0, filenameLength) + '.yml';
  console.info('\n---');
  console.info('id: ' + id);
  console.info('filename: ' + filename);

  console.debug('\nOLD VALUE:');
  console.debug(oldDoc);

  console.debug('\nNEW VALUE:');
  console.debug(doc);

  const newDoc = mergeObject(oldDoc, doc);

  console.debug('\nAFTER MERGE:');
  console.debug(newDoc);

  const filepath = path.resolve(baseDir, filename);

  return lockfile.lock(filepath, {retries: 5})
    .then(() => readYaml(filepath))
    .then(array => {
      array.forEach((blog, index) => {
        if (blog._id === id) {
          array[index] = newDoc;
        }
      });
      return array;
    })
    .then(array => {
      const content = array.map(dump).join('');
      return fs.writeFile(filepath, content);
    })
    .then(() => lockfile.unlock(filepath));
}

function save(doc, options) {
  options = {merge: false, ...options};
  return loadBlogs()
    .then(() => {
      validate(doc, options);
      if (options.merge) {
        return _merge(doc);
      }

      return _save(doc);
    });
}

function saveAll(docs, options) {
  options = {merge: false, ...options};
  return Promise.resolve()
    .then(() => {
      if (!isArray(docs)) {
        throw new TypeError('Invalid arguments. Expect an array.');
      }

      if (!options.merge) {
        const duplicated = checkDuplicated(docs);
        if (duplicated && duplicated.length > 0) {
          throw new Error('Duplicated urls in the list of to saving: \n  ' + duplicated.join('\n  '));
        }
      }
    })
    .then(loadBlogs)
    .then(() => {
      const errors = [];
      docs.forEach(doc => {
        try {
          validate(doc, options);
        } catch (error) {
          errors.push(error);
        }
      });
      if (errors.length > 0) {
        errors.forEach(error => console.log(String(error)));
        throw errors[0];
      }

      if (options.merge) {
        return Promise.all(docs.map(_merge));
      }

      return Promise.all(docs.map(_save));
    });
}

module.exports = {
  save,
  saveAll
};

/**
TODOs
- check whether url is already exist
- if new.yml or .new.yml not exist, create them.
- request url, check whether url is available, get missed informations
*/
