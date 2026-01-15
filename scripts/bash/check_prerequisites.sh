#!/bin/bash

echo "Checking LogoMesh Prerequisites..."
echo ""

# Check Python
if command -v python3.11 &> /dev/null; then
    echo "✅ Python 3.11: $(python3.11 --version)"
else
    echo "❌ Python 3.11: Not installed"
fi

# Check uv
if command -v uv &> /dev/null; then
    echo "✅ uv: $(uv --version)"
else
    echo "❌ uv: Not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ "$NODE_VERSION" > "v20.0.0" ]]; then
        echo "✅ Node.js: $NODE_VERSION"
    else
        echo "⚠️  Node.js: $NODE_VERSION (v20+ recommended)"
    fi
else
    echo "❌ Node.js: Not installed"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm: Not installed"
fi

# Check Docker
if sudo docker ps &> /dev/null 2>&1; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker: Not accessible"
fi

# Check GPU
if command -v nvidia-smi &> /dev/null; then
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)
    if [ -n "$GPU_NAME" ]; then
        echo "✅ GPU: $GPU_NAME"
    else
        echo "⚠️  GPU: nvidia-smi found but no GPU detected"
    fi
else
    echo "⚠️  GPU: nvidia-smi not found (GPU optional for development)"
fi

# Check virtual environment
if [ -d ".venv" ]; then
    echo "✅ Virtual environment: .venv exists"
    if [ -f ".venv/bin/python" ]; then
        VENV_PYTHON=$(.venv/bin/python --version 2>&1)
        echo "   Python: $VENV_PYTHON"
    fi
else
    echo "❌ Virtual environment: .venv not found"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ Node modules: installed"
else
    echo "❌ Node modules: not installed"
fi

echo ""
echo "Run './scripts/bash/setup_all.sh' to install missing components."
