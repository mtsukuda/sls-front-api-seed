const _ = require('lodash');
const gulp = require('gulp');
const chalk = require('chalk');
const gulpfs = require('../gulplib/gulpfs');
const DEBUG = true;
const PACKAGE_JSON = 'package.json';
const FRONT_API_FUNCTIONS_CONFIG_JSON_PATH = '../seed/functions/config.json';
const FRONT_API_FUNCTIONS_TEMPLATE_PATH = '../seed/functions';
const FRONT_API_SERVERLESS_TEMPLATE_PATH = '../seed';
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
  _createServerless(frontApiFunctionConfig);
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
    _createSchema(functionPath);
  });
};

let _createHandler = function (functionPath) {
  let handlerFileName = 'handler.ts';
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${handlerFileName}.tpl`);
  fileBuffer = _replaceTag('PATH', functionPath.path, fileBuffer);
  if (functionPath.schema) {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', `import schema from './schema';`, fileBuffer);
    fileBuffer = _replaceTag('TYPEOF_SCHEMA', `typeof schema`, fileBuffer);
    // typeof schema --> TYPEOF_SCHEMA
  } else {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', '', fileBuffer);
    fileBuffer = _replaceTag('TYPEOF_SCHEMA', 'void', fileBuffer);
  }
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${handlerFileName}`, fileBuffer);
};

let _createIndex = function (functionPath) {
  let indexFileName = 'index.ts';
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${indexFileName}.tpl`);
  fileBuffer = _replaceTag('METHOD', functionPath.method, fileBuffer);
  fileBuffer = _replaceTag('PATH', functionPath.path, fileBuffer);
  if (functionPath.schema) {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', `import schema from './schema';`, fileBuffer);
    fileBuffer = _replaceTag('SCHEMA', `'application/json': schema`, fileBuffer);
  } else {
    fileBuffer = _replaceTag('SCHEMA_IMPORT', '', fileBuffer);
    fileBuffer = _replaceTag('SCHEMA', '', fileBuffer);
  }
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${indexFileName}`, fileBuffer);
};

let _createSchema = function (functionPath) {
  let shemaFileName = 'schema.ts';
  if (!functionPath.schema) return;
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${shemaFileName}.tpl`);
  let schemaString = JSON.stringify(functionPath.schema, null, 2);
  schemaString = schemaString.slice(1).slice(0, -1);
  fileBuffer = _replaceTag('SCHEMA_SET', schemaString, fileBuffer);
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${shemaFileName}`, fileBuffer);
};

let _createFunctionsIndex = function (frontApiFunctionConfig) {
  let functionIndexFileName = 'index.ts';
  let exportList = [];
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    let exportLine = `export { default as ${functionPath.path} } from './${functionPath.path}';`;
    exportList.push(exportLine);
  });
  gulpfs.writeDistFile(`${FRONT_API_FUNCTIONS_PATH}/${functionIndexFileName}`, exportList.join(''));
};

let _createServerless = function (frontApiFunctionConfig) {
  let serverlessFileName = 'serverless.ts';
  let moduleList = [];
  let fileBuffer = gulpfs.readWholeFile(`${FRONT_API_SERVERLESS_TEMPLATE_PATH}/${serverlessFileName}.tpl`);
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    moduleList.push(functionPath.path);
  });
  fileBuffer = _replaceTag('FUNCTIONS', moduleList.join(','), fileBuffer);
  let slsProjectPackageJSONPath = `../${PACKAGE_JSON}`;
  let packageJSON = gulpfs.JSONdata(slsProjectPackageJSONPath, false);
  fileBuffer = _replaceTag('PROJECT_NAME', packageJSON.name, fileBuffer);
  gulpfs.writeDistFile(`../${serverlessFileName}`, fileBuffer);
};

let _replaceTag = function (tagString, replaceString, buffer, startWith='') {
  tagString = new RegExp(startWith + '<!--@@' + tagString + '-->','g');
  if (DEBUG) console.log('REPLACE: ' + tagString + ' ==> ' + replaceString);
  return buffer.replace(tagString, replaceString);
};
