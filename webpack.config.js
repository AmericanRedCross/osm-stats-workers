const path = require("path");

const webpack = require("webpack");

const config = {
  target: "node",
  entry: {
    housekeeping: "./functions/azure/housekeeping/index.js"
  },
  output: {
    path: path.resolve(__dirname, "dist", "azure"),
    filename: "[name]/index.js",
    libraryTarget: "commonjs-module"
  },
  devtool: "eval",
  plugins: [new webpack.NamedModulesPlugin()],
  resolve: {
    extensions: [".js"]
  },
  externals: {
    "pg-native": "pg-native"
  }
};

if (process.env.NODE_ENV === "production") {
  config.devtool = "source-map";
  config.plugins = [
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()
  ];
}

module.exports = config;
