# How to publish this package

1. Make sure the README is up-to-date for the new version (commit changes if necessary)
1. make sure tests pass locally `rm -Rf ./node_modules && npm ci && npm test`
1. `npm version <the new version>` (this creates the git tag)
1. `git push origin v<the new version>`
1. wait for CI to pass on the tagged version <https://travis-ci.org/avh4/binwrap>
1. `git push origin master`
1. `npm publish` (if this is not a stable release, remember to add `--tag rc`)
