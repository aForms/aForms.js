import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import {babel} from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';

import json from '@rollup/plugin-json';
// @ts-ignore
import generatePackageJson from 'rollup-plugin-generate-package-json';

const pkg = require('./package.json')

export default {
    input: `src/index.ts`,
    output: [
        {file: 'dist/build/cjs/a-forms.cjs.js', name: pkg.name, format: 'cjs', sourcemap: true},
        {file: 'dist/build/umd/a-forms.umd.js', name: pkg.name, format: 'umd', sourcemap: true},
        {file: 'dist/build/es/a-forms.es.js', format: 'es', sourcemap: true},
        {file: 'dist/build/cjs/a-forms.cjs.min.js', name: pkg.name, format: 'cjs', sourcemap: true},
        {file: 'dist/build/umd/a-forms.umd.min.js', name: pkg.name, format: 'umd', sourcemap: true, globals: {$: 'jquery'}}
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [
        'jquery',
        /@babel\/runtime/
    ],
    watch: {
        include: 'src/**',
    },
    plugins: [
        // Allow json resolution
        json(),
        // Compile TypeScript files
        typescript({
            tsconfig: './tsconfig.rollup.json',
            inlineSources: true
        }),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs({
            extensions: ['.js', '.ts'],
            dynamicRequireTargets: [
                'semantic/dist/semantic.js',
                'node_modules/jquery/dist/jquery.js'
            ]
        }),
        copy({
            targets: [
                { src: 'src', dest: 'dist' },
                { src: ['README.md', "LICENSE.md", "code-of-conduct.md" ], dest: 'dist' }
            ]
        }),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        nodeResolve(),
        // Resolve source maps to the original source
        sourceMaps(),
        babel({babelHelpers: 'runtime', plugins: ['@babel/plugin-transform-runtime']}),
        generatePackageJson({
            outputFolder: 'dist',
            baseContents: () => ({
                name: pkg.name,
                description: pkg.description,
                main: "build/index.js",
                cjs: "build/cjs/a-forms.cjs.js",
                module: "src/index.ts",
                type: "module",
                types: "build/index.d.ts",
                author: pkg.author,
                repository: pkg.repository,
                license: pkg.license,
                homepage: pkg.homepage,
                dependencies: {
                    "json-logic-js": "^2.0.0",
                    "@reduxjs/toolkit": "^1.5.0",
                    "redux-undo": "^1.0.1",
                },
                peerDependencies: {
                    "jquery": "^3.5.1",
                    "fomantic-ui-css": "^2.8.7"
                },
                private: false
            })
        })
    ]
}
