"""
Sandbox module for secure code execution in isolated Docker containers.

This module provides a Sandbox class that:
- Spins up temporary Python 3.12 containers
- Copies code directly into containers via put_archive (no volume mounts)
- Executes code with pytest in isolation
- Enforces strict timeouts
- Ensures cleanup even on crashes/timeouts

NOTE: Uses put_archive instead of volume mounts to support Docker-in-Docker
environments where host path resolution would fail.
"""

import io
import tarfile
import time

import docker
from docker.errors import ContainerError, ImageNotFound, APIError


def _create_tar_stream(files: dict[str, str]) -> io.BytesIO:
    """
    Create a tar archive from a dictionary of filename -> content.

    Args:
        files: Dictionary mapping filenames to their string content

    Returns:
        BytesIO object containing the tar archive
    """
    tar_stream = io.BytesIO()
    with tarfile.open(fileobj=tar_stream, mode='w') as tar:
        for filename, content in files.items():
            # Convert string content to bytes
            content_bytes = content.encode('utf-8')
            file_data = io.BytesIO(content_bytes)

            # Create tar info
            info = tarfile.TarInfo(name=filename)
            info.size = len(content_bytes)

            # Add to archive
            tar.addfile(info, file_data)

    # Reset stream position for reading
    tar_stream.seek(0)
    return tar_stream


class Sandbox:
    """
    A secure sandbox for executing Python code in isolated Docker containers.

    Uses python:3.12-slim as the base image and runs pytest with strict timeouts.
    Ensures containers are always cleaned up, even on errors or timeouts.

    NOTE: Uses put_archive to copy files into the container instead of volume
    mounts. This ensures compatibility with Docker-in-Docker environments.
    """

    DEFAULT_IMAGE = "python:3.12-slim"
    DEFAULT_TIMEOUT = 5  # seconds

    def __init__(self, image: str = DEFAULT_IMAGE, timeout: int = DEFAULT_TIMEOUT):
        """
        Initialize the Sandbox.

        Args:
            image: Docker image to use (default: python:3.12-slim)
            timeout: Maximum execution time in seconds (default: 5)
        """
        self.image = image
        self.timeout = timeout
        self.client = docker.from_env()

        # Ensure the image is available
        self._ensure_image()

    def _ensure_image(self) -> None:
        """Pull the Docker image if not available locally."""
        try:
            self.client.images.get(self.image)
        except ImageNotFound:
            print(f"[Sandbox] Pulling image {self.image}...")
            self.client.images.pull(self.image)

    def run(self, source_code: str, test_code: str) -> dict:
        """
        Execute source code with test code in an isolated container.

        Uses put_archive to copy files directly into the container,
        avoiding volume mount issues in Docker-in-Docker environments.

        Args:
            source_code: The Python source code to test
            test_code: The pytest test code to run against the source

        Returns:
            dict with keys:
                - success: bool indicating if all tests passed
                - output: str containing stdout/stderr from pytest
                - duration: float execution time in seconds
        """
        container = None
        start_time = time.time()

        try:
            # Prepare files to copy into container
            files = {
                "solution.py": source_code,
                "test_solution.py": test_code,
                "conftest.py": "import sys; sys.path.insert(0, '/workspace')"
            }

            # Create tar archive of the files
            tar_stream = _create_tar_stream(files)

            # Create container WITHOUT volume mounts
            # Use 'tail -f /dev/null' to keep container running while we copy files
            container = self.client.containers.create(
                image=self.image,
                command=["tail", "-f", "/dev/null"],
                working_dir="/workspace",
                network_disabled=True,  # Security: no network access
                mem_limit="128m",        # Memory limit
                cpu_period=100000,
                cpu_quota=50000,         # 50% CPU limit
                detach=True
            )

            # Start container
            container.start()

            # Copy files into the container using put_archive
            container.put_archive("/workspace", tar_stream)

            # Execute the test command
            exec_result = container.exec_run(
                cmd=["sh", "-c", "pip install pytest -q && timeout 5s python -m pytest test_solution.py -v --tb=short 2>&1"],
                workdir="/workspace",
                demux=False
            )

            # For exec_run, we need to handle timeout differently
            # Since exec_run is synchronous, we use container.wait with timeout
            # But exec_run already ran, so we check exit code directly
            exit_code = exec_result.exit_code
            output = exec_result.output.decode("utf-8", errors="replace") if exec_result.output else ""

            duration = time.time() - start_time

            # Check for timeout (if duration exceeded)
            if duration > self.timeout:
                output = f"TIMEOUT: Execution exceeded {self.timeout} seconds\n" + output
                return {
                    "success": False,
                    "output": output,
                    "duration": duration
                }

            # Determine success
            success = exit_code == 0

            return {
                "success": success,
                "output": output,
                "duration": duration
            }

        except ContainerError as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "output": f"Container error: {str(e)}",
                "duration": duration
            }
        except APIError as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "output": f"Docker API error: {str(e)}",
                "duration": duration
            }
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "output": f"Unexpected error: {str(e)}",
                "duration": duration
            }
        finally:
            # CRITICAL: Always clean up container
            if container is not None:
                try:
                    container.stop(timeout=1)
                except Exception:
                    pass  # Container might already be stopped
                try:
                    container.remove(force=True)
                except Exception:
                    pass  # Best effort cleanup


# Convenience function for one-off execution
def run_in_sandbox(source_code: str, test_code: str, timeout: int = 5) -> dict:
    """
    Convenience function to run code in a sandbox without managing Sandbox instance.

    Args:
        source_code: The Python source code to test
        test_code: The pytest test code to run
        timeout: Maximum execution time in seconds

    Returns:
        dict with success, output, and duration
    """
    sandbox = Sandbox(timeout=timeout)
    return sandbox.run(source_code, test_code)