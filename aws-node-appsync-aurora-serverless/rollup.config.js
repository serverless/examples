/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

function createRollupConfig(file) {
  return {
    input: `src/resolvers/${file}`,
    output: {
      dir: 'dist',
      file,
      format: 'cjs',
    },
    external: ['mysql', 'sequelize'],
    plugins: [
      json(),
      resolve({
        jsnext: true,
        main: true,
      }),
      commonjs(),
    ],
  };
}

const src = path.resolve(__dirname, 'src', 'resolvers');
const files = fs.readdirSync(src).filter(f => f.endsWith('.js'));

export default files.map(createRollupConfig);
