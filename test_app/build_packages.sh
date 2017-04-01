#!/bin/bash

if [ -e public/echoMe-0.0.0-linux-x64.tgz ]; then
  exit 0
fi

mkdir -p public

cd compiled_bin || exit 1
zip "../public/echoMe-0.0.0-win-i386.zip" echoMe.exe
tar zcvf "../public/echoMe-0.0.0-mac-x64.tgz" echoMe
tar zcvf "../public/echoMe-0.0.0-linux-x64.tgz" echoMe
