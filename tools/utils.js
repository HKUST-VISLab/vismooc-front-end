'use strict';
const path = require('path');
const config = require('../config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports.assetsPath = tempPath => path.posix.join(config.assetsSubDirectory, tempPath);

module.exports.cssLoaders = (options = {}) => {
    // generate loader array to be used with extract text plugin
    function generateLoaders(loaders) {
        const sourceLoaders = loaders.map(loader => {
            let extraParamChar;
            let newLoader = loader;
            if (/\?/.test(newLoader)) {
                newLoader = loader.replace(/\?/, '-loader?');
                extraParamChar = '&';
            } else {
                newLoader = `${newLoader}-loader`;
                extraParamChar = '?';
            }
            return `${newLoader}${options.sourceMap ? extraParamChar+'sourceMap' : ''}`;
        });

        if (options.extract) {
            return ExtractTextPlugin.extract({
                fallback: 'vue-style-loader',
                use: sourceLoaders
            });
        }
        sourceLoaders.unshift('vue-style-loader');
        return sourceLoaders;
    }
    // http://vuejs.github.io/vue-loader/configurations/extract-css.html
    return {
        css: generateLoaders(['css']),
        postcss: generateLoaders(['css']),
        less: generateLoaders(['css', 'less']),
        sass: generateLoaders(['css', 'sass?indentedSyntax']),
        scss: generateLoaders(['css', 'sass']),
        stylus: generateLoaders(['css', 'stylus']),
        styl: generateLoaders(['css', 'stylus']),
    };
};

// Generate loaders for standalone style files (outside of .vue)
module.exports.styleLoaders = options => {
    const output = [];
    const loaders = module.exports.cssLoaders(options);
    Object.keys(loaders).forEach(extension => {
        const loader = loaders[extension];
        output.push({
            test: new RegExp(`\\.${extension}$`),
            use: loader,
        });
    });
    return output;
};
