const _ = require("lodash");
const gulp = require("gulp");
const gulpFs = require("../gulplib/gulpfs");
const gulpWrite = require("../gulplib/gulpwrite");
const DEBUG = false;
const PACKAGE_JSON = "package.json";
const FRONT_API_FUNCTIONS_CONFIG_JSON_PATH =
  "../seed/functions-config/front-api.json";
const API_FUNCTIONS_CONFIG_JSON_PATH = "../seed/functions-config/api.json";
const FRONT_API_FUNCTIONS_TEMPLATE_PATH = "../seed/functions";
const FRONT_API_SERVERLESS_TEMPLATE_PATH = "../seed";
const FRONT_API_FUNCTIONS_PATH = "../src/functions";

/**
 * Create Functions
 */
gulp.task("create-functions", function (done) {
  gulpWrite.taskName("create-functions");
  if (gulpFs.fileExists(FRONT_API_FUNCTIONS_CONFIG_JSON_PATH) === false) {
    if (gulpFs.fileExists(`${FRONT_API_FUNCTIONS_CONFIG_JSON_PATH}.sample`)) {
      gulpFs.copyFile(
        `${FRONT_API_FUNCTIONS_CONFIG_JSON_PATH}.sample`,
        `${FRONT_API_FUNCTIONS_CONFIG_JSON_PATH}`
      );
    } else {
      throw new Error(
        `Could not find ${FRONT_API_FUNCTIONS_CONFIG_JSON_PATH}.`
      );
    }
  }
  let frontApiFunctionConfig = JSON.parse(
    gulpFs.readWholeFile(FRONT_API_FUNCTIONS_CONFIG_JSON_PATH)
  );
  if (gulpFs.fileExists(API_FUNCTIONS_CONFIG_JSON_PATH) === true) {
    let apiFunctionConfig = JSON.parse(
      gulpFs.readWholeFile(API_FUNCTIONS_CONFIG_JSON_PATH)
    );
    frontApiFunctionConfig.functions = _.concat(
      frontApiFunctionConfig.functions,
      apiFunctionConfig.functions
    );
  }
  console.log(frontApiFunctionConfig);
  gulpFs.cleanDirectories(FRONT_API_FUNCTIONS_PATH);
  _createFunctionPath(frontApiFunctionConfig);
  _createFunctionsIndex(frontApiFunctionConfig);
  _createServerless(frontApiFunctionConfig);
  done();
});

/**
 * gulp default task
 */
gulp.task(
  "default",
  gulp.series(gulp.parallel("create-functions"), function (done) {
    done();
  })
);

let _createFunctionPath = function (frontApiFunctionConfig) {
  console.log(frontApiFunctionConfig);
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    gulpFs.mkDir(`${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}`);
    _createHandler(functionPath);
    _createIndex(functionPath);
    _createSchema(functionPath);
  });
};

let _createHandler = function (functionPath) {
  let handlerFileName = "handler.ts";
  let fileBuffer = gulpFs.readWholeFile(
    `${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${handlerFileName}.tpl`
  );
  fileBuffer = _replaceTag("PATH", functionPath.path, fileBuffer);
  if (functionPath.mock && !functionPath.implement) {
    fileBuffer = _replaceTag(
      "RESPONSE_IMPLEMENT",
      JSON.stringify(functionPath.mock),
      fileBuffer
    );
  } else if (!functionPath.mock && !functionPath.implement) {
    fileBuffer = _replaceTag(
      "RESPONSE_IMPLEMENT",
      `{message: \`I just want to say, F**ck you!🖕\`}`,
      fileBuffer
    );
  }
  if (functionPath.schema) {
    fileBuffer = _replaceTag(
      "SCHEMA_IMPORT",
      `import schema from './schema';`,
      fileBuffer
    );
    fileBuffer = _replaceTag("TYPEOF_SCHEMA", `typeof schema`, fileBuffer);
    // typeof schema --> TYPEOF_SCHEMA
  } else {
    fileBuffer = _replaceTag("SCHEMA_IMPORT", "", fileBuffer);
    fileBuffer = _replaceTag("TYPEOF_SCHEMA", "void", fileBuffer);
  }
  gulpFs.writeDistFile(
    `${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${handlerFileName}`,
    fileBuffer
  );
};

let _createIndex = function (functionPath) {
  let indexFileName = "index.ts";
  let fileBuffer = gulpFs.readWholeFile(
    `${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${indexFileName}.tpl`
  );
  fileBuffer = _replaceTag("METHOD", functionPath.method, fileBuffer);
  fileBuffer = _replaceTag("PATH", functionPath.path, fileBuffer);
  if (functionPath.schema) {
    fileBuffer = _replaceTag(
      "SCHEMA_IMPORT",
      `import schema from './schema';`,
      fileBuffer
    );
    fileBuffer = _replaceTag(
      "SCHEMA",
      `'application/json': schema`,
      fileBuffer
    );
  } else {
    fileBuffer = _replaceTag("SCHEMA_IMPORT", "", fileBuffer);
    fileBuffer = _replaceTag("SCHEMA", "", fileBuffer);
  }
  gulpFs.writeDistFile(
    `${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${indexFileName}`,
    fileBuffer
  );
};

let _createSchema = function (functionPath) {
  let shemaFileName = "schema.ts";
  if (!functionPath.schema) return;
  let fileBuffer = gulpFs.readWholeFile(
    `${FRONT_API_FUNCTIONS_TEMPLATE_PATH}/${shemaFileName}.tpl`
  );
  let schemaString = JSON.stringify(functionPath.schema, null, 2);
  schemaString = schemaString.slice(1).slice(0, -1);
  fileBuffer = _replaceTag("SCHEMA_SET", schemaString, fileBuffer);
  gulpFs.writeDistFile(
    `${FRONT_API_FUNCTIONS_PATH}/${functionPath.path}/${shemaFileName}`,
    fileBuffer
  );
};

let _createFunctionsIndex = function (frontApiFunctionConfig) {
  let functionIndexFileName = "index.ts";
  let exportList = [];
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    let exportLine = `export { default as ${functionPath.path} } from './${functionPath.path}';`;
    exportList.push(exportLine);
  });
  gulpFs.writeDistFile(
    `${FRONT_API_FUNCTIONS_PATH}/${functionIndexFileName}`,
    exportList.join("")
  );
};

let _createServerless = function (frontApiFunctionConfig) {
  let serverlessFileName = "serverless.ts";
  let moduleList = [];
  let fileBuffer = gulpFs.readWholeFile(
    `${FRONT_API_SERVERLESS_TEMPLATE_PATH}/${serverlessFileName}.tpl`
  );
  frontApiFunctionConfig.functions.forEach((functionPath) => {
    moduleList.push(functionPath.path);
  });
  fileBuffer = _replaceTag("FUNCTIONS", moduleList.join(","), fileBuffer);
  let slsProjectPackageJSONPath = `../${PACKAGE_JSON}`;
  let packageJSON = gulpFs.JSONdata(slsProjectPackageJSONPath, false);
  fileBuffer = _replaceTag("PROJECT_NAME", packageJSON.name, fileBuffer);
  gulpFs.writeDistFile(`../${serverlessFileName}`, fileBuffer);
};

let _replaceTag = function (tagString, replaceString, buffer, startWith = "") {
  tagString = new RegExp(startWith + "<!--@@" + tagString + "-->", "g");
  if (DEBUG) console.log("REPLACE: " + tagString + " ==> " + replaceString);
  return buffer.replace(tagString, replaceString);
};
