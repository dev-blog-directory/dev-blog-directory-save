'use strict';

const fs = require('fs');
const path = require('path');
const {isWebUri} = require('valid-url');
const LocaleCode = require('locale-code');
const ISO6391 = require('iso-639-1');
const {get} = require('id-generators');
const generator = get('nanoid-simple');
const gen = generator({size: 10});
const keys = ['name', 'url', 'desc', 'rss', 'author', 'langs', 'github'];
const baseDir = 'documents';
const filenameLength = 2;

function validateUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  return isWebUri(url);
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
  if (!doc.url) {
    throw new TypeError('url is required.' + stringify(doc, 'url'));
  }

  if (!validateUrl(doc.url)) {
    throw new TypeError('invalid url.' + stringify(doc, 'url'));
  }

  if (doc.rss && !validateUrl(doc.rss)) {
    throw new TypeError('invalid rss url.' + stringify(doc, 'rss'));
  }

  if (doc.github && !validateUrl(doc.github)) {
    throw new TypeError('invalid github url.' + stringify(doc, 'github'));
  }

  if (doc.langs) {
    if (typeof doc.langs === 'string') {
      doc.langs = [doc.langs];
    }

    doc.langs = doc.langs.map(lang => {
      if (!ISO6391.validate(lang) && !LocaleCode.validate(lang)) {
        throw new TypeError('invalid language code: ' + lang + stringify(doc, 'langs'));
      }

      return lang.slice(0, 2).toLowerCase();
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
      result.push(`  ${key}: [${value}]`);
    } else if (value) {
      result.push(`  ${key}: ${value}`);
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
  validate(doc);
  _save(doc);
}

function saveAll(docs) {
  docs.map(validate);
  docs.map(_save);
}

module.exports = {
  save,
  saveAll
};
/*
TODOs
- check whether url is already exist
- if new.yml or .new.yml not exist, create them.
*/
