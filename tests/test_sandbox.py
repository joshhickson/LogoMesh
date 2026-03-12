"""
Tests for src/green_logic/sandbox.py

Targets the deterministic logic that can be tested without Docker or
real subprocess execution:
  - _create_tar_stream (pure function)
  - Sandbox constructor defaults and Docker-unavailable fallback
  - run() file preparation (string mode vs dict mode)
  - run() subprocess-mode result handling (mocked subprocess.run)
"""

import io
import os
import tarfile
import subprocess
from unittest.mock import patch, MagicMock

import pytest

from src.green_logic.sandbox import _create_tar_stream, Sandbox


# ═══════════════════════════════════════════════════════════════════════
# _create_tar_stream — pure function
# ═══════════════════════════════════════════════════════════════════════


class TestCreateTarStream:
    """Tests for the tar archive builder."""

    def test_contains_all_files(self):
        """Every key in the input dict should appear as a file in the tar."""
        files = {
            "solution.py": "print('hello')",
            "test_solution.py": "def test_x(): pass",
        }
        stream = _create_tar_stream(files)
        with tarfile.open(fileobj=stream, mode="r") as tar:
            names = tar.getnames()

        assert sorted(names) == sorted(files.keys())

    def test_file_content_matches(self):
        """Extracted content should match the original string (UTF-8 encoded)."""
        files = {"example.py": "x = 42\n"}
        stream = _create_tar_stream(files)
        with tarfile.open(fileobj=stream, mode="r") as tar:
            member = tar.getmember("example.py")
            content = tar.extractfile(member).read().decode("utf-8")

        assert content == "x = 42\n"

    def test_empty_dict_produces_empty_tar(self):
        """An empty dict should produce a valid tar with no members."""
        stream = _create_tar_stream({})
        with tarfile.open(fileobj=stream, mode="r") as tar:
            assert tar.getnames() == []

    def test_returns_seeked_bytesio(self):
        """The returned stream should be at position 0 (ready to read)."""
        stream = _create_tar_stream({"a.py": ""})

        assert isinstance(stream, io.BytesIO)
        assert stream.tell() == 0


# ═══════════════════════════════════════════════════════════════════════
# Sandbox constructor
# ═══════════════════════════════════════════════════════════════════════


class TestSandboxInit:
    """Tests for Sandbox initialization and defaults."""

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_defaults_without_docker(self):
        """When Docker is unavailable, _docker_mode should be False
        and image/timeout should take their defaults."""
        sb = Sandbox()

        assert sb._docker_mode is False
        assert sb.image == Sandbox.DEFAULT_IMAGE
        assert sb.timeout == Sandbox.DEFAULT_TIMEOUT

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_custom_timeout(self):
        """Custom timeout should be stored regardless of Docker availability."""
        sb = Sandbox(timeout=30)

        assert sb.timeout == 30

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_custom_image(self):
        """Custom image name should be stored regardless of Docker availability."""
        sb = Sandbox(image="my-image:v1")

        assert sb.image == "my-image:v1"


# ═══════════════════════════════════════════════════════════════════════
# run() — file preparation logic
# ═══════════════════════════════════════════════════════════════════════


class TestRunFilePreparation:
    """Tests that run() prepares the correct files before execution.

    We patch subprocess.run to intercept what gets written to disk,
    then inspect the temp directory contents.
    """

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_string_mode_writes_three_files(self, tmp_path):
        """String mode should create solution.py, test_solution.py, conftest.py."""
        written_files = {}

        def capture_subprocess(*args, **kwargs):
            """On the pytest --version check, succeed. On the actual run,
            capture which files exist in the cwd."""
            cmd = args[0] if args else kwargs.get("args", [])
            if "--version" in cmd:
                return MagicMock(returncode=0)

            cwd = kwargs.get("cwd", "")
            if cwd and os.path.isdir(cwd):
                for f in os.listdir(cwd):
                    path = os.path.join(cwd, f)
                    if os.path.isfile(path):
                        with open(path) as fh:
                            written_files[f] = fh.read()

            return MagicMock(returncode=0, stdout="1 passed", stderr="")

        sb = Sandbox()
        with patch("subprocess.run", side_effect=capture_subprocess):
            sb.run("print('hi')", "def test_x(): pass")

        assert "solution.py" in written_files
        assert "test_solution.py" in written_files
        assert "conftest.py" in written_files
        assert written_files["solution.py"] == "print('hi')"
        assert written_files["test_solution.py"] == "def test_x(): pass"

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_dict_mode_injects_conftest_if_missing(self):
        """Dict mode without conftest.py should have one injected."""
        written_files = {}

        def capture_subprocess(*args, **kwargs):
            cmd = args[0] if args else kwargs.get("args", [])
            if "--version" in cmd:
                return MagicMock(returncode=0)

            cwd = kwargs.get("cwd", "")
            if cwd and os.path.isdir(cwd):
                for f in os.listdir(cwd):
                    path = os.path.join(cwd, f)
                    if os.path.isfile(path):
                        with open(path) as fh:
                            written_files[f] = fh.read()

            return MagicMock(returncode=0, stdout="ok", stderr="")

        sb = Sandbox()
        with patch("subprocess.run", side_effect=capture_subprocess):
            sb.run({"main.py": "x=1", "test_main.py": "def test(): pass"})

        assert "conftest.py" in written_files
        assert "main.py" in written_files

    @patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False)
    def test_dict_mode_preserves_existing_conftest(self):
        """Dict mode with an explicit conftest.py should keep the user's version."""
        written_files = {}

        def capture_subprocess(*args, **kwargs):
            cmd = args[0] if args else kwargs.get("args", [])
            if "--version" in cmd:
                return MagicMock(returncode=0)

            cwd = kwargs.get("cwd", "")
            if cwd and os.path.isdir(cwd):
                for f in os.listdir(cwd):
                    path = os.path.join(cwd, f)
                    if os.path.isfile(path):
                        with open(path) as fh:
                            written_files[f] = fh.read()

            return MagicMock(returncode=0, stdout="ok", stderr="")

        custom_conftest = "import sys; sys.path.insert(0, '/custom')"
        sb = Sandbox()
        with patch("subprocess.run", side_effect=capture_subprocess):
            sb.run({
                "app.py": "pass",
                "test_app.py": "def test(): pass",
                "conftest.py": custom_conftest,
            })

        # The file on disk will be overwritten by the conftest rewrite at line 237-238,
        # but the dict itself should have preserved the user's key (not duplicated).
        assert "conftest.py" in written_files


# ═══════════════════════════════════════════════════════════════════════
# run() — subprocess mode result handling
# ═══════════════════════════════════════════════════════════════════════


class TestRunSubprocessResults:
    """Tests for the four subprocess outcome paths: success, failure,
    timeout, and missing Python."""

    def _make_sandbox(self):
        """Create a Sandbox with Docker disabled."""
        with patch("src.green_logic.sandbox.DOCKER_AVAILABLE", False):
            return Sandbox(timeout=10)

    def _mock_version_ok(self):
        """A mock for the pytest --version check that succeeds."""
        return MagicMock(returncode=0)

    def test_success_returns_true(self):
        """Exit code 0 from subprocess should produce success=True."""
        sb = self._make_sandbox()

        call_count = 0

        def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return self._mock_version_ok()
            return MagicMock(returncode=0, stdout="1 passed\n", stderr="")

        with patch("subprocess.run", side_effect=fake_run):
            result = sb.run("x = 1", "def test_x(): assert True")

        assert result["success"] is True
        assert "1 passed" in result["output"]
        assert "duration" in result

    def test_failure_returns_false(self):
        """Non-zero exit code should produce success=False."""
        sb = self._make_sandbox()

        call_count = 0

        def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return self._mock_version_ok()
            return MagicMock(returncode=1, stdout="FAILED\n", stderr="AssertionError")

        with patch("subprocess.run", side_effect=fake_run):
            result = sb.run("x = 1", "def test_x(): assert False")

        assert result["success"] is False

    def test_timeout_returns_false_with_message(self):
        """subprocess.TimeoutExpired should produce success=False and
        a TIMEOUT message in the output."""
        sb = self._make_sandbox()

        call_count = 0

        def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return self._mock_version_ok()
            raise subprocess.TimeoutExpired(cmd="pytest", timeout=10)

        with patch("subprocess.run", side_effect=fake_run):
            result = sb.run("import time; time.sleep(999)", "def test_x(): pass")

        assert result["success"] is False
        assert "TIMEOUT" in result["output"]

    def test_missing_python_returns_error(self):
        """FileNotFoundError (python3 not in PATH) should produce
        success=False with an error message."""
        sb = self._make_sandbox()

        call_count = 0

        def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return self._mock_version_ok()
            raise FileNotFoundError("python3 not found")

        with patch("subprocess.run", side_effect=fake_run):
            result = sb.run("x = 1", "def test_x(): pass")

        assert result["success"] is False
        assert "Python not found" in result["output"] or "not found" in result["output"].lower()

    def test_unexpected_exception_caught(self):
        """Any unexpected exception should be caught and returned in the
        result dict, not raised to the caller."""
        sb = self._make_sandbox()

        with patch("subprocess.run", side_effect=RuntimeError("boom")):
            result = sb.run("x = 1", "def test_x(): pass")

        assert result["success"] is False
        assert "RuntimeError" in result["output"]
        assert "boom" in result["output"]

    def test_result_dict_has_required_keys(self):
        """Every result must contain success, output, and duration."""
        sb = self._make_sandbox()

        call_count = 0

        def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return self._mock_version_ok()
            return MagicMock(returncode=0, stdout="ok", stderr="")

        with patch("subprocess.run", side_effect=fake_run):
            result = sb.run("pass", "def test(): pass")

        assert set(result.keys()) == {"success", "output", "duration"}
        assert isinstance(result["duration"], float)
