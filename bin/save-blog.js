#!/usr/bin/env node

'use strict';

const fs = require('fs');
const read = require('node-read-yaml').sync;
const {save} = require('dev-blog-directory-save');
const newFilename = 'new.yml';
const templateFilename = '.new.yml';

function main() {
  try {
    const doc = read(newFilename);

    save(doc);

    fs.copyFileSync(templateFilename, newFilename);
  } catch (error) {
    exit(error);
  }
}

function exit(msg) {
  if (msg) {
    console.error(msg);
  }

  process.exit(1);
}

main();
