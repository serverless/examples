import { s3Handler } from './s3Handler.js';
// Core image processing package
import sharp from 'sharp';

class ResizerHandler {
  constructor() {}

  async _process(event) {
    const { size, image } = event.pathParameters;
    return this.resize(size, image);
  }

  async resize(size, path) {
    const [width, height] = size.split('x').map((part) => parseInt(part, 10));
    const Key = path;
    const newKey = `${width}x${height}/${path}`;
    const Bucket = process.env.BUCKET;

    let streamResize;
    try {
      streamResize = sharp().resize(width, height).toFormat('png');
    } catch (error) {
      const invalidSizeError = new Error(`Invalid size "${size}": ${error.message}`);
      invalidSizeError.statusCode = 400;
      throw invalidSizeError;
    }

    let readStream;
    try {
      readStream = await s3Handler.readStream({ Bucket, Key });
    } catch (error) {
      const notFoundError = new Error(`Source image "${Key}" not found in bucket "${Bucket}".`);
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    const { writeStream, uploaded } = s3Handler.writeStream({ Bucket, Key: newKey });

    // data streaming
    readStream.pipe(streamResize).pipe(writeStream);

    await uploaded;
    return newKey;
  }
}

export const resizeHandler = new ResizerHandler();
