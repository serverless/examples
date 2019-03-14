const slsw = require('serverless-webpack')
const webpack = require('webpack')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  },
  externals: ['sharp', 'aws-sdk']
}
