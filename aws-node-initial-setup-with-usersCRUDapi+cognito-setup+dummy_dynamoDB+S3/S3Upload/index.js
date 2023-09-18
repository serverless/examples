const fileType = require("file-type");
const uuid = require("uuid");
const AWS = require("aws-sdk");
const {
  createResponse,
  badRequestResponse
} = require("../Utils/responseCodes");

const { S3PutItem } = require("../Utils/S3Client");

const s3 = new AWS.S3();

const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];

async function main(event) {
  console.log("Inside S3Upload main Function", event);

  const body = JSON.parse(event.body);

  if (!body || !body.image || !body.mime) {
    console.log("empty body");
    return badRequestResponse("body is empty", body);
  }

  if (!allowedMimes.includes(body.mime)) {
    console.log("Not an file type");
    return badRequestResponse;
  }

  let fileData = body.file;

  if (body.file.substr(0, 7) === "base64,")
    fileData = body.image.substr(7, body.file.length);

  const buffer = Buffer.from(fileData, "base64");
  const fileInfo = await fileType.fromBuffer(buffer);
  const detectedExt = fileInfo.ext;
  const detectedMime = fileInfo.mime;

  if (detectedMime !== body.mime) {
    console.log("mime types dont match");
    return badRequestResponse("mime types dont match", body.mime);
  }

  const name = uuid.v4();

  const key = `${name}.${detectedExt}`;

  console.log(`writing file to bucket called ${key}`);

  const params = {
    Body: buffer,
    Key: key,
    ContentType: body.mime,
    Bucket: process.env.S3Bucket,
    ACL: "public-read"
  };

  return S3PutItem(params)
    .then(() => {
      const url = `https://${process.env.S3Bucket}.s3-${process.env.REGION}.amazonaws.com/${key}`;
      return createResponse(
        "Uploaded the image into S3 bucket successfuly",
        url
      );
    })
    .catch(err => {
      console.log("error to upload in s3", error);
      return badRequestResponse;
    });
}

module.exports = { main };
