<!--
title: TODO
description: This example shows your how to create a TypeScript powered REST API with DynamoDB.
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/QuantumInformation'
authorName: Nikos
authorAvatar: 'https://avatars0.githubusercontent.com/u/216566?v=4&s=140'
-->

# Introduction

TypeScript (ts) offers type safety which is helpful when working with the AWS SDK, which comes with ts definitions (d.ts)

# compiling

You can compile the ts files in this directory by 1st installing typescript via

`npm install -g typescript`

then

`npm i`

You can then run the compiler by running `tsc` in this directory. It will pull the settings from .tsconfig and extra @types
from package.json. The output create.js file is what will be uploaded by serverless.

For brevity, I have just demonstrated this to match with the todos/create.js lambda function