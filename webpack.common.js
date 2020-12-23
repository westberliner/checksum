const path = require('path')

module.exports = {
  entry: {
    main: path.join(__dirname, 'src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'checksum.[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
}
