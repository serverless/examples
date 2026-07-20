# MicroVM image for the Claude self-hosted sandbox worker.
#
# The Serverless Framework `sandboxes` feature packages this directory and builds
# it into an AWS::Lambda::MicrovmImage. At IMAGE BUILD TIME the worker starts and
# is snapshotted running (the `ready` lifecycle hook gates the snapshot). At RUN
# TIME the `run` lifecycle hook delivers the per-session dispatch payload; the
# worker acknowledges, handles the session, then exits.
FROM public.ecr.aws/docker/library/node:24-slim

# Tools the agent's bash/edit/glob/grep tool calls use inside /workspace.
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Install the worker package (production deps only). `npm ci` against the committed
# lockfile keeps the image build reproducible.
COPY package.json package-lock.json /opt/worker/
RUN cd /opt/worker && npm ci --omit=dev

COPY worker.mjs /opt/worker/worker.mjs

# Run as the unprivileged `node` user (uid 1000, ships with the base image) rather
# than root — see the self-hosted sandbox security model. The agent's tool calls
# write to /workspace, so it (and the worker dir) must be owned by that user.
RUN chown -R node:node /workspace /opt/worker
USER node

# Start the worker at build time so it is captured in the snapshot and is already
# serving the lifecycle hooks on :9000 when the image's `ready` hook is called.
ENTRYPOINT ["node", "/opt/worker/worker.mjs"]
