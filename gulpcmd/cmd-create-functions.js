const _ = require('lodash');
const gulp = require('gulp');
const chalk = require('chalk');
const gulpfs = require('../gulplib/gulpfs');
const DEBUG = true;
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
  _createFunctionsIndex(frontApiFunctionConfig);
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
    gulpfs.mkDir(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}`);
    _createHandler(functionPath);
    _createIndex(functionPath);
  });
};

let _createHandler = function (functionPath) {
  let handlerFileName = 'handler.ts';
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${handlerFileName}.tpl`);
  fileBuffer = _replaceTag('PATH', functionPath.path, fileBuffer);
  if (functionPath.schema) {
    // import schema from './schema'; --> SCHEMA_IMPORT
    // typeof schema --> TYPEOF_SCHEMA
  } else {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', '', fileBuffer);
    fileBuffer = _replaceTag('TYPEOF_SCHEMA', 'void', fileBuffer);
  }
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${handlerFileName}`, fileBuffer);
};

let _createIndex = function (functionPath) {
  let handlerFileName = 'index.ts';
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${handlerFileName}.tpl`);
  fileBuffer = _replaceTag('METHOD', functionPath.method, fileBuffer);
  fileBuffer = _replaceTag('PATH', functionPath.path, fileBuffer);
  if (functionPath.schema) {
    // import schema from './schema'; --> SCHEMA_IMPORT
    // 'application/json': schema --> SCHEMA_IMPORT
  } else {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', '', fileBuffer);
    fileBuffer = _replaceTag('SCHEMA_IMPORT', '', fileBuffer);
  }
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${handlerFileName}`, fileBuffer);
};

let _createFunctionsIndex = function (frontApiFunctionConfig) {
  let handlerFileName = 'index.ts';
  let exportList = [];
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    let exportLine = `export { default as ${functionPath.path} } from './${functionPath.path}';`;
    exportList.push(exportLine);
  });
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${handlerFileName}`, exportList.join());
};

let _replaceTag = function (tagString, replaceString, buffer, startWith='') {
  tagString = new RegExp(startWith + '<!--@@' + tagString + '-->','g');
  if (DEBUG) console.log('REPLACE: ' + tagString + ' ==> ' + replaceString);
  return buffer.replace(tagString, replaceString);
};
