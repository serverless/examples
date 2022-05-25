const fs = require('fs');
const path = require('path');
const url = require('url');
const markdownMagic = require('markdown-magic'); // eslint-disable-line
const globby = require('globby'); // eslint-disable-line

const toTitleCase = (str) => { // eslint-disable-line
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const formatPluginName = (string) => { // eslint-disable-line
  return toTitleCase(string.replace(/-/g, ' '));
};

const username = (repo) => {
  if (!repo) {
    return null;
  }

  const o = url.parse(repo);
  var urlPath = o.path; // eslint-disable-line

  if (urlPath.length && urlPath.charAt(0) === '/') {
    urlPath = urlPath.slice(1);
  }

  urlPath = urlPath.split('/')[0];
  return urlPath;
};

const getRuntime = (dirname) => {
  if (dirname.match(/node/)) {
    return 'node';
  } else if (dirname.match(/python/)) {
    return 'python';
  } else if (dirname.match(/swift/)) {
    return 'swift';
  } else if (dirname.match(/php/)) {
    return 'php';
  } else if (dirname.match(/ruby/)) {
    return 'ruby';
  } else if (dirname.match(/golang/)) {
    return 'go';
  } else if (dirname.match(/dotnet/)) {
    return 'csharp';
  }
  return 'node';
};

const getPlatform = (dirname) => {
  if (dirname.match(/aws/)) {
    return 'aws';
  } else if (dirname.match(/gcp/) || dirname.match(/google/)) {
    return 'gcp';
  } else if (dirname.match(/azure/)) {
    return 'azure';
  } else if (dirname.match(/openwhisk/)) {
    return 'openwhisk';
  } else if (dirname.match(/kubeless/)) {
    return 'kubeless';
  } else if (dirname.match(/twilio/)) {
    return 'twilio';
  }
  throw new Error(`Could not determine platform for ${dirname}`);
};

const byName = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

const config = {
  transforms: {
    /*
    In README.md the below comment block adds the list to the readme
    <!-- AUTO-GENERATED-CONTENT:START (GENERATE_SERVERLESS_EXAMPLE_TABLE)-->
      plugin list will be generated here
    <!-- AUTO-GENERATED-CONTENT:END -->
     */
    SERVERLESS_EXAMPLE_TABLE() {
      const examples = globby.sync(['**/package.json', '!node_modules/**/package.json', '!**/node_modules/**/package.json', '!package.json', '!**/bin/**/netcoreapp2.1/**/package.json', '!legacy/**']);
      // Make table header
      let md = '| Example | Runtime  |\n';
      md += '|:--------------------------- |:-----|\n';
      examples.forEach((example) => {
        const data = JSON.parse(fs.readFileSync(example, 'utf8'));
        console.log(example);
        const dirname = path.dirname(example);
        const exampleUrl = `https://github.com/serverless/examples/tree/v3/${dirname}`;
        const runtime = getRuntime(dirname);
        const description = (data.description) ? `<br/> ${data.description}` : '';
        // add table rows
        md += `| [${data.title || formatPluginName(data.name)}](${exampleUrl}) ${description} | ${runtime} |\n`;
      });

      return md;
    },
    /*
    In README.md the below comment block adds the list to the readme
    <!-- AUTO-GENERATED-CONTENT:START (GENERATE_SERVERLESS_EXAMPLE_TABLE)-->
      community examples list will be generated here
    <!-- AUTO-GENERATED-CONTENT:END -->
     */
    COMMUNITY_EXAMPLES_TABLE() {
      const exampleFile = path.join(__dirname, 'community-examples.json');
      const examples = JSON.parse(fs.readFileSync(exampleFile, 'utf8'));
      // Make table header
      let md = '| Example | Author |\n';
      md += '|:-------|:------:|\n';
      examples.sort(byName).forEach((data) => {
        // add table rows
        const userName = username(data.githubUrl);
        const profileURL = `http://github.com/${userName}`;
        md += `| **[${data.title || formatPluginName(data.name)}](${data.githubUrl})** <br/>`;
        md += ` ${data.description} | [${userName}](${profileURL}) |\n`;
      });
      return md.replace(/^\s+|\s+$/g, '');
    },
  },
};

// 1. Build examples.json
/** @type string[] */
const examplePackageJsons = globby.sync([
  '**/package.json',
  '!node_modules/**/package.json',
  '!**/node_modules/**/package.json',
  '!package.json',
  '!**/bin/**/netcoreapp2.1/**/package.json',
  '!legacy/**',
]);
const repoExamples = examplePackageJsons.map((packageJson) => {
  const data = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  const dirname = path.dirname(packageJson);
  const name = typeof data.name === 'string' ? data.name : dirname;
  return {
    name,
    title: data.title || formatPluginName(name),
    githubUrl: `https://github.com/serverless/examples/tree/v3/${dirname}`,
    description: data.description,
    language: data.language || getRuntime(dirname),
    platform: data.platform || getPlatform(dirname),
  };
}).sort(byName);
const communityExamples = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-examples.json'), 'utf8'));
communityExamples.forEach((example, i) => {
  if (!example.name) throw new Error(`Expected each community example to have a name, but missing a name at position ${i} in community-examples.json`);
  if (!example.description) throw new Error(`Expected each community example to have a description, but missing one for ${example.name} in community-examples.json`);
  if (!example.githubUrl) throw new Error(`Expected each community example to have a githubUrl, but missing one for ${example.name} in community-examples.json`);
});
const examples = [
  ...repoExamples.map(e => ({ ...e, community: false })),
  ...communityExamples.map(e => ({ ...e, community: true })),
];
fs.writeFileSync(
  path.join(__dirname, 'examples.json'),
  JSON.stringify(examples, null, 2),
  { encoding: 'utf8' },
);

// 2. Build the README
const markdownPath = path.join(__dirname, 'README.md');
markdownMagic(markdownPath, config, () => {
  console.log('Docs updated!'); // eslint-disable-line
});
