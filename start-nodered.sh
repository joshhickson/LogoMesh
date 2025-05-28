
#!/bin/bash

# Create Node-RED user directory if it doesn't exist
mkdir -p ~/.node-red

# Copy flows configuration
cp flows.json ~/.node-red/flows.json

echo "Starting Node-RED..."
echo "Access Node-RED at: http://localhost:1880"
echo "LogoMesh API should be running on: http://localhost:3001"
echo ""

# Start Node-RED
node-red --port 1880 --userDir ~/.node-red
