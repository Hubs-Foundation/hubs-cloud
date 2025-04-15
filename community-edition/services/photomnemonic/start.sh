#!/bin/bash
echo Running Photomnemonic
rm -f /tmp/chromium
ln -s /usr/bin/chromium /tmp/chromium
AWS_LAMBDA_FUNCTION_NAME="turkey" node app.js
