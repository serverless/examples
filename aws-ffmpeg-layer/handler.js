const { spawnSync } = require("child_process");
const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

module.exports.mkgif = async (event, context) => {
  if (!event.Records) {
    console.log("not an s3 invocation!");
    return;
  }
  for (const record of event.Records) {
    if (!record.s3) {
      console.log("not an s3 invocation!");
      continue;
    }
    if (record.s3.object.key.endsWith(".gif")) {
      console.log("already a gif");
      continue;
    }
    // get the file
    const s3Object = await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key
      })
      .promise();
    // write file to disk
    writeFileSync(`/tmp/${record.s3.object.key}`, s3Object.Body);
    // convert to gif!
    spawnSync(
      "/opt/ffmpeg/ffmpeg",
      [
        "-i",
        `/tmp/${record.s3.object.key}`,
        "-f",
        "gif",
        `/tmp/${record.s3.object.key}.gif`
      ],
      { stdio: "inherit" }
    );
    // read gif from disk
    const gifFile = readFileSync(`/tmp/${record.s3.object.key}.gif`);
    // delete the temp files
    unlinkSync(`/tmp/${record.s3.object.key}.gif`);
    unlinkSync(`/tmp/${record.s3.object.key}`);
    // upload gif to s3
    await s3
      .putObject({
        Bucket: record.s3.bucket.name,
        Key: `${record.s3.object.key}.gif`,
        Body: gifFile
      })
      .promise();
  }
};
