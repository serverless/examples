export const hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v4! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};
