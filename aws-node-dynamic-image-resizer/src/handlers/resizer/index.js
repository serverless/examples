import { resizeHandler } from './resizeHandler'

export const handler = async (event) => {
  try {
    const imagePath = await resizeHandler._process(event)
    const URL = `http://${process.env.BUCKET}.s3-website.${process.env.REGION}.amazonaws.com`

    return {
      headers: { 'location': `${URL}/${imagePath}` },
      statusCode: 301,
      body: ''
    }
  } catch (error) {
    console.log(error)
    return new Error(error)
  }
}
