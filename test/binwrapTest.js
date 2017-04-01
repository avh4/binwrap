var HTTP_PORT = "9999"; // This must match what's defined in test_app/install.js

var httpServer = require("http-server");
var testServer = httpServer.createServer({
  root: "./test_app/public"
});

var exec = require("child-process-promise").exec;
var expect = require("chai").expect;

describe("binwrap", function() {
  before(function() {
    testServer.listen(HTTP_PORT);
  });

  after(function() {
    testServer.close();
  });

  it("", function() {
    this.timeout(0);
    return exec("(cd test_app && ./node_modules/.bin/binwrap-install)").then(
      function(result) {
        console.log(result.stdout);
        return exec("test_app/bin/echoMe").then(function(result) {
          expect(result.stdout).to.equal("Me!\n");
        });
      },
      function(result) {
        console.log(result);
        throw "binwrap-install failed";
      }
    );
  });
});
