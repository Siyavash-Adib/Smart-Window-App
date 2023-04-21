const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'boundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  mode: "development",
  watch: true,
};