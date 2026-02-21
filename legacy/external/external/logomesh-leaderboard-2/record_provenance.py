"""Record provenance information (image digests, timestamp, and workflow metadata) for assessment results."""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: pyyaml required. Install with: pip install pyyaml")
    sys.exit(1)


def get_image_digest(image: str) -> str:
    """Get the RepoDigest for a docker image pulled from a registry."""
    result = subprocess.run(
        ["docker", "image", "inspect", image, "--format", "{{index .RepoDigests 0}}"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error: Failed to inspect image '{image}': {result.stderr.strip()}")
        sys.exit(1)

    digest = result.stdout.strip()
    if not digest:
        print(f"Error: No registry digest found for image '{image}'")
        sys.exit(1)

    return digest


def parse_compose(compose_path: Path) -> dict:
    """Parse docker-compose.yml."""
    return yaml.safe_load(compose_path.read_text())


def collect_image_digests(compose: dict) -> dict[str, str]:
    """Collect digests for all images in the compose file."""
    digests = {}

    for name, service in compose["services"].items():
        image = service.get("image")
        if image:
            digests[name] = get_image_digest(image)

    return digests


def collect_github_actions_metadata() -> dict[str, str] | None:
    """Collect GitHub Actions run metadata when available."""
    if not os.environ.get("GITHUB_ACTIONS"):
        return None

    env = os.environ
    repository = env.get("GITHUB_REPOSITORY")
    server_url = env.get("GITHUB_SERVER_URL")
    api_url = env.get("GITHUB_API_URL")
    run_id = env.get("GITHUB_RUN_ID")
    run_url = None
    repository_url = None
    if repository and server_url and run_id:
        run_url = f"{server_url}/{repository}/actions/runs/{run_id}"
    if repository and server_url:
        repository_url = f"{server_url}/{repository}"
    run_logs_url = None
    if repository and api_url and run_id:
        run_logs_url = f"{api_url}/repos/{repository}/actions/runs/{run_id}/logs"

    metadata = {
        "run_url": run_url,
        "run_logs_url": run_logs_url,
        "ref": env.get("GITHUB_REF"),
        "sha": env.get("GITHUB_SHA"),
        "repository_url": repository_url,
        "workflow_ref": env.get("GITHUB_WORKFLOW_REF"),
        "workflow_sha": env.get("GITHUB_WORKFLOW_SHA"),
    }

    return {key: value for key, value in metadata.items() if value}


def write_provenance(output_path: Path, image_digests: dict[str, str]) -> None:
    """Write provenance information to a JSON file."""
    provenance = {
        "image_digests": image_digests,
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    }
    github_actions = collect_github_actions_metadata()
    if github_actions:
        provenance["github_actions"] = github_actions

    with open(output_path, "w") as f:
        json.dump(provenance, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Record provenance information for assessment results")
    parser.add_argument("--compose", type=Path, required=True, help="Path to docker-compose.yml")
    parser.add_argument("--output", type=Path, required=True, help="Path to output provenance JSON file")
    args = parser.parse_args()

    if not args.compose.exists():
        print(f"Error: {args.compose} not found")
        sys.exit(1)

    compose = parse_compose(args.compose)
    image_digests = collect_image_digests(compose)
    write_provenance(args.output, image_digests)

    print(f"Recorded provenance to {args.output} ({len(image_digests)} images)")


if __name__ == "__main__":
    main()
