# AWS's Lambda base image with CUDA and PyTorch. Lambda provides the GPU driver.
FROM public.ecr.aws/lambda/deep-learning-containers/pytorch:cuda
COPY handler.py ${LAMBDA_TASK_ROOT}/
CMD ["handler.handler"]
