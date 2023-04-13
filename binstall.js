var fs = require("fs");
var axios = require("axios");
var tar = require("tar");
var zlib = require("zlib");
var unzip = require("unzip-stream");

function binstall(url, path, options) {
  if (url.endsWith(".zip")) {
    return unzipUrl(url, path, options);
  } else {
    return untgz(url, path, options);
  }
}

function untgz(url, path, options) {
  options = options || {};

  var verbose = options.verbose;
  var verify = options.verify;

  return new Promise(function (resolve, reject) {
    var untar = tar
      .x({ cwd: path })
      .on("error", function (error) {
        reject("Error extracting " + url + " - " + error);
      })
      .on("end", function () {
        var successMessage = "Successfully downloaded and processed " + url;

        if (verify) {
          verifyContents(verify)
            .then(function () {
              resolve(successMessage);
            })
            .catch(reject);
        } else {
          resolve(successMessage);
        }
      });

    var gunzip = zlib.createGunzip().on("error", function (error) {
      reject("Error decompressing " + url + " " + error);
    });

    try {
      fs.mkdirSync(path);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }

    if (verbose) {
      console.log("Downloading binaries from " + url);
    }

    axios
      .get(url, { responseType: "stream" })
      .then((response) => {
        response.data.pipe(gunzip).pipe(untar);
      })
      .catch((error) => {
        if (verbose) {
          console.error(error);
        } else {
          console.error(error.message);
        }
      });
  });
}

function unzipUrl(url, path, options) {
  options = options || {};

  var verbose = options.verbose;
  var verify = options.verify;

  return new Promise(function (resolve, reject) {
    var writeStream = unzip
      .Extract({ path: path })
      .on("error", function (error) {
        reject("Error extracting " + url + " - " + error);
      })
      .on("entry", function (entry) {
        console.log("Entry: " + entry.path);
      })
      .on("close", function () {
        var successMessage = "Successfully downloaded and processed " + url;

        if (verify) {
          verifyContents(verify)
            .then(function () {
              resolve(successMessage);
            })
            .catch(reject);
        } else {
          resolve(successMessage);
        }
      });

    if (verbose) {
      console.log("Downloading binaries from " + url);
    }

    axios
      .get(url, { responseType: "stream" })
      .then((response) => {
        response.data.pipe(writeStream);
      })
      .catch((error) => {
        if (verbose) {
          console.error(error);
        } else {
          console.error(error.message);
        }
      });
  });
}

function verifyContents(files) {
  return Promise.all(
    files.map(function (filePath) {
      return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
          if (err) {
            reject(filePath + " was not found.");
          } else if (!stats.isFile()) {
            reject(filePath + " was not a file.");
          } else {
            resolve();
          }
        });
      });
    })
  );
}

module.exports = binstall;
