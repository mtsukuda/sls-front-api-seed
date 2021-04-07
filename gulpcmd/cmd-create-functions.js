const _ = require('lodash');
const gulp = require('gulp');
const chalk = require('chalk');
const gulpfs = require('../gulplib/gulpfs');
const FRONT_API_FUNCTIONS_CONFIG_JSON_PATH = '../seed/functions/config.json';
const FRONT_API_FUNCTIONS_TEMPLATE_PATH = '../seed/functions';
const FRONT_API_FUNCTIONS_PATH = '../src/functions';

/**
 * Create Functions
 */
gulp.task('create-functions', function (done){
  console.log(' 🚀🚀🚀 ' + chalk.bgBlue(' create-functions ') + ' 🚀🚀🚀 ');
  if(gulpfs.fileExists(FRONT_API_FUNCTIONS_CONFIG_JSON_PATH) === false) {
    throw new Error(`Could not find ${FRONT_API_FUNCTIONS_CONFIG_JSON_PATH}.`);
  }
  let frontApiFunctionConfig = JSON.parse(gulpfs.readWholeFile(FRONT_API_FUNCTIONS_CONFIG_JSON_PATH));
  console.log(frontApiFunctionConfig);
  gulpfs.cleanDirectories(FRONT_API_FUNCTIONS_PATH);
  _createFunctionPath(frontApiFunctionConfig);
  done();
});

/**
 * gulp default task
 */
gulp.task('default',
  gulp.series(gulp.parallel(
    'create-functions',
  ), function (done) {
    done();
  })
);

let _createFunctionPath = function (frontApiFunctionConfig) {
  console.log(frontApiFunctionConfig);
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    _createHandler(functionPath);
  });
};

let _createHandler = function (functionPath) {
  let handlerFileName = 'handler.ts';
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${handlerFileName}.tpl`);
  gulpfs.mkDir(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}`);
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${handlerFileName}`, fileBuffer);
};
