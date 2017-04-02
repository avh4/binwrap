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

  it("wraps *nix executables in tgz files", function() {
    this.timeout(0);
    return exec(
      "(cd test_app && ./node_modules/.bin/binwrap-install darwin x64)"
    ).then(function(result) {
      console.log(result.stdout);
      return exec("test_app/bin/echoMe A B C").then(function(result) {
        expect(result.stdout).to.equal("Me! A B C\n");
      });
    });
  });

  it("wraps Windows executables in zip files", function() {
    this.timeout(0);
    return exec(
      "(cd test_app && ./node_modules/.bin/binwrap-install win32 x64)"
    ).then(function(result) {
      console.log(result.stdout);
      return exec("test_app/bin/echoMe A B C").then(function(result) {
        expect(result.stdout).to.equal("Me.exe! A B C\n");
      });
    });
  });

  it("fails when specified URLs don't exist", function() {
    this.timeout(0);
    testServer.close();
    return exec("(cd test_app && npm test)").then(
      function(result) {
        console.log(result.stdout);
        throw new Error("Expected binwrap-test to fail");
      },
      function() {
        // pass
        testServer.listen(HTTP_PORT);
      }
    );
  });

  it("passes tests when specified URLs do exist", function() {
    this.timeout(0);
    return exec("(cd test_app && npm test)");
  });
});
