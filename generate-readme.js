const fs = require('fs');
const path = require('path');
const markdownMagic = require('markdown-magic'); // eslint-disable-line
const globby = require('markdown-magic').globby; // eslint-disable-line

const toTitleCase = (str) => { // eslint-disable-line
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const formatPluginName = (string) => { // eslint-disable-line
  return toTitleCase(string.replace(/-/g, ' '));
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
      const examples = globby.sync(['**/package.json', '!node_modules/**/package.json', '!**/node_modules/**/package.json', '!package.json']);
      // Make table header
      let md = '| Example | description  |\n';
      md += '|:--------------------------- |:-----|\n';
      examples.forEach((example) => {
        const data = JSON.parse(fs.readFileSync(example, 'utf8'));
        const dirname = path.dirname(example);
        const url = `https://github.com/serverless/examples/tree/master/${dirname}`;
        // add table rows
        md += `| [${formatPluginName(data.name)}](${url}) | ${data.description} |\n`;
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
      let md = '| Example | description  |\n';
      md += '|:--------------------------- |:-----|\n';
      // Sort alphabetically
      examples.sort((a, b) => a.name < b.name ? -1 : 1).forEach((data) => { // eslint-disable-line
        // add table rows
        md += `| [${formatPluginName(data.name)}](${data.githubUrl}) | ${data.description} |\n`;
      });
      return md.replace(/^\s+|\s+$/g, '');
    },
  },
};


const markdownPath = path.join(__dirname, 'README.md');
markdownMagic(markdownPath, config, () => {
  console.log('Docs updated!'); // eslint-disable-line
});
