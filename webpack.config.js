'use strict';

module.exports = {
    entry: {
        game: './app/main',
        phaser: './node_modules/phaser/build/phaser',
        redux: './node_modules/redux/dist/redux'
    },

    output: {
        filename: '[name].bundle.js',
        path: './public/dist'
    },

    // devtool: '#source-map',

    module: {
        loaders: [
            {
                test: /phaser\.js$/,
                loader: 'script-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
};
