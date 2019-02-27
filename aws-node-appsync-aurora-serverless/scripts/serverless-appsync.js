/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const yaml = require('js-yaml');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);

const root = path.resolve(__dirname, '..');
const src = path.resolve(root, 'src', 'resolvers');

const serviceRoleName = 'AppSyncLambdaServiceRole';

async function loadServerlessTemplate() {
  const data = await readFile(path.resolve(root, 'serverless.tpl.yml'), 'utf-8');
  return yaml.safeLoad(data);
}

async function writeServerlessConfiguration(config) {
  const data = yaml.safeDump(config);
  const file = path.resolve(root, 'serverless.yml');
  await writeFile(file, data, 'utf-8');
  console.log('Wrote serverless configuration to %s', file);
}

async function getHandlers() {
  const files = await readDir(src);
  return files
    .map(f => f.match(/^([^_]+)_(.+)\.js$/))
    .filter(m => !!m)
    .map(([file, type, field]) => ({ file, type, field }));
}

function capitalize(s) {
  if (!s.length) return '';
  return s[0].toUpperCase() + (s.length > 1 ? s.substring(1) : '');
}

function createHandlerConfig({ file, type, field }) {
  const lambdaName = `${type}${capitalize(field)}`;
  const dataSourceName = `${lambdaName}DataSource`;
  const arn = `arn:aws:lambda:\${self:provider.region}:*:function:\${self:service}-\${self:provider.stage}-${lambdaName}`;

  return {
    functions: {
      [lambdaName]: {
        handler: `dist/${file.replace(/\.js$/, '.handler')}`,
      },
    },
    dataSources: [
      {
        type: 'AWS_LAMBDA',
        name: dataSourceName,
        config: {
          lambdaFunctionArn: { 'Fn::GetAtt': [`${lambdaName}LambdaFunction`, 'Arn'] },
          serviceRoleArn: { 'Fn::GetAtt': [serviceRoleName, 'Arn'] },
        },
      },
    ],
    mappingTemplates: [
      {
        dataSource: dataSourceName,
        type,
        field,
        request: 'lambda.req.vtl',
        response: 'lambda.res.vtl',
      },
    ],
    policyResources: [arn, `${arn}:*`],
  };
}

async function main() {
  const [template, handlers] = await Promise.all([loadServerlessTemplate(), getHandlers()]);

  const handlerConfig = handlers.map(createHandlerConfig).reduce(
    ({ functions, mappingTemplates, dataSources, policyResources }, config) => ({
      functions: { ...functions, ...config.functions },
      mappingTemplates: [...mappingTemplates, ...config.mappingTemplates],
      dataSources: [...dataSources, ...config.dataSources],
      policyResources: [...policyResources, ...config.policyResources],
    }),
    {
      functions: {},
      mappingTemplates: [],
      dataSources: [],
      policyResources: [],
    }
  );

  template.functions = { ...template.functions, ...handlerConfig.functions };
  template.custom.appSync.mappingTemplates = handlerConfig.mappingTemplates;
  template.custom.appSync.dataSources = handlerConfig.dataSources;

  const serviceRole = template.resources.Resources[serviceRoleName];
  serviceRole.Properties.Policies[0].PolicyDocument.Statement[0].Resource.push(
    ...handlerConfig.policyResources
  );

  await writeServerlessConfiguration(template);
}

main().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
