<!--
title: 'GPU function with PyTorch on Lambda Managed Instances'
description: 'This example runs a Python function with PyTorch on an NVIDIA GPU, using AWS Lambda Managed Instances and the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: Python
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Python GPU function on AWS Lambda Managed Instances

This example runs a Python function with PyTorch on an NVIDIA GPU. The function multiplies two matrices on the GPU and returns the GPU's name, with Lambda Managed Instances running it on a fractional NVIDIA L4. Start here when your code needs a GPU, for model inference, media processing or other parallel computation.

## What it deploys

- A container image with PyTorch and the function's code, built from the `Dockerfile` and pushed to an Amazon ECR repository.
- A Lambda capacity provider, `gpu`, that launches `g6f.large` or `g6f.xlarge` EC2 instances, each with a fraction of an NVIDIA L4 GPU.
- A Lambda function, `matmul`, that runs on the capacity provider with 3 GB of GPU memory.
- A VPC with two public subnets and a security group, where the instances run.
- IAM roles for the function and the capacity provider, and a CloudWatch Logs log group for the function's logs.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/), running: the deploy builds the image on your machine. The PyTorch base image is about 5 GB to download.
- [Node.js](https://nodejs.org/), to install the Serverless Framework CLI: `npm i -g serverless`. The example needs version 4.47.0 or later, the first with `capacityProvider.accelerator`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- The EC2 service quota **Running On-Demand G and VT instances** of at least 4 vCPUs in the Region you deploy to. Its default is 0, so request an increase in the [Service Quotas console](https://console.aws.amazon.com/servicequotas/home/services/ec2/quotas/) first.
- A Region where [Lambda runs GPU functions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances-gpu.html). The deploy uses `us-east-1` unless you pass `--region`.
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Run the deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

The deploy takes 15 minutes or more: it pushes the image, then Lambda launches a GPU instance and starts the function on it. You should see output like this:

```text
Deploying "aws-python-gpu-managed-instances" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-python-gpu-managed-instances-dev (979s)
functions:
  matmul: aws-python-gpu-managed-instances-dev-matmul
```

## Try it

Invoke the function with the size of the matrices to multiply:

```bash
serverless invoke --function matmul --data '{"size": 4096}'
```

The function answers with the GPU it ran on and the product's first element, which equals the size:

```json
{
    "device": "NVIDIA L4-3Q",
    "size": 4096,
    "result": 4096,
    "milliseconds": 131.6
}
```

`NVIDIA L4-3Q` is a 3 GB slice of an NVIDIA L4, the GPU memory that `accelerator.memory: 3` asks for. `milliseconds` is the time the multiplication took on the GPU.

## How it works

`serverless.yml` builds the image, declares a capacity provider with GPU instance types, and runs the function on it:

```yaml
provider:
  ecr:
    images:
      pytorch:
        path: ./
        provenance: 'false'
  capacityProviders:
    gpu:
      instanceRequirements:
        allowedInstanceTypes:
          - g6f.large
          - g6f.xlarge
      scaling:
        maxVCpuCount: 12

functions:
  matmul:
    image: pytorch
    timeout: 60
    capacityProvider:
      name: gpu
      accelerator:
        memory: 3
      scaling:
        min: 1
        max: 1
```

- `provider.ecr.images.pytorch` builds the image from the `Dockerfile`. `provenance: 'false'` pushes a single-platform image, the format Lambda accepts.
- `allowedInstanceTypes` lists only GPU instance types: a capacity provider runs either GPU or non-GPU functions. `g6f` instances carry fractions of an NVIDIA L4; `maxVCpuCount` caps how many instances the capacity provider launches.
- `accelerator.memory: 3` asks for at least 3 GB of GPU memory. Lambda gives each execution environment one GPU, or one GPU fraction on `g6f` instances.
- `scaling` keeps one execution environment running, so the function answers right away.

The [`Dockerfile`](https://github.com/serverless/examples/blob/v4/aws-python-gpu-managed-instances/Dockerfile) starts from the PyTorch image that AWS publishes for GPU functions; Lambda provides the GPU driver:

```dockerfile
FROM public.ecr.aws/lambda/deep-learning-containers/pytorch:cuda
COPY handler.py ${LAMBDA_TASK_ROOT}/
CMD ["handler.handler"]
```

[`handler.py`](https://github.com/serverless/examples/blob/v4/aws-python-gpu-managed-instances/handler.py) picks the CUDA device at initialization and multiplies two matrices of ones on it:

```python
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def handler(event, context):
    size = int(event.get("size", 4096))
    a = torch.ones(size, size, device=DEVICE)
    b = torch.ones(size, size, device=DEVICE)
    product = a @ b
    ...
```

Capacity providers run their instances in a VPC. The Framework doesn't create VPCs, so `resources` in `serverless.yml` declares one with two public subnets in different Availability Zones and no NAT gateway. To use your own VPC, replace `provider.vpc` with your subnet and security group IDs and delete `resources`; the subnets then need a route to the internet, through a NAT gateway or an internet gateway.

## Cost and cleanup

While the example is deployed, the GPU instance runs and EC2 bills it by the second, whether or not you invoke the function; Lambda adds a management charge for the instance and bills each request. ECR bills for storing the image, and CloudWatch Logs for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), [ECR pricing](https://aws.amazon.com/ecr/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the instances, the function, the VPC and the log group, when you are done:

```bash
serverless remove
```

The remove takes several minutes while Lambda stops the instances.

## Next steps

- Read the [Managed Instances guide](https://www.serverless.com/framework/docs/providers/aws/guide/managed-instances#run-functions-on-gpus) for GPU memory, concurrency, scaling on GPU utilization and larger instance types.
- Let the function [scale to zero](https://www.serverless.com/framework/docs/providers/aws/guide/managed-instances#scale-to-zero) when it is idle, so the instance stops billing.
- Start from one of the other [GPU base images](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances-gpu-base-images.html), with CUDA, vLLM or SGLang, to serve a model.
