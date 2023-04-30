const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'boundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     title: "My Web App",
  //     template: "./src/template.html",
  //     // this is a workaround for the injection of the code from the output file into the .html
  //     // the injection will be handled in the template file
  //     inject: false,
  //   })
  // ],
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     'css-loader'
      //   ]
      // },
    ],
  },
  mode: "development",
  watch: true,
};