# How to publish this package

1. Start a new branch `git switch -c release/<the new version> origin/main`
1. Make sure the README is up-to-date for the new version (commit changes if necessary)
1. Make sure tests pass locally `rm -Rf ./node_modules && npm ci && npm test`
1. `npm version <the new version>` (this creates the git tag)
1. `git push origin v<the new version>`
1. Wait for CI to pass on the tagged version <https://travis-ci.org/avh4/binwrap>
1. `npm publish` (if this is not a stable release, remember to add `--tag rc`)
1. Push the branch, make a PR for it, and merge the PR
