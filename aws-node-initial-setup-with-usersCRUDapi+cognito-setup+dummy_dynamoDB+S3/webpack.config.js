const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");

const config = {
  entry: {
    S3Upload: "./S3Upload/index.js",
    Users: "./Users/index.js"
  },
  output: {
    filename: "[name]/index.js",
    path: path.resolve(__dirname, "dist/"),
    libraryTarget: "umd"
  },
  target: "node",
  mode: "production",
  optimization: { minimize: false }
};
const pluginConfig = {
  plugins: Object.keys(config.entry).map(entryName => {
    return new ZipPlugin({
      path: path.resolve(__dirname, "dist/"),
      filename: entryName,
      extension: "zip",
      include: [entryName]
    });
  })
};
const webpackConfig = Object.assign(config, pluginConfig);
module.exports = webpackConfig;
