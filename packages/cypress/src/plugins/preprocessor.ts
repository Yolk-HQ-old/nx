import * as wp from '@cypress/webpack-preprocessor';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import * as nodeExternals from 'webpack-node-externals';

export function preprocessTypescript(
  config: any,
  customizeWebpackConfig: (webpackConfig: any) => any
) {
  if (!config.env.tsConfig) {
    throw new Error(
      'Please provide an absolute path to a tsconfig.json as cypressConfig.env.tsConfig'
    );
  }

  let webpackConfig = getWebpackConfig(config);
  if (customizeWebpackConfig) {
    webpackConfig = customizeWebpackConfig(webpackConfig);
  }
  return wp({
    webpackOptions: webpackConfig
  });
}

export function getWebpackConfig(config: any) {
  const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx'];
  return {
    resolve: {
      extensions,
      plugins: [
        new TsconfigPathsPlugin({
          configFile: config.env.tsConfig,
          extensions
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          loader: 'ts-loader',
          exclude: [/node_modules/],
          options: {
            configFile: config.env.tsConfig,
            // https://github.com/TypeStrong/ts-loader/pull/685
            experimentalWatchApi: true
          }
        }
      ]
    },
    plugins: [],
    externals: [nodeExternals()]
  };
}
