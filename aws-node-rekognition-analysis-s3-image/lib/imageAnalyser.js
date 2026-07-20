import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

const rek = new RekognitionClient({});

class ImageAnalyser {
  static async getImageLabels(s3Config) {
    const params = {
      Image: {
        S3Object: {
          Bucket: s3Config.bucket,
          Name: s3Config.imageName,
        },
      },
      MaxLabels: 10,
      MinConfidence: 50,
    };

    console.log(`Analyzing file: https://s3.amazonaws.com/${s3Config.bucket}/${s3Config.imageName}`);

    const data = await rek.send(new DetectLabelsCommand(params));
    console.log('Analysis labels:', data.Labels);
    return data.Labels;
  }
}

export default ImageAnalyser;
