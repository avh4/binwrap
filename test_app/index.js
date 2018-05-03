var binwrap = require("binwrap");

module.exports = binwrap({
  binaries: ["echoMe"],
  urls: {
    "darwin-x64": "http://localhost:9999/echoMe-0.0.0-mac-x64.tgz",
    "linux-x64": "http://localhost:9999/echoMe-0.0.0-linux-x64.tgz",
    "win32-x64": "http://localhost:9999/echoMe-0.0.0-win-i386.zip"
  }
});
