
#!/bin/bash

# The Timekeeper - Updates timestamp file for LogoMesh agents
# This script creates/overwrites docs/_timestamp.md with current UTC time

# Get current Pacific Time date and time
CURRENT_DATE=$(TZ="America/Los_Angeles" date +"%Y-%m-%d")
CURRENT_TIME=$(TZ="America/Los_Angeles" date +"%H:%M:%S")

# Create the timestamp file content
cat > docs/_timestamp.md << EOF
# Current Session Timestamp
**Date:** ${CURRENT_DATE}
**Time:** ${CURRENT_TIME} (Pacific Time, 24-hour format)
EOF

echo "✔ Timestamp file updated: docs/_timestamp.md"
