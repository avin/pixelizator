var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var argv = require('yargs').argv;

var rootDir = path.resolve(__dirname, '../');

var node_modules = path.resolve(rootDir, 'node_modules');

module.exports = {
    context: rootDir,
    resolve: {
        extensions: ['', '.js', '.jsx'],
        root: [
            path.resolve('./src'),
        ]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: (argv.inline && argv.hot ? [
                    'react-hot',
                    'babel'
                ] : [
                    'babel'
                ] ),
                exclude: [
                    /node_modules/,
                ],
                include: path.join(__dirname, '../src')
            },
            {
                test: /\.less$/,
                //exclude: [/node_modules/],
                loader: 'style!css!postcss-loader!less'

            },
            {
                test: /\.css/,
                //exclude: [/node_modules/],
                loader: 'style!css'

            },
            {
                test: /(\.gif|\.png)/,
                //exclude: [/node_modules/],
                loader: 'url?limit=10000'

            },
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader'
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'})
    ]
};