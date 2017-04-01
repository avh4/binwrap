// var binstall = require("./binstall");
var install = require("./install");
var test = require("./test");

module.exports = function(config) {
  return {
    install: function(os, arch) {
      return install(config, os, arch);
    },
    test: function() {
      return test(config);
    }
  };
};
