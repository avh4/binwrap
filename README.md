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
  "main": "install.js",
  "scripts": {
    "install": "binwrap-install",
    "test": "binwrap-test",
    "prepublish": "npm test"
  },
  "license": "BSD-3-Clause",
  "files": [
    "install.js",
    "bin"
  ],
  "bin": {
    "myapp-cli": "bin/myapp-cli"
  },
  "dependencies": {
    "binwrap": "^1.0.0"
  }
}
```

Then create your `install.js` file like this:

```javascript
exports.binaries = ["myapp-cli"];

exports.urls = {
  "darwin-x64": "https://dl.bintray.com/me/myApp/0.0.0/mac-x64.tgz",
  "linux-x64": "https://dl.bintray.com/me/myApp/0.0.0/linux-x64.tgz",
  "win-x64": "https://dl.bintray.com/me/myApp/0.0.0/win-i386.zip",
  "win-ia32": "https://dl.bintray.com/me/myApp/0.0.0/win-i386.zip"
};
```

Then run `npm test` to verify that your packages are published correctly.

Finally, run `npm publish` when you are ready to publish your installer.
