FROM public.ecr.aws/lambda/nodejs:22

# The Node.js base image is not SnapStart-ready on its own. This label tells
# Lambda the code is safe to snapshot and restore: nothing created during
# initialization has to be unique per environment. Without it (or the SnapStart
# runtime hooks), publishing the function version fails during deployment.
LABEL com.amazonaws.lambda.feature.snapstart="Allow"

COPY handler.mjs ${LAMBDA_TASK_ROOT}/
CMD ["handler.hello"]
