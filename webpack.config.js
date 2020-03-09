// webpack.config.js
const webpack = require('webpack');
const slsw = require('serverless-webpack');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  resolve: {
    alias: {
      openpgp: 'openpgp/src/index.js',
    }
  },
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'global.GENTLY': false
    }),
    new webpack.ContextReplacementPlugin(
      /openpgp/,
      '',
      {
        crypto: 'crypto',
        stream: 'stream',
        buffer: 'buffer',
        zlib: 'zlib',
        util: 'util'
      }
    )
  ]
};