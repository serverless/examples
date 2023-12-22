import createResponse from './helpers/response';

export const handler = async () =>
  createResponse(200, {
    message: 'Encountered a test!',
  });
