[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Travis](https://api.travis-ci.com/adornala/aForms.svg?branch=main)](https://api.travis-ci.com/adornala/aForms.svg?branch=main)
[![Dev Dependencies](https://status.david-dm.org/gh/adornala/aForms.svg)](https://status.david-dm.org/gh/adornala/aForms.svg)
[![Inline docs](http://inch-ci.org/github/adornala/aForms.svg?branch=main)](http://inch-ci.org/github/adornala/aForms)
[![HitCount](http://hits.dwyl.com/adornala/aForms.svg)](http://hits.dwyl.com/adornala/aForms)
[![Known Vulnerabilities](https://snyk.io/test/github/adornala/aForms/badge.svg?targetFile=package.json)](https://snyk.io/test/github/adornala/aForms?targetFile=package.json)

# AForms

Enhanced forms library built using fomantic-ui, jQuery and form.io.

## Features

- Typescript ES Modules
- Customizable styles using [Fomantic-ui](https://fomantic-ui.com/) - 2.8 and up
- Enhancing json generated using [formio.js](https://github.com/formio/formio.js)
- ADA Compatible

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Usage

You can download the library from npm using `npm i @aforms/aformsjs -D`

Please note that this library requires jquery, ensure the build tool is properly setup.

### Developer environment (Customizations)

For developers who intend to develop or use the library with typescript:

    - import { AFormModelClass } from '@aforms/aformsjs'

Since library uses jquery, and it's plugins you need to add jquery to your tsconfig.

- Install jquery `npm i @types/jquery -D`
- Add jquery to types array in tsconfig
  

    {
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "outDir": "../../dist/out-tsc",
            "types": [
                **"jquery"**
                ]
            },
            "files": [
                "./../../node_modules/@aforms/aformsjs/src/typings.d.ts",
                "./../../node_modules/@aforms/aformsjs/src/index.ts"
            ],
        "include": []
    }

This will ensure your typescript compiler can read all required modules properly, additionally you get the comfort of
debugging source code using typescript.

For accessing as javascript use 

    - import { AFormModelClass } from '@aforms/aformsjs/build' for es modules
    - import { AFormModelClass } from '@aforms/aformsjs/build/cjs/a-forms.cjs.js' for cjs
    - import { AFormModelClass } from '@aforms/aformsjs/build/umd/a-forms.umd.js' for umd

## License

[The MIT License (MIT)](./LICENSE.md)
