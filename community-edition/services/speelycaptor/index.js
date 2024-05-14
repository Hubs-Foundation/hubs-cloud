process.env.PATH = process.env.PATH + ":" + process.env.LAMBDA_TASK_ROOT;

const { join } = require("path");
const { tmpdir } = require("os");
const { unlink, createReadStream, createWriteStream, existsSync, mkdirSync } = require("fs");
const { spawn, execFile } = require("child_process");
const VIDEO_MAX_DURATION = 600;
const AWS = require("aws-sdk");

// Shamelessly taken from https://gist.github.com/6174/6062387
const createKey = () =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

const log = console.log;

const tempDir = process.env["TEMP"] || tmpdir();
const tempFile = join(tempDir, "tempFile");
const outputDir = join(tempDir, "tempOutput");

if (!existsSync(outputDir)) mkdirSync(outputDir);

// https://github.com/binoculars/aws-lambda-ffmpeg
function ffprobe() {
  log("Starting FFprobe");

  return new Promise((resolve, reject) => {
    const args = ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", "-i", "tempFile"];
    const opts = {
      cwd: tempDir
    };
    const cb = (error, stdout) => {
      if (error) reject(error);

      log(stdout);

      const { streams, format } = JSON.parse(stdout);
      log(JSON.stringify(streams));
      log(JSON.stringify(format));

      const hasVideoStream = streams.some(({ codec_type, duration }) => {
        if (codec_type !== "video") return false;

        // Allow non-duration videos, currently known to be created by Oculus Browser
        if (!duration && !format.duration) return true;
        return (duration || format.duration) <= VIDEO_MAX_DURATION;
      });

      if (!hasVideoStream) reject("FFprobe: no valid video stream found");
      else {
        log("Valid video stream found. FFprobe finished.");
        resolve();
      }
    };

    execFile("ffprobe", args, opts, cb).on("error", reject);
  });
}

function ffmpeg(ffmpegArgs, destFile) {
  log("Starting FFmpeg");

  return new Promise((resolve, reject) => {
    const args = ["-y", "-loglevel", "warning", "-i", tempFile, ...ffmpegArgs.split(" "), destFile];

    log(args);

    spawn("ffmpeg", args, {})
      .on("message", msg => log(msg))
      .on("error", reject)
      .on("close", resolve);
  });
}

function removeFile(localFilePath) {
  log(`Deleting ${localFilePath}`);

  return new Promise((resolve, reject) => {
    unlink(localFilePath, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

function makeS3Client(){
  if (process.env.CLOUD == "gcp") {
    return new AWS.S3({
      region: "auto",
      signatureVersion: "v4",
      endpoint: "https://storage.googleapis.com",
      accessKeyId: process.env.GCP_SA_HMAC_KEY,
      secretAccessKey: process.env.GCP_SA_HMAC_SECRET
    });

  }
  return new AWS.S3({
    region: process.env.scratchBucketRegion,
    signatureVersion: "v4"
  });
}

// Perform a GET to /init to get a upload URL and key to pass to convert for conversion
module.exports.init = async function init(event, context, callback) {
  const { scratchBucketId, scratchBucketRegion } = process.env;
  const key = createKey();

  const s3 = makeS3Client()

  const uploadUrl = s3.getSignedUrl("putObject", {
    Bucket: scratchBucketId,
    Key: key,
    Expires: 240
  });

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl, key }),
    isBase64Encoded: false
  });
};

module.exports.convert = async function convert(event, context, callback) {
  const queryStringParameters = event.queryStringParameters || {};

  const { scratchBucketId, scratchBucketRegion } = process.env;
  const s3 = makeS3Client()

  const sourceKey = queryStringParameters.key;
  const ffmpegArgs = queryStringParameters.args;

  const destKey = createKey();

  await new Promise((resolve, reject) => {
    s3.getObject({ Bucket: scratchBucketId, Key: sourceKey })
      .on("error", error => reject(`S3 Download Error: ${error}`))
      .createReadStream()
      .on("end", () => {
        log("Download finished");
        resolve();
      })
      .on("error", reject)
      .pipe(createWriteStream(tempFile));
  });

  const destFullPath = join(outputDir, destKey);

  //await ffprobe();
  await ffmpeg(ffmpegArgs, destFullPath);
  await removeFile(tempFile);

  const fileStream = createReadStream(destFullPath);
  const uploadConfig = process.env.CLOUD == "gcp"? 
    { Bucket: scratchBucketId, Key: destKey, Body: fileStream}
    :
    { Bucket: scratchBucketId, Key: destKey, Body: fileStream, ACL: "public-read"};

  log(uploadConfig);

  await s3.putObject(uploadConfig).promise();

  removeFile(destFullPath);

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      url: process.env.CLOUD == "gcp"? 
        `https://${scratchBucketId}.storage.googleapis.com/${destKey}`
        :
        scratchBucketRegion === "us-east-1"?
          `https://${scratchBucketId}.s3.amazonaws.com/${destKey}`
          :
          `https://${scratchBucketId}.s3-${scratchBucketRegion}.amazonaws.com/${destKey}`
    }),
    isBase64Encoded: false
  });
};
