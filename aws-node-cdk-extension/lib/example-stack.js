const { Stack, Duration, CfnOutput } = require('aws-cdk-lib')
const sqs = require('aws-cdk-lib/aws-sqs')

class ExampleStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor (scope, id, props) {
    super(scope, id, props)

    // The code that defines your stack goes here

    // example resource
    const queue = new sqs.Queue(this, 'ExampleQueue', {
      visibilityTimeout: Duration.seconds(300)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const queueUrlOutput = new CfnOutput(this, 'queueUrl', {
      value: queue.queueUrl
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const customOutput = new CfnOutput(this, 'customOutput', {
      value: 'customOutputValue',
      description: 'This is a custom output'
    })
  }
}

module.exports = { ExampleStack }