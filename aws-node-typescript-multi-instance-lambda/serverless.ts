import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "aws-node-typescript-multi-instance-lambda",
  frameworkVersion: "3",
  configValidationMode: "error",
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    // region: "ap-southeast-2",
    // Rename CloudFormation stack to include the instance name
    stackName: "${self:service}-${param:instance}-${sls:stage}",
  },
  functions: {
    hello: {
      // Rename function to include the instance name
      name: "${self:service}-${param:instance}-${sls:stage}-hello",
      handler: "handler.hello",
      environment: {
        INSTANCE_NAME: "${param:instance}",
      },
    },
  },

  resources: {
    Resources: {
      IamRoleLambdaExecution: {
        Type: "AWS::IAM::Role",
        Properties: {
          Policies: [
            {
              PolicyName: {
                "Fn::Join": [
                  "-",
                  [
                    "${self:service}",
                    "${param:instance}",
                    "${sls:stage}",
                    "lambda",
                  ],
                ],
              },
            },
          ],
          // Include instance name to avoid resource collision between instances
          RoleName: {
            "Fn::Join": [
              "-",
              [
                // "${self:service}",
                "multi-instance", // shorten service name due to 64-character "roleName" length requirement
                "${param:instance}",
                "${sls:stage}",
                {
                  Ref: "AWS::Region",
                },
                "lambdaRole",
              ],
            ],
          },
        },
      },
    },
    Outputs: {
      // Rename output export names to include instance name
      // https://github.com/serverless/serverless/issues/9361#issuecomment-884602588
      // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html
      HelloLambdaFunctionQualifiedArn: {
        Export: {
          Name: {
            "Fn::Join": [
              "-",
              [
                "sls",
                "${self:service}",
                "${param:instance}",
                "${sls:stage}",
                "HelloLambdaFunctionQualifiedArn",
              ],
            ],
          },
        },
      },
      ServerlessDeploymentBucketName: {
        Export: {
          Name: {
            "Fn::Join": [
              "-",
              [
                "sls",
                "${self:service}",
                "${param:instance}",
                "${sls:stage}",
                "ServerlessDeploymentBucketName",
              ],
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
