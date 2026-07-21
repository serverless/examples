export const timestamp = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'text/plain',
  },
  body: `${parseInt(Date.now() / 1000, 10)}`,
});
