var fs = require("fs");
var binstall = require("./binstall");
var path = require("path");

module.exports = function(config) {
  if (!fs.existsSync("bin")) {
    fs.mkdirSync("bin");
  }
  config.binaries.forEach(function(bin) {
    var binPath = path.join("bin", bin);
    fs.writeFileSync(
      binPath,
      "#!/usr/bin/env node\n" +
        'var path = require("path");\n' +
        'var spawn = require("child_process").spawn;\n' +
        'spawn(path.join(__dirname, "' +
        path.join("..", "unpacked_bin", bin) +
        "\"), process.argv.slice(2), {stdio: 'inherit'}).on('exit', process.exit);"
    );
    fs.chmodSync(binPath, "755");
  });

  return binstall(config.urls["mac-x64"], "unpacked_bin").then(function() {
    // verifyAllBinsExist(packageInfo.bin);
  });
};

// function verifyAllBinsExist(binInfo) {
//   Object.keys(binInfo).forEach(function(name) {
//     var bin = binInfo[name];
//     if (!fs.existsSync(bin)) {
//       throw new Error(
//         "bin listed in package.json does not exist: " +
//           bin +
//           "\n\nTODO: Maybe you forgot to include it in ..."
//       );
//     }
//   });
// }
