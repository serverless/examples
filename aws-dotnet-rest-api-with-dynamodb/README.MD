
# DotNetServerless

The following AWS lambda is built in .NET Core 2.1


## Configure lambda

It is possible configure the lambda by editing the `env.config.yml` file:

```
feature: <feature_name>
version: 1.0.0.0
region: <aws_region>
environment: <environment>
accountId: <aws_account_id>
dynamoTable: <dynamo_table_name>
```

## Run 

The project contains a `package.json` file with the following commands:

```
npm run tests
```

```
npm run build
```

```
npm run deploy
```