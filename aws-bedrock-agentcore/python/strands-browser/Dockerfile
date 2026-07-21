FROM python:3.14-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY agent.py .

# Run the agent
CMD ["python", "agent.py"]
