'use strict';

const {expect} = require('chai');
const {save, saveAll} = require('dev-blog-directory-save');

describe('something', () => {
  it('should do something', () => {
    expect(save).to.be.a('function');
    expect(saveAll).to.be.a('function');
  });
});
