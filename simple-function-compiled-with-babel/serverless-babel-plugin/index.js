'use strict';

const unzip = require('unzip2');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const spawnSync = require('child_process').spawnSync;
const BbPromise = require('bluebird');
const glob = require('glob-all');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'after:deploy:createDeploymentArtifacts': this.transform.bind(this),
    };
  }

  transform() {
    // unzip
    const stream = fs.createReadStream('.serverless/simple-function-compiled-with-babel.zip')
      .pipe(unzip.Extract({ path: 'tmpBabelDirectory' }));

    stream.on('finish', () => {
      // compile
      const args = [
        '--out-dir=tmpBabelDirectory',
        'tmpBabelDirectory',
        '--ignore=*/node_modules/*',
      ];
      const result = spawnSync('./node_modules/.bin/babel', args);
      const stdout = result.stdout.toString();
      const sterr = result.stderr.toString();
      if (stdout) {
        console.log(stdout);
      }
      if (sterr) {
        console.log(sterr);
      }

      // zip
      // const patterns = ['**'];
      // const servicePath = '.serverless/tmpBabelDirectoryCompiled';
      // const zip = archiver.create('zip');
      //
      // const artifactFilePath = '.serverless/final.zip';
      // this.serverless.utils.writeFileDir(artifactFilePath);
      //
      // const output = fs.createWriteStream(artifactFilePath);
      //
      // output.on('open', () => {
      //   zip.pipe(output);
      //
      //   const files = glob.sync(patterns, {
      //     cwd: servicePath,
      //     dot: true,
      //     silent: true,
      //     follow: true,
      //   });
      //
      //   files.forEach((filePath) => {
      //     const fullPath = path.resolve(
      //       servicePath,
      //       filePath,
      //     );
      //
      //     const stats = fs.statSync(fullPath);
      //
      //     if (!stats.isDirectory(fullPath)) {
      //       zip.append(fs.readFileSync(fullPath), {
      //         name: filePath,
      //         mode: stats.mode,
      //       });
      //     }
      //   });
      //
      //   zip.finalize();
      // });
      //
      // return new BbPromise((resolve, reject) => {
      //   output.on('close', () => resolve(artifactFilePath));
      //   zip.on('error', err => reject(err));
      // });
    });
  }
}

module.exports = ServerlessPlugin;
