const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev';

const dirApp = path.join(__dirname, 'src');
const dirShared = path.join(__dirname, 'shared');
const dirStyles = path.join(__dirname, 'styles');

const dirNode = 'node_modules';

module.exports = {
  // The entry object is where webpack looks to start building the bundle.
  entry: [
    path.join(dirApp, 'index.js'),
    path.join(dirStyles, 'index.scss'),
  ],

  // These options change how modules are resolved.
  resolve: {
    // Tell webpack what directories should be searched when resolving modules.
    modules: [
      dirApp,
      dirShared,
      dirStyles,
      dirNode
    ]
  },

  plugins: [
    // The DefinePlugin replaces variables in your code with other values or
    // expressions at compile time.
    new webpack.DefinePlugin({
      IS_DEVELOPMENT
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: './shared',
          to: '',  // root
          noErrorOnMissing: true
        }
      ]
    }),

    new MiniCssExtractPlugin({
      // This option determines the name of each output CSS file
      filename: '[name].css',
      // This option determines the name of non-entry chunk files
      chunkFilename: '[id].css'
    }),

    new ImageMinimizerPlugin({
      minimizerOptions: {
        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          // interlaced: Interlace gif for progressive rendering.
          ["gifsicle", { interlaced: true }],

          // progressive: Lossless conversion to progressive.
          ["jpegtran", { progressive: true }],

          // optimizationLevel (0-7): The optimization level 0 enables a set of
          // optimization operations that require minimal effort
          ["optipng", { optimizationLevel: 5 }],
        ],
      },
    }),
  ],

  // These options determine how the different types of modules within a project
  // will be treated.
  module: {
    rules: [
      {
        // Include all modules that pass test assertion
        test: /\.js$/,
        // Rule.use can be an array of UseEntry which are applied to modules.
        // Each entry specifies a loader to be used.
        use: {
          loader: 'babel-loader'
        }
      },

      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },

      {
        test: /\.(jpe?g|png|gif|svg|woff2?|fnt|webp)$/,
        loader: 'file-loader',
        options: {
          name (file) {
            return '[hash].[ext]'
          }
        }
      },

      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
          },
        ],
      },

      {
        test: /\.(glsl|frag|vert)$/,
        type: 'asset/source', // replaced raw-loader
        exclude: /node_modules/,
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/,
      },

    ]
  }
}
