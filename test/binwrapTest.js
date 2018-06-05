var HTTP_PORT = "9999"; // This must match what's defined in test_app/install.js

var httpServer = require("http-server");
var testServer = httpServer.createServer({
  root: "./test_app/public"
});

var exec = require("child-process-promise").exec;
var expect = require("chai").expect;
var path = require("path");

describe("binwrap", function() {
  before(function() {
    testServer.listen(HTTP_PORT);
  });

  after(function() {
    testServer.close();
  });

  beforeEach(function() {
    this.timeout(60000);
    return exec("rm -Rf test_app/bin/echoMe test_app/unpacked_bin/").then(function() {
      return exec("(cd test_app && npm run-script prepare)");
    });
  });

  describe("installing normally", function() {
    // In this case, 'npm install <package using binwrap>' will execute
    // binwrap-install via the package's install hook.
    // The platform and arch are mocked by passing arguments to binwrap-install.

    afterEach(function() {
      // Both tests below stop the server during the test
      testServer.listen(HTTP_PORT);
    });

    it("wraps *nix executables in tgz files", function() {
      this.timeout(60000);
      return exec(
        "(cd test_app && ./node_modules/.bin/binwrap-install darwin x64)"
      ).then(function() {
        testServer.close();
        return exec("BINWRAP_PLATFORM=darwin BINWRAP_ARCH=x64 test_app/bin/echoMe A B C").then(function(result) {
          expect(result.stdout).to.equal("Me! A B C\n");
        });
      });
    });

    it("wraps Windows executables in zip files", function() {
      this.timeout(60000);
      return exec(
        "(cd test_app && ./node_modules/.bin/binwrap-install win32 x64)"
      ).then(function() {
        testServer.close();
        return exec("BINWRAP_PLATFORM=win32 BINWRAP_ARCH=x64 test_app/bin/echoMe A B C").then(function(result) {
          expect(result.stdout).to.equal("Me.exe! A B C\n");
        });
      });
    });
  });

  describe("installing with --ignore-scripts", function() {
    // In this case, binwrap-install will never be executed,
    // and the first run of the binstub will download the binaries.
    // The platform and arch are mocked via an environment variable read by the binstub.

    it("wraps *nix executables in tgz files", function() {
      this.timeout(60000);
      return exec("BINWRAP_PLATFORM=darwin BINWRAP_ARCH=x64 test_app/bin/echoMe A B C").then(function(result) {
        expect(result.stdout).to.equal("Me! A B C\n");
      });
    });

    it("wraps Windows executables in zip files", function() {
      this.timeout(60000);
      return exec("BINWRAP_PLATFORM=win32 BINWRAP_ARCH=x64 test_app/bin/echoMe A B C").then(function(result) {
        expect(result.stdout).to.equal("Me.exe! A B C\n");
      });
    });
  });

  it("fails when specified URLs don't exist", function() {
    this.timeout(60000);
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
    this.timeout(60000);
    return exec("(cd test_app && npm test)");
  });

  describe("javascript API", function() {
    it("provides absolute paths to the binwrapped binaries", function() {
      var api = require(path.join(__dirname, "..", "test_app"));

      expect(api.paths.echoMe).to.equal(path.resolve(path.join(__dirname, "..", "test_app", "bin", "echoMe")));
    });
  });
});
