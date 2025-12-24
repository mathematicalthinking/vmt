'use strict';

const ignoredFiles = require('react-dev-utils/ignoredFiles');
const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function (proxy, allowedHost) {
  return {
    compress: true,
    devMiddleware: {
      publicPath: '/',
      writeToDisk: false,
      stats: 'errors-only',
    },
    static: {
      directory: paths.appPublic,
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    client: {
      overlay: false,
      logging: 'none',
    },
    hot: true,
    https: protocol === 'https',
    host: host,
    historyApiFallback: {
      disableDotRule: true,
    },
    allowedHosts: allowedHost ? [allowedHost] : 'all',
    proxy,
    onBeforeSetupMiddleware: undefined,
    onAfterSetupMiddleware: undefined,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      return middlewares;
    },
  };
};
