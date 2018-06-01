var path = require("path");
var install = require(path.join(__dirname, "install"));
var prepare = require(path.join(__dirname, "prepare"));
var test = require(path.join(__dirname, "test"));

module.exports = function(config) {
  return {
    install: function(unpackedBinPath, os, arch) {
      return install(config, unpackedBinPath, os, arch);
    },
    prepare: function() {
      return prepare(config);
    },
    test: function() {
      return test(config);
    }
  };
};
