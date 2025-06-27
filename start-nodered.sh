
#!/bin/bash

# Create Node-RED user directory if it doesn't exist
mkdir -p ~/.node-red

# Copy flows configuration if it exists
if [ -f "flows.json" ]; then
  cp flows.json ~/.node-red/flows.json
  echo "Copied flows.json to Node-RED user directory"
fi

echo "Starting Node-RED..."
echo "Access Node-RED at: http://localhost:1880"
echo "LogoMesh API should be running on: http://localhost:3001"
echo ""
echo "Note: HTTP nodes are built into Node-RED by default"
echo ""

# Copy settings file to Node-RED user directory
cp node-red-settings.js ~/.node-red/settings.js

# Start Node-RED with proper binding for Replit
node-red --port 1880 --userDir ~/.node-red --settings ~/.node-red/settings.js
