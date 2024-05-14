# speelycaptor
AWS Lambda for performing video conversions via `ffmpeg`

API:
- GET `/init` to get a signed S3 URL to post a video to. Response is JSON with two keys, `uploadUrl` and `key`.
- POST your video to `uploadUrl`.
- GET `/convert?key=<key from /init>&args=<ffmpeg args>` will return JSON with `url` key with output

Relies upon https://github.com/serverlesspub/ffmpeg-aws-lambda-layer being deployed under the layer name `ffmpeg` (see https://github.com/mozilla/hubs-ops/blob/master/terraform/modules/speelycaptor/main.tf for relevant terraform)
