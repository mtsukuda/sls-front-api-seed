const _ = require('lodash');
const FS = require('fs');

module.exports.jsonFilePaths = (dirPath) => {
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

module.exports.cleanDirectories = (targetPath) => {
  module.exports.deleteDirectoryRecursive(targetPath);
  FS.mkdirSync(targetPath, (err) => {
    throw err;
  });
}

module.exports.writeDistFile = (distFilePath, buffer) => {
  try {
    FS.writeFileSync(distFilePath, buffer);
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports.appendDistFile = (distFilePath, buffer) => {
  try {
    FS.appendFileSync(distFilePath, buffer);
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports.deleteDirectoryRecursive = (path) => {
  if(FS.existsSync(path)) {
    FS.readdirSync(path).forEach(function(file) {
      let curPath = path + "/" + file;
      if(FS.lstatSync(curPath).isDirectory()) { // recurse
        module.exports.deleteDirectoryRecursive(curPath);
      } else { // delete file
        FS.unlinkSync(curPath);
      }
    });
    FS.rmdirSync(path);
  }
}

module.exports.readWholeFile = (targetPath) => {
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

module.exports.JSONdata = (filePath, log=true) => {
  let fileBuffer = module.exports.readWholeFile(filePath);
  if (fileBuffer === null) return '';
  let jsonData = JSON.parse(fileBuffer);
  if (log) console.log(jsonData);
  return jsonData;
};

module.exports.fileExists = (filePath) => {
  return FS.existsSync(filePath);
};

module.exports.mkDir = (dirPath) => {
  return FS.mkdirSync(dirPath);
};
