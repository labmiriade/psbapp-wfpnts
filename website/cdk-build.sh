#!/bin/sh

set -eux

npm install
npm run $1
mv dist/website-test/* /asset-output
