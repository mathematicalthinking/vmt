'use strict';

const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function (proxy, allowedHost) {
  return {
    compress: true,
    devMiddleware: {
      publicPath: '/',
      writeToDisk: true,
    },
    static: {
      directory: paths.appPublic,
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    client: {
      overlay: false,
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

      devServer.app.use(errorOverlayMiddleware());
      devServer.app.use(noopServiceWorkerMiddleware());
      return middlewares;
    },
  };
};
