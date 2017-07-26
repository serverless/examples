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