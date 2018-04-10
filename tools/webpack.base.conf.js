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
    transformToRequire: {
        video: 'src',
        source: 'src',
        img: 'src',
        image: 'xlink:href'
    }
};

module.exports = {
    entry: {
        app: ['./src/main.js'],
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'src': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components'),
            'containers': resolve('src/containers'),
            'store': resolve('src/store'),
            'service':resolve('src/service'),
            'thirdParty': resolve('src/thirdParty'),
            "video.js$": resolve('node_modules/video.js/dist/video.es.js'),
            'vue': 'vue/dist/vue.js',
        },
    },
    module: {
        rules: [{
            test: /\.(js|vue)$/,
            enforce: 'pre',
            use: {
                loader: 'eslint-loader',
                options: { formatter: eslintFormatter },
            },
            include: [resolve('src'), resolve('test')],
            exclude: [resolve('src/thirdParty')]
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
            include: [resolve('src'), resolve('test')]
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
            // $: 'jquery',
            // jQuery: 'jquery',
            d3: 'd3',
        }),
    ],
};
