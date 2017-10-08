export default env => {
  const required = ['BUCKET', 'REGION'];
  const missing = [];

  required.forEach(reqVar => {
    if (!env[reqVar]) {
      missing.push(reqVar);
    }
  });

  return missing;
};
