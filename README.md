[![Build Status](https://travis-ci.org/avh4/binwrap.svg?branch=master)](https://travis-ci.org/avh4/binwrap) [![npm](https://img.shields.io/npm/v/binwrap.svg)](https://www.npmjs.com/package/binwrap)

This package helps with distributing binaries via npm.

## Usage

First, create your compiled binaries and make them available via HTTPS.

Now create your npm installer: Make a `package.json` that looks like this:

```json
{
  "name": "myApp",
  "version": "1.0.0",
  "description": "Install myApp",
  "preferGlobal": true,
  "engines": {
    "node": ">=4.0.0"
  },
  "main": "index.js",
  "scripts": {
    "install": "binwrap-install",
    "prepublishOnly": "binwrap-test"
  },
  "license": "BSD-3-Clause",
  "files": [
    "index.js",
    "bin",
    "bin/myapp-cli"
  ],
  "bin": {
    "myapp-cli": "bin/myapp-cli"
  },
  "dependencies": {
    "binwrap": "^0.1.4"
  }
}
```

Next, create your `index.js` file like this:

```javascript
var binwrap = require("binwrap");
var path = require("path");

var packageInfo = require(path.join(__dirname, "package.json"));
var version = packageInfo.version;

var binaryName = "BinaryNameGoesHere"
var root = "https://github.com/RepoGoesHere/ProjectGoesHere/releases/download/" + version + "/" + binaryName;

module.exports = binwrap({
  binaries: [binaryName],
  urls: {
    "darwin-x64": root + "/mac-x64.tgz",
    "linux-x64": root + "/linux-x64.tgz",
    "win32-x64": root + "/win-i386.zip",
    "win32-ia32": root + "/win-i386.zip"
  }
});
```

Unless the end user is installing with `--ignore-scripts`, this will download
and install the appropriate binary right after the package is installed.

Next, create your `bin/myapp-cli` file like this:

```javascript
#!/usr/bin/env node

// This file exists for the benefit of npm users who have --ignore-scripts
// enabled. (Enabling this flag globally is a good security measure.)
// Since they won't run the post-install hook, the binaries won't be downloaded
// and installed.
//
// Since this file is included in "bin" in package.json, npm will install
// it automatically in a place that should be on the PATH. All the file does
// is to download the appropriate binary (just like the post-install hook would
// have), replace this file with that binary, and run the binary.
//
// In this way, the first time a user with --ignore-scripts enabled runs this
// binary, it will download and install itself, and then run as normal. From
// then on, it will run as normal without re-downloading.

var install = require("..").install;
var spawn = require("child_process").spawn;
var path = require("path");
var fs = require("fs");

// Make sure we get the right path even if we're executing from the symlinked
// node_modules/.bin/ executable
var targetPath = fs.realpathSync(process.argv[1]);

console.log("Finishing setup for first run...\n");

// cd into the directory above bin/ so install() puts bin/ in the right place.
process.chdir(path.join(path.dirname(targetPath), ".."));

install(process.platform, process.arch).then(function() {
  spawn(targetPath, process.argv.slice(2), {
    stdio: "inherit"
  }).on("exit", process.exit);
});
```

If the package gets installed *without* `--ignore-scripts`, this binary will
get overridden by the binary that was downloaded during installation. However,
if `--ignore-scripts` was used, this will be used as a fallback. It downloads
the appropriate binary and replaces itself with that binary, then runs the
binary. In this way you get the right binary "just in time" instead of during
installation.

Make sure this `bin/myapp-cli` file is executable! (`chmod +x bin/myapp-cli` on
UNIX systems.)

Next, run `npm run prepublishOnly --ignore-scripts=false` to verify that your packages are published correctly.

Finally, run `npm publish` when you are ready to publish your installer.
