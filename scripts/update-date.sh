
#!/bin/bash

# The Timekeeper - Updates timestamp file for LogoMesh agents
# This script creates/overwrites docs/_timestamp.md with current Pacific Time (PT)

# Force Pacific Time zone
export TZ=America/Los_Angeles

# Get current date and time in PT
CURRENT_DATE=$(date +"%Y-%m-%d")
CURRENT_TIME=$(date +"%H:%M:%S")

# Create the timestamp file content
cat > docs/_timestamp.md << EOF
# Current Session Timestamp
**Date:** ${CURRENT_DATE}
**Time:** ${CURRENT_TIME} (Pacific Time, 24-hour format)
EOF

echo "✔ Timestamp file updated: docs/_timestamp.md"
