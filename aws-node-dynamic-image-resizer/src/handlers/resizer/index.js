import { resizeHandler } from './resizeHandler.js'

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
    const statusCode = error.statusCode || 500
    return {
      statusCode,
      body: JSON.stringify({ error: error.message })
    }
  }
}
