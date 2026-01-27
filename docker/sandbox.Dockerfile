FROM python:3.12-slim

# Install pytest for test execution
RUN pip install --no-cache-dir pytest

# Create workspace directory
WORKDIR /workspace
