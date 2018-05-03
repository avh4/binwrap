#!/bin/bash

set -ex

# Start http server so test_app binaries can be "downloaded"
trap 'kill $(jobs -p)' EXIT
./node_modules/.bin/http-server -p 9999 test_app/public &

# Clear the test environment
rm -Rf test_tmp
mkdir test_tmp
cd test_tmp

# test_app should install if natives@1.1.2 is also a dependency
npm init --yes
npm install --save-dev natives@1.1.2
npm install --save-dev ../test_app
