var fs = require("fs");
var path = require("path");
var binstall = require(path.join(__dirname, "binstall"));

module.exports = function install(config, os, arch) {
  if (!fs.existsSync("bin")) {
    fs.mkdirSync("bin");
  }

  var binExt = "";
  if (os == "win32") {
    binExt = ".exe";
  }

  var buildId = os + "-" + arch;
  var url = config.urls[buildId];
  if (!url) {
    throw new Error("No binaries are available for your platform: " + buildId);
  }
  return binstall(url, "unpacked_bin").then(function() {
    config.binaries.forEach(function(bin) {
      fs.chmodSync(path.join("unpacked_bin", bin + binExt), "755");
    });
  });
};
