import commonjs from '@rollup/plugin-commonjs'
// import copy from 'rollup-plugin-copy'
import { babel } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import replace from '@rollup/plugin-replace'
import sourceMaps from 'rollup-plugin-sourcemaps';

// const escape = require('lodash.escape');
// const camelCase = require('lodash.camelcase')

import json from '@rollup/plugin-json';
// @ts-ignore
import generatePackageJson from 'rollup-plugin-generate-package-json';

const pkg = require('./package.json')

export default {
   input: `src/index.ts`,
   output: [
      { file: 'dist/a-forms.cjs.js', name: pkg.name, format: 'cjs', sourcemap: true },
      { file: 'dist/a-forms.umd.js', name: pkg.name, format: 'umd', sourcemap: true },
      { file: 'dist/a-forms.es.js', format: 'es', sourcemap: true },
      { file: 'dist/a-forms.cjs.min.js', name: pkg.name, format: 'cjs', sourcemap: true },
      { file: 'dist/a-forms.umd.min.js', name: pkg.name, format: 'umd', sourcemap: true, globals: {$: 'jquery'}}
   ],
   // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
   external: [
       'jquery'
   ],
   watch: {
      include: 'src/**',
   },
   plugins: [
      // Allow json resolution
      json(),
      // Compile TypeScript files
      typescript({
         tsconfig: './tsconfig.rollup.json'
      }),
      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs({ extensions: ['.js', '.ts'],
         dynamicRequireTargets: [
             'semantic/dist/semantic.js',
             'node_modules/jquery/dist/jquery.js'
         ]
      }),
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      nodeResolve(),
      // Resolve source maps to the original source
      sourceMaps(),
      babel({ babelHelpers: 'bundled'}),
      generatePackageJson({
         baseContents: () => ({
            name: pkg.name,
            main: "a-forms.cjs.js",
            module: "a-forms.esm.js",
            browser: "a-forms.umd.js",
            typings: "index.d.ts",
            dependencies: {
               "jquery": "^3.5.1"
            },
            private: false
         })
      })
   ]
}
