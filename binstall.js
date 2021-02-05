var fs = require("fs");
var path = require("path");
var request = require("request");
var tar = require("tar");
var zlib = require("zlib");
var unzip = require("unzip-stream");

// A map between file extension and behavior
const binstallBehaviors = {
  zip: unzipUrl,
  tgz: untgz,
}

function binstall(url, unpackedPath, options) {
  const fileDots = url.split('.');
  const fileExtension = fileDots[fileDots.length - 1]
  let behavior = binstallBehaviors[fileExtension]
  if (!behavior) {
    behavior = downloadBin
  }
  return behavior(url, unpackedPath, options)
}

function untgz(url, unpackedPath, options) {
  options = options || {};

  var verbose = options.verbose;
  var verify = options.verify;

  if (verbose) {
    console.info('Downloading and unpacking tar')
  }

  return new Promise(function(resolve, reject) {
    var untar = tar
      .x({ cwd: unpackedPath })
      .on("error", function(error) {
        reject("Error extracting " + url + " - " + error);
      })
      .on("end", function() {
        var successMessage = "Successfully downloaded and processed " + url;

        if (verify) {
          verifyContents(verify)
            .then(function() {
              resolve(successMessage);
            })
            .catch(reject);
        } else {
          resolve(successMessage);
        }
      });

    var gunzip = zlib.createGunzip().on("error", function(error) {
      reject("Error decompressing " + url + " " + error);
    });

    try {
      fs.mkdirSync(unpackedPath);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }

    request
      .get(url, function(error, response) {
        if (error) {
          reject("Error communicating with URL " + url + " " + error);
          return;
        }
        if (response.statusCode == 404) {
          var errorMessage = options.errorMessage || "Not Found: " + url;

          reject(new Error(errorMessage));
          return;
        }

        if (verbose) {
          console.log("Downloading binaries from " + url);
        }

        response.on("error", function() {
          reject("Error receiving " + url);
        });
      })
      .pipe(gunzip)
      .pipe(untar);
  });
}

function unzipUrl(url, unpackedPath, options) {
  options = options || {};

  var verbose = options.verbose;
  var verify = options.verify;

  if (verbose) {
    console.info('Downloading and unpacking zip')
  }

  return new Promise(function(resolve, reject) {
    var writeStream = unzip
      .Extract({ path: unpackedPath })
      .on("error", function(error) {
        reject("Error extracting " + url + " - " + error);
      })
      .on("entry", function(entry) {
        console.log("Entry: " + entry.path);
      })
      .on("close", function() {
        var successMessage = "Successfully downloaded and processed " + url;

        if (verify) {
          verifyContents(verify)
            .then(function() {
              resolve(successMessage);
            })
            .catch(reject);
        } else {
          resolve(successMessage);
        }
      });

    request
      .get(url, function(error, response) {
        if (error) {
          reject("Error communicating with URL " + url + " " + error);
          return;
        }
        if (response.statusCode == 404) {
          var errorMessage = options.errorMessage || "Not Found: " + url;

          reject(new Error(errorMessage));
          return;
        }

        if (verbose) {
          console.log("Downloading binaries from " + url);
        }

        response.on("error", function() {
          reject("Error receiving " + url);
        });
      })
      .pipe(writeStream);
  });
}

function verifyContents(files) {
  return Promise.all(
    files.map(function(filePath) {
      return new Promise(function(resolve, reject) {
        fs.stat(filePath, function(err, stats) {
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

// Download a file that is itself a binary
// No post-processing needs to occur
function downloadBin(url, unpackedPath, options) {
  options = options || {};

  var verbose = options.verbose;
  if (verbose) {
    console.info('Downloading and unpacking binary')
  }

  return new Promise(function(resolve, reject) {
    try {
      fs.mkdirSync(unpackedPath);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const urlSplit = url.split('/')
    const fileName = urlSplit[urlSplit.length - 1]
    const writeStream = fs.createWriteStream(path.join(unpackedPath, fileName));
    writeStream.on('close', () => {
      resolve();
    })
    console.log(unpackedPath, fileName)

    request
      .get(url, function(error, response) {
        if (error) {
          reject("Error communicating with URL " + url + " " + error);
          return;
        }
        if (response.statusCode == 404) {
          var errorMessage = options.errorMessage || "Not Found: " + url;

          reject(new Error(errorMessage));
          return;
        }

        if (verbose) {
          console.log("Downloading binaries from " + url);
        }

        response.on("error", function() {
          reject("Error receiving " + url);
        });
      })
      .pipe(writeStream);
  });
}

module.exports = binstall;
