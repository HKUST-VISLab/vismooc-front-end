'use strict';

const webpack = require('webpack');
const path = require('path');
const config = require('../config');
const utils = require('./utils');
const eslintFormatter = require('eslint-friendly-formatter');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}
const isProduction = process.env.NODE_ENV === 'production';
const vueLoaderOptions = {
    loaders: utils.cssLoaders({
        sourceMap: isProduction ?
            config.build.productionSourceMap : config.dev.cssSourceMap,
        extract: isProduction,
    }),
    postcss: [
        require('autoprefixer')({
            browsers: ['last 2 versions'],
        }),
    ],
};

module.exports = {
    entry: {
        app: ['./src/main.js'],
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        modules: [resolve('src'), resolve('node_modules')],
        alias: {
            src: resolve('src'),
            assets: resolve('src/assets'),
            components: resolve('src/components'),
            'vue-tagsinput$': 'vue-tagsinput/src/input.vue'
        },
    },
    module: {
        rules: [{
            test: /\.(js|vue)$/,
            use: {
                loader: 'eslint-loader',
                options: { formatter: eslintFormatter },
            },
            enforce: 'pre',
            include: [resolve('src'), resolve('tests')],
        },
        {
            test: /\.vue$/,
            use: {
                loader: 'vue-loader',
                options: vueLoaderOptions,
            },
        },
        {
            test: /\.js$/,
            use: 'babel-loader',
            include: [resolve('src'), resolve('tests'),
            resolve('node_modules/vue-tagsinput/src')
            ]
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('image/[name].[hash:7].[ext]'),
                },
            },
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
                },
            },
        },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            d3: 'd3',
        }),
    ],
};
