'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {expect} = chai;
const rewire = require('rewire');
const myModule = rewire('dev-blog-directory-save');
const loadBlogs = myModule.__get__('loadBlogs');
const mergeObject = myModule.__get__('mergeObject');
const _merge = myModule.__get__('_merge');

describe('merge', () => {
  before(() => {
    return loadBlogs();
  });

  describe('mergeObject', () => {
    it('merge simple value', () => {
      const obj1 = {
        _id: '123456',
        url: 'https://myblog.com',
        name: 'myblog',
        author: null,
        rss: 'http://myblog.com/wrong-feed/',
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };

      const obj2 = {
        url: 'https://myblog.com',
        name: null,
        author: 'blogger',
        rss: 'https://myblog.com/feed/',
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };

      const newDoc = mergeObject(obj1, obj2);
      expect(newDoc._id).to.be.an('string').to.be.have.lengthOf(6);
      expect(newDoc.name).to.be.eql('myblog');
      expect(newDoc.author).to.be.eql('blogger');
      expect(newDoc.rss).to.be.eql('https://myblog.com/feed/');
    });

    it('merge array 1', () => {
      const obj1 = {
        _id: '123456',
        url: 'https://myblog.com',
        name: 'myblog',
        author: null,
        langs: ['en'],
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };

      const obj2 = {
        url: 'https://myblog.com',
        name: 'myblog',
        author: 'blogger',
        langs: ['en'],
        tags: ['foo', 'ios'],
        categories: null
      };
      const newDoc = mergeObject(obj1, obj2);
      expect(newDoc._id).to.be.an('string').to.be.have.lengthOf(6);
      expect(newDoc.author).to.be.eql('blogger');
      expect(newDoc.langs).to.be.an('array').to.be.have.lengthOf(1);
      expect(newDoc.categories).to.be.an('array').to.be.have.lengthOf(2);
      expect(newDoc.tags).to.be.an('array').to.be.have.lengthOf(3);
    });

    it('merge array 2', () => {
      const obj1 = {
        _id: '123456',
        url: 'https://myblog.com',
        name: 'myblog',
        author: null,
        langs: null,
        tags: ['foo', 'bar'],
        categories: []
      };

      const obj2 = {
        url: 'https://myblog.com',
        name: 'myblog',
        author: 'blogger',
        langs: ['en', 'fr'],
        tags: ['python', 'ios'],
        categories: []
      };
      const newDoc = mergeObject(obj1, obj2);
      expect(newDoc._id).to.be.an('string').to.be.have.lengthOf(6);
      expect(newDoc.author).to.be.eql('blogger');
      expect(newDoc.langs).to.be.an('array').to.be.have.lengthOf(2);
      expect(newDoc.categories).to.be.an('array').to.be.have.lengthOf(0);
      expect(newDoc.tags).to.be.an('array').to.be.have.lengthOf(4);
    });

    it('merge array 3', () => {
      const obj1 = {
        _id: '123456',
        url: 'https://myblog.com',
        name: 'myblog',
        author: null,
        langs: 'en',
        tags: ['foo', 'bar'],
        categories: []
      };

      const obj2 = {
        url: 'https://myblog.com',
        name: 'myblog',
        author: 'blogger',
        langs: ['en', 'fr'],
        tags: 'python',
        categories: 'Personal'
      };
      const newDoc = mergeObject(obj1, obj2);
      expect(newDoc._id).to.be.an('string').to.be.have.lengthOf(6);
      expect(newDoc.author).to.be.eql('blogger');
      expect(newDoc.langs).to.be.an('array').to.be.have.lengthOf(2);
      expect(newDoc.categories).to.be.an('array').to.be.have.lengthOf(1);
      expect(newDoc.tags).to.be.an('array').to.be.have.lengthOf(3);
    });
  });

  describe('_merge', () => {
    it('merge author', () => {
      const doc = {
        url: 'https://myblog.com/',
        name: 'myblog',
        author: 'blogger',
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };

      return expect(_merge(doc)).to.be.fulfilled;
    });

    it('merge array', () => {
      const doc = {
        url: 'https://myblog.com/',
        name: 'myblog',
        author: null,
        tags: ['foo', 'ios'],
        categories: null
      };

      return expect(_merge(doc)).to.be.fulfilled;
    });

    it('save new blog', () => {
      const doc = {
        url: 'https://myblog.com/new-blog/',
        name: 'myblog',
        author: null,
        tags: ['foo', 'ios'],
        categories: null
      };

      return expect(_merge(doc)).to.be.fulfilled;
    });
  });
});
