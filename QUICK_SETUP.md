# LogoMesh Quick Setup Reference Card

**For Lambda Labs Ubuntu + NVIDIA A100 Instance**

---

## 🚀 TL;DR - Copy & Paste This

### Option A: Automated (Recommended)

```bash
# Navigate to project
cd /home/ubuntu/LogoMesh

# Run automated setup (handles everything)
./scripts/bash/setup_all.sh

# Launch the Arena
sudo ./scripts/bash/launch_arena.sh
```

**Setup Time:** 15-20 minutes

---

### Option B: Manual Commands

```bash
# Navigate to project
cd /home/ubuntu/LogoMesh

# Configure environment
cp .env.example .env

# Install Python 3.11
sudo apt-get update && sudo apt-get install -y python3.11 python3.11-venv

# Install Python dependencies
pip install uv
uv sync --python 3.11

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get remove -y libnode-dev
sudo apt-get install -y nodejs

# Install Node dependencies
sudo corepack enable
pnpm install

# Launch the Arena
sudo ./scripts/bash/launch_arena.sh
```

**Setup Time:** 15-20 minutes

---

## 🔍 Quick Verification

**Automated check:**
```bash
./scripts/bash/check_prerequisites.sh
```

**Manual check:**
```bash
# Check all versions
python3.11 --version  # Should be 3.11.14
node --version        # Should be v20.20.0+
uv --version          # Should be 0.9.26+
pnpm --version        # Should be 8.15.7+
sudo docker ps        # Should show headers (empty is OK)
```

---

## ⚠️ Common Issues

### Error: "ray can't be installed"
**Fix:** Use `uv sync --python 3.11` (not 3.14+)

### Error: "trying to overwrite common.gypi"
**Fix:** Run `sudo apt-get remove -y libnode-dev` before Node.js install

### Error: "docker permission denied"
**Fix:** Use `sudo docker ps` or add user to docker group

---

## 📚 Full Documentation

- **Detailed Setup:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Technical Analysis:** [TECHNICAL_RECOMMENDATIONS.md](TECHNICAL_RECOMMENDATIONS.md)
- **Competition Info:** [JUDGES_START_HERE.md](JUDGES_START_HERE.md)
- **Project Overview:** [README.md](README.md)

---

## 🎯 Running Tests

```bash
# Full Arena test
sudo ./scripts/bash/test_agents.sh

# Local Green Agent
uv run main.py --role GREEN --host 0.0.0.0 --port 9000
```

---

## 📞 Quick Help

**Check logs:**
```bash
# Docker containers
sudo docker logs <container_id>

# Application logs
tail -f logs/*.log
```

**Reset environment:**
```bash
rm -rf .venv node_modules
./scripts/bash/setup_all.sh  # Or manual: uv sync --python 3.11 && pnpm install
```

---

*Last Updated: January 15, 2026*
