
#!/bin/bash

# The Timekeeper - Updates timestamp file for LogoMesh agents
# This script creates/overwrites docs/_timestamp.md with current UTC time

# Get current UTC date and time
CURRENT_DATE=$(date -u +"%Y-%m-%d")
CURRENT_TIME=$(date -u +"%H:%M:%S")

# Create the timestamp file content
cat > docs/_timestamp.md << EOF
# Current Session Timestamp
**Date:** ${CURRENT_DATE}
**Time:** ${CURRENT_TIME} (24-hour format)
EOF

echo "✔ Timestamp file updated: docs/_timestamp.md"
