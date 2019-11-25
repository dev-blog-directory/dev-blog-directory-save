'use strict';

const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const readFiles = require('node-read-yaml-files');
const {isWebUri} = require('valid-url');
const LocaleCode = require('locale-code');
const ISO6391 = require('iso-639-1');
const {get} = require('id-generators');
const generator = get('nanoid-simple-good');
const gen = generator({size: 10});
const keys = ['name', 'url', 'desc', 'rss', 'author', 'langs', 'github', 'categories', 'tags'];
const baseDir = 'documents';
const filenameLength = 2;
const BLOG_MAP = {};

function loadBlogs() {
  if (!fs.existsSync(baseDir)) {
    return Promise.resolve({});
  }

  return Promise.resolve()
    .then(() => readFiles(baseDir, {flatten: true}))
    .then(blogs => blogs.filter(blog => blog && typeof blog.url === 'string'))
    .then(blogs => {
      blogs.forEach(blog => {
        BLOG_MAP[blog.url] = blog;
      });
    });
}

function findUrlInDocuments(url) {
  if (BLOG_MAP[url]) {
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
      if (current.url === compare.url) {
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
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(tag);
}

function stringify(doc, key) {
  let str = '\n' + JSON.stringify(doc, null, 4);
  if (key) {
    const regex = new RegExp(`  ([ ]+"${key}")`);
    str = str.replace(regex, '>>$1');
  }

  return str;
}

function validate(doc) {
  if (typeof doc !== 'object') {
    throw new TypeError('invalid doc object.');
  }

  if (!doc.url) {
    throw new TypeError('url is required.' + stringify(doc, 'url'));
  }

  try {
    doc.url = new URL(doc.url).href;
  } catch (_) {
    throw new TypeError('invalid url.' + stringify(doc, 'url'));
  }

  if (findUrlInDocuments(doc.url)) {
    throw new TypeError('Duplicated url.' + stringify(doc, 'url'));
  }

  if (doc.rss) {
    try {
      doc.rss = new URL(doc.rss).href;
    } catch (_) {
      throw new TypeError('invalid rss url.' + stringify(doc, 'rss'));
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
    if (Array.isArray(value)) {
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

function save(doc) {
  return loadBlogs()
    .then(() => {
      validate(doc);
      _save(doc);
    });
}

function saveAll(docs) {
  return Promise.resolve()
    .then(() => {
      if (!Array.isArray(docs)) {
        throw new TypeError('Invalid arguments. Expect an array.');
      }

      const duplicated = checkDuplicated(docs);
      if (duplicated && duplicated.length > 1) {
        throw new Error('Duplicated urls in the input array: \n  ' + duplicated.join('\n  '));
      }
    })
    .then(loadBlogs)
    .then(() => {
      const errors = [];
      docs.forEach(doc => {
        try {
          validate(doc);
        } catch (error) {
          errors.push(error);
        }
      });
      if (errors.length > 0) {
        errors.forEach(error => console.log(String(error)));
        throw errors[0];
      }

      docs.forEach(_save);
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
