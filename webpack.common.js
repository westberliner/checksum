const path = require('path')
const {merge} = require('webpack-merge')
const webpackConfig = require('@nextcloud/webpack-vue-config')

module.exports = merge(webpackConfig, {
  entry: {
    main: path.join(__dirname, 'src/main.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'checksum.[name].js',
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
});
