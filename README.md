# rollup-plugin-typescript-path-mapping
Resolving module path which  applies typescript's path mapping rule, see `Path mapping` in [official doc](http://www.typescriptlang.org/docs/handbook/module-resolution.html)

## why?
When we configure some path mapping rules in `tsconfig.json`, typescript compiler can resolve module paths correctly using the rule you just configured, however, typescript does not rewrite module path in emitted .js files, thus rollup could not resolve modules correctly when you try packing those emitted .js files. To solve this, you have to write another corresponding rule that rollup recognizes using some plugins. \
When using this plugin, it can read the path mapping rule directly in `tsconfig.json` and adapte it to
rollup automatically, there is nothing else you need to do :)

# Installation
`$ npm install rollup-plugin-typescript-path-mapping`

# Usage
```js
// rollup.config.js
const rollupPluginTypescriptPathMapping = require('rollup-plugin-typescript-path-mapping')

module.exports = {
    input: 'dist/main.js',
    output: {
        file: 'bundle.js',
        format: 'iife'
    },
    plugins: [rollupPluginTypescriptPathMapping({ tsconfig: true })]
}
```
there is some path mapping rules configured in `tsconfig.json`
```json
{
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "base/*": ["src/base/*"],
            "util/*": ["src/common/util/*"],
        },
        "outDir": "dist",
        "module": "es2015",
        "target": "es2015"
    }
}
```
then just rollup these files that typescript compiled \
`$ rollup -c`

of course, you can manually configure rule
```js
// rollup.config.js
const rollupPluginTypescriptPathMapping = require('rollup-plugin-typescript-path-mapping')

module.exports = {
    input: 'dist/main.js',
    output: {
        file: 'bundle.js',
        format: 'iife'
    },
    plugins: [rollupPluginTypescriptPathMapping({
       baseUrl: './',
       paths: {
            'base/*': ['src/base/*'],
            'util/*': ['src/common/util/*'],
        },
        redirectDir: 'dist'
    })]
}
```


