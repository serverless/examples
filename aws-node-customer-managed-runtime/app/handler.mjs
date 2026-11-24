import { readFile } from 'node:fs/promises';

// Returns the runtime info file that the customer-managed runtime's image adds.
// On a Lambda-managed runtime the file does not exist and the function fails.
export const hello = async () => {
  const info = JSON.parse(await readFile('/etc/runtime-info.json', 'utf8'));
  return {
    message: `Hello from ${info.name} ${info.version}`,
    node: process.version,
  };
};
