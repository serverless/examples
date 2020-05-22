<!--
title: .'Serverless Email Sign-Up Form'
description: 'This example demonstrates how to deploy a Fullstack serverless application'
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/trilom'
authorName: 'Bryan Killian'
authorAvatar: 'https://avatars0.githubusercontent.com/u/7476973?v=4&s=140'
-->

# Example – Serverless Email Sign-Up Form

This demo application helps you test Serverless Framework Enterprise's main features:

* **Insights** - Monitoring, metrics and alerts for your functions.
* **Safeguards** - Best practice policies that run before you perform a deployment.
* **Secrets** - Store sensitive credentials in the Serverless Enterprise Dashboard and reference them in your Serverless Framework Project.

![Serverless Framework Enterprise Email Sign-Up Form Example](https://s3.amazonaws.com/assets.sales.serverless/github/enterprise-examples/email_form_preview.gif)

## Installation

#### Clone this repository

```shell
$ git clone https://github.com/serverless/enterprise.git
```

#### Install Front-End & Back-End Dependencies

Navigate into this example project and install dependencies on the frontend and backend.

```shell
# location - enterprise/examples/email-signup-form/frontend
$ npm i
```

```shell
# location - enterprise/examples/email-signup-form/backend
$ npm i
```

#### Create a Tenant and Application in Serverless Framework Enterprise

The Serverless Enterprise Plugin adds a `login` command to the Serverless Framework, use it like this to log you in:

```shell
# location - enterprise/backend
$ serverless login
```

Make sure to follow the prompts and create your Tenant (it's like a Github Org) and Application.

#### Add the Tenant and Application to this project's `serverless.yml`

![App and Tenant](https://s3.amazonaws.com/assets.sales.serverless/github/enterprise-examples/email_form_appandtenant.png)

#### Deploy the back-end

```shell
# location - enterprise/backend
$ serverless deploy
```

#### Run the front-end

```shell
# location - enterprise/backend
$ npm run start
```

#### Add the back-end URL in the front-end

The front-end form is not directed at the API endpoint out of the box.  You must copy the POST URL that is returned on `serverless deploy` of the `backend` into the front-end.

The URL should resemble this.

```
https://bpcn36m16a.execute-api.us-east-1.amazonaws.com/dev/submit
```

In the front-end, click "Demo Utilities" and paste this URL into the `FORM API` field.  The form should now work, as well as the testing features in the Utilites panel.


## Testing Serverless Insights

The user interface of this example application has a few utilities you can use to test out Serverless Framework Enterprise.

Click on "Demo Utilities" in the top right.  A side panel will expand which you can use to invoke the example application's Function several times, to fill Serverless Framework Enterprise with invocation data.

You can also use the panel to generate a random Function code error that will appear in Serverless Framework Enterprise.

Read more about [Insights here](https://github.com/serverless/enterprise/blob/master/docs/insights.md).

## Testing Serverless Secrets

The goal of our Secrets feature is to support storing and using any generic secret as a [Serverless Variable](https://serverless.com/framework/docs/providers/aws/guide/variables/).  This will be supported in upcoming weeks.

What Secrets supports now is creating a specific type of secret: AWS Access Keys.

You can use Secrets to reference temporary AWS Access Keys that last for 1 hour, used for the purpose of deploying your Serverless Framework project to the underlying AWS account.

Since these are temporary credentials, they mitigate the risk of developers leaving long-term credentials anywhere (e.g. Github) and are perfect for CI/CD.

Read more about [Secrets here](https://github.com/serverless/enterprise/blob/master/docs/secrets.md).

## Testing Serverless Safeguards

The goal of our Safeguards feature is to be alike a linter for serverless architectures.  Safeguards are best practices and organizational policies that are enforced upon deployment.  When a deployment happens, Framework Enterprise scans your `serverless.yml` and CloudFormation file before deployment and looks for issues.

Safeguards are immediately applied, out-of-the-box, when you add the Serverless Enterprise Plugin.

Read more about [Safeguards here](https://github.com/serverless/enterprise/blob/master/docs/safeguards.md).
