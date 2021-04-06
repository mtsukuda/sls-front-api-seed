const _ = require('lodash');
const FS = require('fs');

exports.jsonFilePaths = (dirPath) => {
  let allFiles = FS.readdirSync(dirPath);
  if (allFiles && _.isArray(allFiles)) {
    let jsonFilePathList = allFiles.filter(function (filePath) {
      return FS.statSync(`${dirPath}/${filePath}`).isFile() && /.*\.json$/.test(filePath);
    });
    jsonFilePathList = jsonFilePathList.map(filePath => `${dirPath}/${filePath}`);
    return jsonFilePathList;
  }
  return null;
}

exports.cleanDirectories = (targetPath) => {
  this.deleteDirectoryRecursive(targetPath);
  FS.mkdirSync(targetPath, (err) => {
    throw err;
  });
}

exports.writeDistFile = (distFilePath, buffer) => {
  try {
    FS.writeFileSync(distFilePath, buffer);
    return true;
  } catch (err) {
    throw err;
  }
}

exports.appendDistFile = (distFilePath, buffer) => {
  try {
    FS.appendFileSync(distFilePath, buffer);
    return true;
  } catch (err) {
    throw err;
  }
}

exports.deleteDirectoryRecursive = (path) => {
  if(FS.existsSync(path)) {
    FS.readdirSync(path).forEach(function(file) {
      let curPath = path + "/" + file;
      if(FS.lstatSync(curPath).isDirectory()) { // recurse
        this.deleteDirectoryRecursive(curPath);
      } else { // delete file
        FS.unlinkSync(curPath);
      }
    });
    FS.rmdirSync(path);
  }
}

exports.readWholeFile = (targetPath) => {
  try {
    return FS.readFileSync(targetPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Could not find: "${targetPath}"`);
      return null;
    }
    console.log(err);
    return null;
  }
}

exports.JSONdata = (filePath, log=true) => {
  let fileBuffer = this.readWholeFile(filePath);
  if (fileBuffer === null) return '';
  let jsonData = JSON.parse(fileBuffer);
  if (log) console.log(jsonData);
  return jsonData;
};

exports.fileExists = (filePath) => {
  return FS.existsSync(filePath);
};
