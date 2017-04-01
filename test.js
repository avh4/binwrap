var request = require("then-request");

module.exports = function test(config) {
  var errors = [];
  var chain = Object.keys(config.urls).reduce(
    function(p, buildId) {
      var url = config.urls[buildId];
      return p.then(function() {
        return request("HEAD", url).catch(function(err) {
          errors.push("Failed to fetch " + url + " " + err.message);
        });
      });
    },
    Promise.resolve()
  );
  return chain.then(function() {
    if (errors.length > 0) {
      var output = "There were errors when validating your published packages:\n\n  - " +
        errors.join("\n\n  - ") +
        "\n";
      throw new Error(output);
    }
  });
};
