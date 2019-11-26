'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {expect} = chai;
const fs = require('fs-extra');
const rewire = require('rewire');
const myModule = rewire('dev-blog-directory-save');
const {save, saveAll} = require('dev-blog-directory-save');
const findUrlInDocuments = myModule.__get__('findUrlInDocuments');
const checkDuplicated = myModule.__get__('checkDuplicated');
const validateUrl = myModule.__get__('validateUrl');
const validate = myModule.__get__('validate');
const loadBlogs = myModule.__get__('loadBlogs');

describe('dev-blog-directory-save', () => {
  before(() => {
    return fs.remove('./documents')
      .then(() => {
        console.log('remove ./documents success!');
      })
      .catch(error => {
        console.error(error);
      });
  });

  it('should return functions', () => {
    expect(save).to.be.a('function');
    expect(saveAll).to.be.a('function');
  });

  describe('save', () => {
    it('no arguments', () => {
      return expect(save()).to.be.rejectedWith('invalid doc object');
    });

    it('invalid type', () => {
      return expect(save('{object:1}')).to.be.rejectedWith('invalid doc object');
    });

    it('no url', () => {
      const doc = {
        name: 'example'
      };
      return expect(save(doc)).to.be.rejectedWith('url is required');
    });

    it('should save a doc', () => {
      const doc = {
        url: 'https://myblog.com',
        name: 'myblog',
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };
      return expect(save(doc)).to.be.fulfilled;
    });

    it('should save another doc', () => {
      const doc = {
        url: 'https://myblog.com/save/2',
        name: 'myblog'
      };
      return expect(save(doc)).to.be.fulfilled;
    });

    it('duplicated url', () => {
      const doc = {
        url: 'https://myblog.com/',
        name: 'myblog'
      };
      return expect(save(doc)).to.be.rejectedWith('Duplicated url');
    });

    it('merge a doc', () => {
      const doc = {
        url: 'https://myblog.com/',
        name: 'myblog-new'
      };
      return expect(save(doc, {merge: true})).to.be.fulfilled;
    });
  });

  describe('saveAll', () => {
    it('no arguments', () => {
      return expect(saveAll()).to.be.rejected;
    });

    it('invalid type', () => {
      return expect(saveAll('{object:1}')).to.be.rejected;
    });

    it('no url', () => {
      const docs = [{
        name: 'example'
      }];
      return expect(saveAll(docs)).to.be.rejectedWith('url is required');
    });

    it('should save a doc', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/2',
        name: 'myblog'
      }];
      return expect(saveAll(docs)).to.be.fulfilled;
    });

    it('should save another doc', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/3',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/4',
        name: 'myblog'
      }];
      return expect(saveAll(docs)).to.be.fulfilled;
    });

    it('duplicated url', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }];
      return expect(saveAll(docs)).to.be.rejectedWith('Duplicated url');
    });

    it('print multi error messages', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/3',
        name: 'myblog'
      }, {
        url: 'myblog.com/saveAll/4',
        name: 'myblog'
      }];
      return expect(saveAll(docs)).to.be.rejectedWith('Duplicated url');
    });

    it('Duplicated urls in the input array', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/2',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/3',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/3',
        name: 'myblog'
      }];
      return expect(saveAll(docs)).to.be.rejectedWith('Duplicated urls in the input array');
    });

    it('merge docs', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/2',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/99',
        name: 'myblog'
      }];
      return expect(saveAll(docs, {merge: true})).to.be.fulfilled;
    });
  });

  describe('validate', () => {
    before(() => {
      return loadBlogs();
    });

    it('no arguments', () => {
      expect(() => validate()).to.be.throw();
    });

    it('invalid type', () => {
      expect(() => validate('{object:1}')).to.be.throw();
    });

    it('no url', () => {
      const doc = {
        name: 'example'
      };
      expect(() => validate(doc)).to.be.throw('url is required');
    });

    it('invalid url', () => {
      const doc = {
        url: 'example.com'
      };
      expect(() => validate(doc)).to.be.throw('invalid url');
    });

    it('invalid url', () => {
      const doc = {
        url: '//foo.com'
      };
      expect(() => validate(doc)).to.be.throw('invalid url');
    });

    it('duplicated url', () => {
      const doc = {
        url: 'https://myblog.com/'
      };
      expect(() => validate(doc)).to.be.throw('Duplicated url');
    });

    it('duplicated url', () => {
      const doc = {
        url: 'https://myblog.com'
      };
      expect(() => validate(doc)).to.be.throw('Duplicated url');
    });

    it('invalid rss url', () => {
      const doc = {
        url: 'https://example.com',
        rss: 'example.com'
      };
      expect(() => validate(doc)).to.be.throw('invalid rss url');
    });

    it('invalid github url', () => {
      const doc = {
        url: 'https://example.com',
        github: 'example.com'
      };
      expect(() => validate(doc)).to.be.throw('invalid github url');
    });

    it('valid url', () => {
      const doc = {
        url: 'http://example.com'
      };
      expect(() => validate(doc)).to.not.throw();
      expect(validate(doc)).to.be.eql(true);
      expect(doc.url).to.be.eql('http://example.com/');
    });

    it('valid url', () => {
      const doc = {
        url: 'https://example.com'
      };
      expect(() => validate(doc)).to.not.throw();
      expect(validate(doc)).to.be.eql(true);
      expect(doc.url).to.be.eql('https://example.com/');
    });

    it('valid url', () => {
      const doc = {
        url: 'https://example.com/'
      };
      expect(() => validate(doc)).to.not.throw();
      expect(validate(doc)).to.be.eql(true);
      expect(doc.url).to.be.eql('https://example.com/');
    });

    it('valid url', () => {
      const doc = {
        url: 'https://example.com#some-hash'
      };
      expect(() => validate(doc)).to.not.throw();
      expect(validate(doc)).to.be.eql(true);
      expect(doc.url).to.be.eql('https://example.com/#some-hash');
    });

    it('spaces should be encoded', () => {
      const doc = {
        url: 'http://foo.bar?q=Spaces should be encoded'
      };
      expect(() => validate(doc)).to.not.throw();
      expect(validate(doc)).to.be.eql(true);
      expect(doc.url).to.be.eql('http://foo.bar/?q=Spaces%20should%20be%20encoded');
    });

    describe('validate - langs', () => {
      it('should be undefined', () => {
        const doc = {
          url: 'https://example.com/'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.an('undefined');
      });

      it('should be \'\'', () => {
        const doc = {
          url: 'https://example.com/',
          langs: ''
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.eql('');
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          langs: 'en'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.an('array');
        expect(doc.langs).to.be.eql(['en']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          langs: 'en,zh'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.an('array');
        expect(doc.langs).to.be.eql(['en', 'zh']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          langs: ['en']
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.an('array');
        expect(doc.langs).to.be.eql(['en']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          langs: ['en', 'zh']
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.langs).to.be.an('array');
        expect(doc.langs).to.be.eql(['en', 'zh']);
      });

      it('should throw an error', () => {
        const doc = {
          url: 'https://example.com/',
          langs: ['en_US']
        };
        expect(() => validate(doc)).to.be.throw('invalid language code:');
      });

      it('should throw an error', () => {
        const doc = {
          url: 'https://example.com/',
          langs: ['zz']
        };
        expect(() => validate(doc)).to.be.throw('invalid language code:');
      });
    });

    describe('validate - tags, categories', () => {
      it('should be undefined', () => {
        const doc = {
          url: 'https://example.com/'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('undefined');
        expect(doc.categories).to.be.an('undefined');
      });

      it('should be \'\'', () => {
        const doc = {
          url: 'https://example.com/',
          tags: '',
          categories: ''
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.eql('');
        expect(doc.categories).to.be.eql('');
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: 'foo',
          categories: 'foo'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo']);
        expect(doc.categories).to.be.an('array');
        expect(doc.categories).to.be.eql(['foo']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: 'foo,bar',
          categories: 'foo,bar'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo', 'bar']);
        expect(doc.categories).to.be.an('array');
        expect(doc.categories).to.be.eql(['foo', 'bar']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: 'foo bar'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo', 'bar']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: 'foo, bar'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo', 'bar']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: 'foo , bar'
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo', 'bar']);
      });

      it('should be an array', () => {
        const doc = {
          url: 'https://example.com/',
          tags: ['FOO', 'Bar'],
          categories: ['FOO', 'Bar']
        };
        expect(validate(doc)).to.be.eql(true);
        expect(doc.tags).to.be.an('array');
        expect(doc.tags).to.be.eql(['foo', 'bar']);
        expect(doc.categories).to.be.eql(['FOO', 'Bar']);
      });

      const validTags = [
        'foo-foo',
        'FOO-Bar',
        'foo,bar',
        ['foo-bar', 'A-TAG']
      ];

      validTags.forEach((tags, i) => {
        it(`valid tag (${i})`, () => {
          const doc = {
            url: 'https://example.com/',
            tags
          };
          expect(validate(doc)).to.be.eql(true);
          expect(doc.tags).to.be.an('array');
        });
      });

      const invalidTags = [
        '-foo',
        'foo-',
        'foo_bar',
        ['@123foo']
      ];

      invalidTags.forEach((tags, i) => {
        it(`invalid tags (${i})`, () => {
          const doc = {
            url: 'https://example.com/',
            tags
          };
          expect(() => validate(doc)).to.be.throw('invalid tag');
        });
      });

      invalidTags.forEach((categories, i) => {
        it(`invalid categories (${i})`, () => {
          const doc = {
            url: 'https://example.com/',
            categories
          };
          expect(() => validate(doc)).to.be.throw('invalid category');
        });
      });
    });
  });

  describe('validateUrl', () => {
    it('no arguments', () => {
      expect(validateUrl()).to.be.eql(false);
    });

    it('non-string type', () => {
      expect(validateUrl({object: 1})).to.be.eql(false);
    });

    it('invalid url', () => {
      expect(validateUrl('example.com')).to.be.eql(false);
    });

    it('invalid url', () => {
      expect(validateUrl('//foo.com')).to.be.eql(false);
    });

    it('valid url', () => {
      expect(validateUrl('http://example.com')).to.be.eql(true);
    });

    it('valid url', () => {
      expect(validateUrl('https://example.com')).to.be.eql(true);
    });

    it('valid url', () => {
      expect(validateUrl('https://example.com/')).to.be.eql(true);
    });

    it('valid url', () => {
      expect(validateUrl('https://example.com#some-hash')).to.be.eql(true);
    });

    it('spaces should be encoded', () => {
      expect(validateUrl('http://foo.bar?q=Spaces should be encoded')).to.be.eql(false);
    });
  });

  describe('findUrlInDocuments', () => {
    before(() => {
      return loadBlogs();
    });

    it('should found', () => {
      expect(findUrlInDocuments('https://myblog.com/')).to.be.eql(true);
    });

    it('should not found', () => {
      expect(findUrlInDocuments('https://myblog.com/findUrlInDocuments/2')).to.be.eql(false);
    });
  });

  describe('checkDuplicated', () => {
    it('should return an empty array', () => {
      const blogs = [
        {
          name: 'a',
          url: 'https://blog.com/a'
        }
      ];
      const result = checkDuplicated(blogs);
      expect(result).to.be.an('array').have.lengthOf(0);
    });

    it('should return an empty array', () => {
      const blogs = [
        {
          name: 'a',
          url: 'https://blog.com/a'
        },
        {
          name: 'b',
          url: 'https://blog.com/b'
        },
        {
          name: 'c',
          url: 'https://blog.com/c'
        }
      ];
      const result = checkDuplicated(blogs);
      expect(result).to.be.an('array').have.lengthOf(0);
    });

    it('should return duplicated result', () => {
      const blogs = [
        {
          name: 'a',
          url: 'https://blog.com/a'
        },
        {
          name: 'b',
          url: 'https://blog.com/b'
        },
        {
          name: 'c',
          url: 'https://blog.com/c'
        },
        {
          name: 'b2',
          url: 'https://blog.com/b'
        }
      ];
      const result = checkDuplicated(blogs);
      expect(result).to.be.an('array').have.lengthOf(1);
      expect(result[0]).eql('https://blog.com/b');
    });

    it('should return duplicated result', () => {
      const blogs = [
        {
          name: 'a',
          url: 'https://blog.com/a'
        },
        {
          name: 'b',
          url: 'https://blog.com/b'
        },
        {
          name: 'c',
          url: 'https://blog.com/c'
        },
        {
          name: 'b2',
          url: 'https://blog.com/b'
        },
        {
          name: 'c2',
          url: 'https://blog.com/c'
        }
      ];
      const result = checkDuplicated(blogs);
      expect(result).to.be.an('array').have.lengthOf(2);
      expect(result[0]).eql('https://blog.com/c');
    });
  });
});
