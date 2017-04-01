// var binstall = require("./binstall");
var install = require("./install");

module.exports = function(config) {
  return {
    install: function(os, arch) {
      return install(config, os, arch);
    }
  };
};
