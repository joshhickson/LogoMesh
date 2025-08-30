#!/bin/bash

# This script checks for hardcoded secrets in the repository.
# It fails if it finds patterns commonly associated with secrets.

# Patterns to search for, using extended regex syntax
PATTERNS="sk-|jwtSecret=changeme|OPENAI_API_KEY=|AWS_ACCESS_KEY=|AWS_SECRET_KEY="

# Directories and files to exclude from the search
EXCLUDE_DIRS="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=docs --exclude-dir=attached_assets"
EXCLUDE_FILES="--exclude=package.json --exclude=package-lock.json --exclude=.env.example --exclude=CHANGELOG.md --exclude=check-secrets.sh"

echo "Scanning for hardcoded secrets..."

# The -q flag makes grep quiet (no output), and we check its exit code.
# grep returns 0 if a match is found, and 1 if no match is found.
if grep -q -rE "$PATTERNS" . $EXCLUDE_DIRS $EXCLUDE_FILES; then
  echo "===================================================="
  echo "  ERROR: Potential hardcoded secret found!"
  echo "===================================================="
  # Grep again, but this time show the findings
  grep -rE "$PATTERNS" . $EXCLUDE_DIRS $EXCLUDE_FILES
  exit 1
else
  echo "No hardcoded secrets found. Check passed."
  exit 0
fi
