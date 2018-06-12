var request = require("request-promise");

module.exports = function test(config) {
  var errors = [];
  var checkedUrls = {};

  var chain = Object.keys(config.urls).reduce(
    function(p, buildId) {
      var url = config.urls[buildId];
      var displayUrl = "[" + buildId + "] " + url;
      if (url.slice(0,5) === "http:") {
        console.log("WARNING: Binary is published at an insecure URL (using https is recommended): " + displayUrl)
      }
      if (checkedUrls[url]) {
        return p.then(function() {
          console.log("OKAY: " + displayUrl);
        });
      } else {
        return p.then(function() {
          return request({
            method: "GET",
            uri: url,
            resolveWithFullResponse: true
          })
            .then(function(response) {
              if (response.statusCode != 200) {
                throw new Error("Status code " + response.statusCode);
              } else {
                console.log("OKAY: " + displayUrl);
              }
            })
            .catch(function(err) {
              console.error("  - Failed to fetch " + url + " " + err.message);
              errors.push(displayUrl);
            });
        });
      }
    },
    Promise.resolve()
  );
  return chain.then(function() {
    if (errors.length > 0) {
      console.log("There were errors when validating your published packages.");
      console.log("ERROR: The following URLs (specified in your binwrap config) could not be downloaded (see details above):");
      errors.forEach(function(e) {
        console.log("  - " + e);
      });
      process.exit(1);
    }
  });
};
