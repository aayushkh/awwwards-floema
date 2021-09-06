const path = require('path');
const { merge } = require('webpack-merge');

const config = require('./webpack.config');

module.exports = merge(config, {
  // Providing the mode configuration option tells webpack to use its built-in
  // optimizations accordingly.
  mode: 'development',

  // This option controls if and how source maps are generated.
  devtool: 'inline-source-map',

  // This set of options is picked up by webpack-dev-server and can be used to
  // change its behavior in various ways.
  devServer: {
    // Tells devServer to write generated assets to the disk.
    // The output is written to the output.path directory.
    allowedHosts: 'auto',
  },

  // The top-level output key contains set of options instructing webpack on how
  // and where it should output your bundles, assets and anything else you
  // bundle or load with webpack.
  output: {
    path: path.resolve(__dirname, 'public'),
  },
});
