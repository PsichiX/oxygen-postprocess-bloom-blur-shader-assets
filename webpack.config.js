var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'bin');
var LIB_DIR = path.resolve(__dirname, 'src');

var config = {
  mode: 'production',
  entry: [
    LIB_DIR + '/index.js'
  ],
  module: {
    rules: [
      { test : /\.jsx?$/, include : LIB_DIR, loader : 'babel-loader' }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'oxygen-postprocess-bloom-blur-shader-assets.js',
    library: 'OxygenPostprocessBloomBlurShaderAssets',
    libraryTarget: 'umd',
  },
  externals: {
    'oxygen-core': {
      commonjs: 'oxygen-core',
      commonjs2: 'oxygen-core',
      amd: 'oxygen-core',
      root: 'OxygenCore',
    },
  },
};

module.exports = config;
