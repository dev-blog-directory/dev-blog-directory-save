'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');
const rewire = require('rewire');
const myModule = rewire('dev-blog-directory-save');
const {save, saveAll} = require('dev-blog-directory-save');
const findUrlInDocuments = myModule.__get__('findUrlInDocuments');
const checkDuplicated = myModule.__get__('checkDuplicated');
const validateUrl = myModule.__get__('validateUrl');
const validate = myModule.__get__('validate');

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
      expect(() => save()).to.be.throw();
    });

    it('invalid type', () => {
      expect(() => save('{object:1}')).to.be.throw();
    });

    it('no url', () => {
      const doc = {
        name: 'example'
      };
      expect(() => save(doc)).to.be.throw('url is required');
    });

    it('should save a doc', () => {
      const doc = {
        url: 'https://myblog.com',
        name: 'myblog',
        tags: ['foo', 'bar'],
        categories: ['foo', 'bar']
      };
      expect(() => save(doc)).to.not.throw();
    });

    it('should save another doc', () => {
      const doc = {
        url: 'https://myblog.com/save/2',
        name: 'myblog'
      };
      expect(() => save(doc)).to.not.throw();
    });

    it('duplicated url', () => {
      const doc = {
        url: 'https://myblog.com/',
        name: 'myblog'
      };
      expect(() => save(doc)).to.be.throw('Duplicated url');
    });
  });

  describe('saveAll', () => {
    it('no arguments', () => {
      expect(() => saveAll()).to.be.throw();
    });

    it('invalid type', () => {
      expect(() => saveAll('{object:1}')).to.be.throw();
    });

    it('no url', () => {
      const docs = [{
        name: 'example'
      }];
      expect(() => saveAll(docs)).to.be.throw('url is required');
    });

    it('should save a doc', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/2',
        name: 'myblog'
      }];
      expect(() => saveAll(docs)).to.not.throw();
    });

    it('should save another doc', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/3',
        name: 'myblog'
      }, {
        url: 'https://myblog.com/saveAll/4',
        name: 'myblog'
      }];
      expect(() => saveAll(docs)).to.not.throw();
    });

    it('duplicated url', () => {
      const docs = [{
        url: 'https://myblog.com/saveAll/1',
        name: 'myblog'
      }];
      expect(() => saveAll(docs)).to.be.throw('Duplicated url');
    });
  });

  describe('validate', () => {
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
    it('should throw error', () => {
      expect(() => findUrlInDocuments('https://myblog.com/')).to.throw();
    });

    it('should not throw error', () => {
      expect(() => findUrlInDocuments('https://myblog.com/findUrlInDocuments/2')).to.not.throw();
    });
  });

  describe('checkDuplicated', () => {
    it('should not throw error', () => {
      const blogs = [
        {
          name: 'a',
          url: 'https://blog.com/a'
        }
      ];
      expect(() => checkDuplicated(blogs)).to.not.throw();
    });

    it('should not throw error', () => {
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
      expect(() => checkDuplicated(blogs)).to.not.throw();
    });

    it('should throw error', () => {
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
      expect(() => checkDuplicated(blogs)).to.throw();
    });
  });
});
