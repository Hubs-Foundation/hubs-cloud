#!/usr/bin/env bash

if [[ -z "$1" ]]; then
  echo -e "
Usage:
run-serverless.sh COMMAND [environment]
run-serverless.sh deploy [environment]
run-serverless.sh logs <environment> --function app

Runs serverless with COMMAND to the given environment, assuming HUBS_OPS_PATH has the repo managing the requisite terraform resources.

To deploy outside of Hubs infrastructure, just use sls deploy.
"
  exit 1
fi

if [[ -z "$HUBS_OPS_PATH" ]]; then
  echo -e "To use this deploy script, you need to clone out the hubs-ops repo

git clone git@github.com:mozilla/hubs-ops.git

Then set HUBS_OPS_PATH to point to the cloned repo."
  exit 1
fi


COMMAND=$1
ENVIRONMENT=$2
[[ -z "$ENVIRONMENT" ]] && ENVIRONMENT=dev

DIR=$(pwd)
pushd $HUBS_OPS_PATH/terraform
./grunt_local.sh output photomnemonic $ENVIRONMENT -json | jq 'with_entries(.value |= .value)' > $DIR/config.json
popd
cp serverless.prod.yml serverless.yml
sls $COMMAND $3 $4 --stage $ENVIRONMENT
cp serverless.public.yml serverless.yml
rm config.json
