const path = require('path');

const webpack = require('webpack');

const config = {
  target: 'node',
  entry: './functions/azure/worker/index.js',
  output: {
    path: path.resolve(__dirname, 'dist', 'azure', 'worker'),
    filename: 'index.js',
    libraryTarget: 'commonjs-module'
  },
  devtool: 'eval',
  plugins: [
    new webpack.NamedModulesPlugin()
  ],
  resolve: {
    extensions: ['.js']
  },
  externals: {
    // Possible drivers for knex - we'll ignore them
    sqlite3: 'sqlite3',
    mariasql: 'mariasql',
    mssql: 'mssql',
    mysql: 'mysql',
    mysql2: 'mysql2',
    oracle: 'oracle',
    oracledb: 'oracledb',
    'strong-oracle': 'strong-oracle',
    'pg-native': 'pg-native',
    'pg-query-stream': 'pg-query-stream',
    // for request-promise
    'cls-bluebird': 'cls-bluebird'
  }
};

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map';
  config.plugins = [
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()
  ];
}

module.exports = config;
