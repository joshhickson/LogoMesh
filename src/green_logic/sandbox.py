"""
Sandbox module for secure code execution.

Supports two modes:
1. Docker mode (secure): Isolated containers with resource limits
2. Subprocess mode (fallback): Local execution when Docker unavailable

NOTE: In AgentBeats competition, Docker may not be available. The subprocess
fallback allows the Green Agent to still run tests, just with less isolation.
"""

import io
import os
import tarfile
import tempfile
import time
import subprocess
import shutil

# Docker is optional - fallback to subprocess if unavailable
try:
    import docker
    from docker.errors import ContainerError, ImageNotFound, APIError
    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False
    docker = None


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

    Uses logomesh-sandbox image (with pytest pre-installed) for fast execution.
    Falls back to python:3.12-slim if custom image not available.
    Ensures containers are always cleaned up, even on errors or timeouts.

    NOTE: Uses put_archive to copy files into the container instead of volume
    mounts. This ensures compatibility with Docker-in-Docker environments.
    """

    DEFAULT_IMAGE = "logomesh-sandbox:latest"
    FALLBACK_IMAGE = "python:3.12-slim"
    DEFAULT_TIMEOUT = 15  # seconds (increased from 5 to handle complex/property-based tests)

    def __init__(self, image: str = DEFAULT_IMAGE, timeout: int = DEFAULT_TIMEOUT):
        """
        Initialize the Sandbox.

        Args:
            image: Docker image to use (default: python:3.12-slim)
            timeout: Maximum execution time in seconds (default: 5)
        """
        self.image = image
        self.timeout = timeout
        self._docker_mode = False
        self._has_pytest = False

        if DOCKER_AVAILABLE:
            try:
                # Try to connect to Docker daemon
                self.client = docker.from_env()
                self.client.ping()  # Test connection
                self._docker_mode = True
                # Ensure the image is available
                self._ensure_image()
            except Exception as e:
                # Docker module available but daemon not running
                print(f"[Sandbox] Docker daemon unavailable ({e}), using subprocess mode")
                self._docker_mode = False
        else:
            # Docker module not installed
            print("[Sandbox] Docker not installed, using subprocess mode")

    def _ensure_image(self) -> None:
        """Ensure Docker image is available, falling back to base image if needed."""
        try:
            self.client.images.get(self.image)
            self._has_pytest = True
        except ImageNotFound:
            if self.image == self.DEFAULT_IMAGE:
                # Custom image not found, fall back to base image
                print(f"[Sandbox] Custom image not found, using {self.FALLBACK_IMAGE}")
                self.image = self.FALLBACK_IMAGE
                self._has_pytest = False
                try:
                    self.client.images.get(self.image)
                except ImageNotFound:
                    print(f"[Sandbox] Pulling image {self.image}...")
                    self.client.images.pull(self.image)
            else:
                print(f"[Sandbox] Pulling image {self.image}...")
                self.client.images.pull(self.image)
                self._has_pytest = "sandbox" in self.image.lower()

    def run(self, source_code: str | dict[str, str], test_code: str = "") -> dict:
        """
        Execute source code with test code in an isolated container.

        Uses put_archive to copy files directly into the container.

        Args:
            source_code: The Python source code OR a dictionary of {filename: content}
            test_code: The pytest test code (ignored if source_code is a dict)

        Returns:
            dict with keys: success, output, duration
        """
        container = None
        start_time = time.time()

        try:
            # Prepare files to copy into container
            if isinstance(source_code, dict):
                # Multi-file mode
                files = source_code.copy()
                # Ensure conftest is there
                if "conftest.py" not in files:
                    files["conftest.py"] = "import sys; sys.path.insert(0, '/workspace')"
            else:
                # Single-file legacy mode
                files = {
                    "solution.py": source_code,
                    "test_solution.py": test_code,
                    "conftest.py": "import sys; sys.path.insert(0, '/workspace')"
                }

            if self._docker_mode:
                # Docker mode: Create container and use put_archive
                # No runner needed - we'll use pytest directly

                # Create tar archive of the files
                tar_stream = _create_tar_stream(files)

                # Create container WITHOUT volume mounts
                # Use 'tail -f /dev/null' to keep container running while we copy files
                # Network disabled if pytest pre-installed, enabled if we need pip install
                container = self.client.containers.create(
                    image=self.image,
                    command=["tail", "-f", "/dev/null"],
                    working_dir="/workspace",
                    network_disabled=self._has_pytest,  # Disable network if pytest pre-installed
                    mem_limit="128m",        # Memory limit
                    cpu_period=100000,
                    cpu_quota=50000,         # 50% CPU limit
                    detach=True,
                    pids_limit=50            # Limit number of processes
                )

                # Start container
                container.start()

                # Copy files into the container using put_archive
                container.put_archive("/workspace", tar_stream)

                # Run pytest with shell timeout (OS level, always works)
                if self._has_pytest:
                    # Fast path: pytest pre-installed
                    cmd = f"timeout {self.timeout}s python3 -m pytest -v test_*.py 2>&1"
                else:
                    # Slow path: install pytest first (fallback image)
                    cmd = f"pip install -q pytest 2>/dev/null && timeout {self.timeout}s python3 -m pytest -v test_*.py 2>&1"

                exec_result = container.exec_run(
                    cmd=["sh", "-c", cmd],
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

            else:
                # Subprocess mode: Execute directly using Python subprocess
                # Create a temporary directory for the test
                with tempfile.TemporaryDirectory() as temp_dir:
                    # Write all files to temp directory
                    for filename, content in files.items():
                        filepath = os.path.join(temp_dir, filename)
                        with open(filepath, "w") as f:
                            f.write(content)

                    # Create conftest.py to set up the Python path (use temp_dir, not /workspace)
                    conftest_path = os.path.join(temp_dir, "conftest.py")
                    with open(conftest_path, "w") as f:
                        f.write(f"import sys; sys.path.insert(0, '{temp_dir}')")

                    # Check if pytest is available, otherwise use unittest
                    try:
                        subprocess.run(["python3", "-m", "pytest", "--version"],
                                      capture_output=True, timeout=5, check=True)
                        use_pytest = True
                    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
                        use_pytest = False

                    if use_pytest:
                        # Construct the pytest command (no --timeout, use subprocess timeout instead)
                        cmd = [
                            "python3", "-m", "pytest",
                            "-v",
                            os.path.join(temp_dir, "test_solution.py")
                        ]
                    else:
                        # Fallback to unittest
                        cmd = [
                            "python3", "-m", "unittest",
                            "discover", "-s", temp_dir, "-p", "test_*.py", "-v"
                        ]

                    # Run the command with a timeout
                    try:
                        result = subprocess.run(
                            cmd,
                            cwd=temp_dir,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            timeout=self.timeout
                        )
                        output = result.stdout + result.stderr
                        success = result.returncode == 0
                    except subprocess.CalledProcessError as e:
                        output = (e.stdout or "") + (e.stderr or "")
                        success = False
                    except subprocess.TimeoutExpired:
                        output = f"TIMEOUT: Execution exceeded {self.timeout} seconds\n"
                        success = False
                    except FileNotFoundError:
                        output = "ERROR: Python not found in PATH"
                        success = False

                    duration = time.time() - start_time

                    return {
                        "success": success,
                        "output": output,
                        "duration": duration
                    }

        except Exception as e:
            duration = time.time() - start_time
            error_type = type(e).__name__
            return {
                "success": False,
                "output": f"{error_type}: {str(e)}",
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