var _ = require('lodash');
var baseConfig = require('./base.config');
var path = require('path');
var webpack = require('webpack');


var config = _.merge(baseConfig, {
    devtool: 'eval',
    entry:[
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/app/index.js'
    ],
    output: {
        path: path.resolve(__dirname, '../web/build'),
        publicPath: '/build/',
        //publicPath: "http://localhost:3000/build/",
        filename: 'bundle.js',
        //pathinfo: true,
    },
    devServer: {
        contentBase: path.resolve(__dirname, '../web'),
        //publicPath: path.resolve(__dirname, '../web'),
        publicPath: '/build/',
        port: 3000,
        historyApiFallback: true,
        proxy: {
            '/wcf.tablet/*': {
                target: 'http://srv-tm-1/',
                //target: 'http://localhost/',
                secure: false
            }
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'DEVELOPMENT': true
        })
    ].concat(baseConfig.plugins),

});

module.exports = config ;