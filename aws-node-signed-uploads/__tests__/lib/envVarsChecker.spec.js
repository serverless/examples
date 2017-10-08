import checker from '../../src/lib/envVarsChecker';

describe(`Utility library envVarsChecker`, () => {
  test(`The helper exists`, () => {
    expect(checker).toBeTruthy();
  });

  test(`Asks for both BUCKET and REGION environment variables`, () => {
    const input = {};
    const result = checker(input);
    expect(result).toEqual(['BUCKET', 'REGION']);
  });

  test(`Asks for a missing BUCKET environment variables`, () => {
    const input = {
      REGION: 'foo',
    };
    const result = checker(input);
    expect(result).toEqual(['BUCKET']);
  });

  test(`Asks for a missing REGION environment variables`, () => {
    const input = {
      BUCKET: 'foo',
    };
    const result = checker(input);
    expect(result).toEqual(['REGION']);
  });
});
