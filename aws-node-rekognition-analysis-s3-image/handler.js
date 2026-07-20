import ImageAnalyser from './lib/imageAnalyser.js';

/**
  Analyse an image on S3 using bucket and image name
 */
export const imageAnalysis = async (event) => {
  const data = JSON.parse(event.body);

  const s3Config = {
    bucket: data.bucket,
    imageName: data.imageName,
  };

  try {
    const labels = await ImageAnalyser.getImageLabels(s3Config);
    return {
      statusCode: 200,
      body: JSON.stringify({ Labels: labels }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: error.message || 'Internal server error',
    };
  }
};
