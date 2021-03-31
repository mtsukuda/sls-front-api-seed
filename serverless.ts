import type { AWS } from '@serverless/typescript';

import { echo } from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'sls-front-api-seed',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    output: {
      // handler: 'scripts/output.handler',
      file: '.serverless/stack.json'
    }
  },
  plugins: ['serverless-webpack', 'serverless-stack-output'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: "ap-northeast-1",
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
  },
  functions: { echo }
}

module.exports = serverlessConfiguration;
