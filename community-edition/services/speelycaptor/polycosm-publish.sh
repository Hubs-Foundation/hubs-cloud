#!/usr/bin/env bash

if [[ -z "$1" ]]; then
  echo -e "
Usage: polycosm-publish.sh [environment]

Packages and publishes the lambda code to S3 for redistribution into new polycosm deployments.
"
  exit 1
fi

if [[ -z "$HUBS_OPS_PATH" ]]; then
  echo -e "To use this deploy script, you need to clone out the hubs-ops repo

git clone git@github.com:mozilla/hubs-ops.git

Then set HUBS_OPS_PATH to point to the cloned repo."
  exit 1
fi

ENVIRONMENT=$1
[[ -z "$ENVIRONMENT" ]] && ENVIRONMENT=dev

VERSION=$(cat package.json | jq -r ".version")
NAME=$(cat package.json | jq -r ".name")

DIR=$(pwd)
pushd $HUBS_OPS_PATH/terraform
BUCKET=$(./grunt_local.sh output ret $ENVIRONMENT -json | jq 'with_entries(.value |= .value)' | jq -r ".polycosm_sam_bucket_id")
BUCKET_REGION=$(./grunt_local.sh output ret $ENVIRONMENT -json | jq 'with_entries(.value |= .value)' | jq -r ".polycosm_sam_bucket_region")
popd

mv node_modules node_modules_tmp
env npm_config_arch=x64 npm_config_platform=linux npm_config_target=10.16.1 npm ci
zip -9 -y -r ${NAME}.zip *.js node_modules
curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar xJ
mv ffmpeg*/ffmpeg .
mv ffmpeg*/ffprobe .
zip -m -u ${NAME}.zip ffmpeg ffprobe
echo "sam package --region $BUCKET_REGION --template-file template.yaml --output-template-file template-packaged.yaml --s3-bucket $BUCKET"
sam package --region $BUCKET_REGION --template-file template.yaml --output-template-file template-packaged.yaml --s3-bucket $BUCKET

for samregion in us-east-1 #us-east-2 us-west-1 us-west-2 ap-northeast-1 eu-west-1
do
  sam publish --region $samregion --template template-packaged.yaml
  APPLICATION_ARN=$(aws --region $samregion serverlessrepo list-applications | jq -r '.Applications | . [] | .ApplicationId' | grep $NAME)
  aws --region $samregion serverlessrepo put-application-policy --application-id "$APPLICATION_ARN" --statements Principals=*,Actions=Deploy
done
rm template-packaged.yaml
rm -rf node_modules
mv node_modules_tmp node_modules
rm ${NAME}.zip
rm -rf ffmpeg*
