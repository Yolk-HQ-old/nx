#!/usr/bin/env bash

./scripts/link.sh

rm -rf tmp/nx/proj/node_modules/@yolkai
rm -rf tmp/angular/proj/node_modules/@yolkai
cp -r node_modules/@yolkai tmp/nx/proj/node_modules/@yolkai
cp -r node_modules/@yolkai tmp/angular/proj/node_modules/@yolkai

if [ -n "$1" ]; then
  jest --maxWorkers=1 ./build/e2e/$1.test.js
else
  jest --maxWorkers=1 ./build/e2e
fi


