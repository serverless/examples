const path = require('path');
const yml = require('gray-matter');
const fs = require('markdown-magic').fsExtra;
const globby = require('markdown-magic').globby;

const rootDirectory = path.join(__dirname);
/* utils */
function hasSameProps(obj1, obj2) {
  return Object.keys(obj1).every(prop => obj2.hasOwnProperty(prop));
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

const exampleData = {
  title: 'AWS Simple HTTP Endpoint example in NodeJS',
  description: 'This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time.',
  framework: 'v1',
  platform: 'AWS',
  language: 'nodeJS',
  authorLink: 'https://github.com/lucianopf',
  authorName: 'Luciano Pellacani Franca',
  authorAvatar: 'https://avatars2.githubusercontent.com/u/8251208?v=4&s=140',
};

// test author directory
globby(['*/*', '!node_modules'], {
  cwd: rootDirectory,
}).then((paths) => {
  paths.forEach((file) => {
    const fp = path.join(rootDirectory, file);
    if (fp.toLowerCase().endsWith('readme.md')) {
      const example = fs.readFileSync(fp, 'utf8').replace('<!--', '---').replace('-->', '---');
      const exampleFileFrontmatter = yml(example).data;
      let msg;
      if (isEmptyObject(exampleFileFrontmatter)) {
        msg = `no frontmatter found! Please update ${file} \n\nHere's an example frontmatter for reference: https://raw.githubusercontent.com/serverless/examples/master/aws-node-simple-http-endpoint/README.md
        `;
        throw new Error(msg);
      }

      if (!hasSameProps(exampleData, exampleFileFrontmatter)) {
        msg = `incomplete frontmatter in ${file} \n\nFollowing properties are required: ${Object.keys(exampleData)} \n\nHere's an example frontmatter for reference: https://raw.githubusercontent.com/serverless/examples/master/aws-node-simple-http-endpoint/README.md
        `;
        throw new Error(msg);
      }
    }
  });

  return true;
}).then((done) => {
  console.log('all example readme.md files contain frontmatter');
}).catch((e) => {
  console.log(e);
  process.exit(1);
});

