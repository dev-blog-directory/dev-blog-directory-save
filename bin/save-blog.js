#!/usr/bin/env node

'use strict';

const fs = require('fs');
const {sync: read, FAILSAFE_SCHEMA} = require('node-read-yaml');
const {saveAll} = require('dev-blog-directory-save');
const newFilename = 'new.yml';
const templateFilename = '.new.yml';

function main() {
  try {
    const docs = read(newFilename, {multi: true, schema: FAILSAFE_SCHEMA})
      .filter(doc => doc && typeof doc === 'object');

    saveAll(docs);

    fs.copyFileSync(templateFilename, newFilename);
  } catch (error) {
    exit(error);
  }
}

function exit(msg) {
  if (msg) {
    console.error(String(msg));
  }

  process.exit(1);
}

main();
