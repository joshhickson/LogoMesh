#!/bin/bash
set -e

echo "🚀 LogoMesh Setup Script for Lambda Labs Instances"
echo "=================================================="

# 1. Check we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    echo "❌ Error: Run this script from the LogoMesh project root"
    exit 1
fi

# 2. Create .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created"
else
    echo "✅ .env already exists"
fi

# 3. Install Python 3.11
echo "🐍 Checking Python 3.11..."
if ! command -v python3.11 &> /dev/null; then
    echo "Installing Python 3.11..."
    sudo apt-get update
    sudo apt-get install -y python3.11 python3.11-venv
fi
echo "✅ Python 3.11 ready: $(python3.11 --version)"

# 4. Install uv
echo "📦 Installing uv..."
if ! command -v uv &> /dev/null; then
    pip install uv --quiet
fi
echo "✅ uv installed: $(uv --version)"

# 5. Sync Python dependencies
echo "📦 Installing Python dependencies (this may take 5-10 minutes)..."
uv sync --python 3.11
echo "✅ Python dependencies installed"

# 6. Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "v0.0.0")
REQUIRED_VERSION="v20.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "Installing Node.js v20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get remove -y libnode-dev 2>/dev/null || true
    sudo apt-get install -y nodejs
fi
echo "✅ Node.js v20+ ready: $(node --version)"

# 7. Enable pnpm
echo "📦 Enabling pnpm..."
sudo corepack enable
echo "✅ pnpm enabled: $(pnpm --version)"

# 8. Install Node dependencies
echo "📦 Installing Node.js dependencies (this may take 3-5 minutes)..."
pnpm install
echo "✅ Node.js dependencies installed"

# 9. Verify Docker
echo "🐳 Verifying Docker..."
if sudo docker ps &> /dev/null; then
    echo "✅ Docker is ready: $(docker --version)"
else
    echo "❌ Docker is not accessible. Please check Docker installation."
    exit 1
fi

# 10. Final verification
echo ""
echo "✅ Setup complete!"
echo ""
echo "Verification:"
echo "  Python:  $(python3.11 --version)"
echo "  uv:      $(uv --version)"
echo "  Node.js: $(node --version)"
echo "  pnpm:    $(pnpm --version)"
echo "  Docker:  $(docker --version)"
echo ""
echo "🚀 Next steps:"
echo "   1. Launch the Arena: sudo ./scripts/bash/launch_arena.sh"
echo "   2. Run tests: sudo ./scripts/bash/test_agents.sh"
echo ""
