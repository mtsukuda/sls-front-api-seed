const _ = require('lodash');
const gulp = require('gulp');
const chalk = require('chalk');
const gulpfs = require('../gulplib/gulpfs');
const FRONT_API_FUNCTIONS_CONFIG_JSON_PATH = '../seed/functions/config.json';

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
