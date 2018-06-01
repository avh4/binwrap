var fs = require("fs");
var path = require("path");
var mustache = require("mustache");

module.exports = function prepare(config) {
  if (!fs.existsSync("bin")) {
    fs.mkdirSync("bin");
  }

  var binstubTemplate = fs.readFileSync(path.join(__dirname, "binstub.js.mustache")).toString();

  config.binaries.forEach(function(bin) {
    var binPath = path.join("bin", bin);
    var content = mustache.render(binstubTemplate, { binName: bin });
    fs.writeFileSync(binPath, content);
    fs.chmodSync(binPath, "755");
  });

  // verifyAllBinsExist(packageInfo.bin);
  return new Promise(function(resolve) { resolve(); });
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
