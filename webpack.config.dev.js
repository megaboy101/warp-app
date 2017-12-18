const path = require('path'),
      webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  
  entry: [
    './src/index.js'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  }
}