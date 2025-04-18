const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        content: './content.js',
        popup: './popup.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new Dotenv()
    ]
};
