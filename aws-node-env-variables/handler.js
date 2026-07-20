export const createUser = async () => {
  // logs `4096`
  console.log('PASSWORD_ITERATIONS: ', process.env.PASSWORD_ITERATIONS);
  // logs `256`
  console.log('PASSWORD_DERIVED_KEY_LENGTH: ', process.env.PASSWORD_DERIVED_KEY_LENGTH);
  // logs `KEYEXAMPLE1234`
  console.log('EMAIL_SERVICE_API_KEY: ', process.env.EMAIL_SERVICE_API_KEY);

  // In this case could use the env vars to generate a secure password hash.
  // const passwordHash = PBKDF2(
  //   passphrase,
  //   salt,
  //   process.env.PASSWORD_ITERATIONS,
  //   process.env.PASSWORD_DERIVED_KEY_LENGTH
  // );

  // The email service api key would be used to send a verfication email to the user.

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'User created',
    }),
  };
};

export const resetPassword = async () => {
  // logs `KEYEXAMPLE1234`
  console.log('EMAIL_SERVICE_API_KEY: ', process.env.EMAIL_SERVICE_API_KEY);

  // The email service api key would be used to send a reset password email.

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Password sent.',
    }),
  };
};
