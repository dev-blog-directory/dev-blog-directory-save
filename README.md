# dev-blog-directory-save

[![NPM Version][npm-version-image]][npm-url]
[![LICENSE][license-image]][license-url]
[![Build Status][travis-image]][travis-url]
[![code style: prettier][code-style-prettier-image]][code-style-prettier-url]

API for save new blogs to **[dev-blog-directory-raw](https://github.com/dailyrandomphoto/dev-blog-directory-raw)**.

## Installation

```sh
npm install dev-blog-directory-save
```

## API

### save (doc [, options])

Save a blog entry to documents.

**options**

- `merge` _(default: false)_ - merge blogs

### saveAll (docArray [, options])

Save a list of blog entries to documents.

## Related

- [dev-blog-directory](https://github.com/dailyrandomphoto/dev-blog-directory) - A directory of the developer's blog.
- [dev-blog-directory-raw](https://github.com/dailyrandomphoto/dev-blog-directory-raw) - Raw data storage of [Developer Blog Directory](https://github.com/dailyrandomphoto/dev-blog-directory).
- [dev-blog-directory-save-yaml-cli](https://github.com/dailyrandomphoto/dev-blog-directory-save-yaml-cli) - A CLI for saves the YAML format blog list to `documents/*.yml`.
- [dev-blog-directory-save-json-cli](https://github.com/dailyrandomphoto/dev-blog-directory-save-json-cli) - A CLI for saves the JSON format blog list to `documents/*.yml`.

## License

Copyright (c) 2019 [dailyrandomphoto][my-url]. Licensed under the [MIT license][license-url].

[my-url]: https://github.com/dailyrandomphoto
[npm-url]: https://www.npmjs.com/package/dev-blog-directory-save
[travis-url]: https://travis-ci.org/dailyrandomphoto/dev-blog-directory-save
[license-url]: LICENSE
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/dev-blog-directory-save
[npm-version-image]: https://img.shields.io/npm/v/dev-blog-directory-save
[license-image]: https://img.shields.io/npm/l/dev-blog-directory-save
[travis-image]: https://img.shields.io/travis/dailyrandomphoto/dev-blog-directory-save
[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
