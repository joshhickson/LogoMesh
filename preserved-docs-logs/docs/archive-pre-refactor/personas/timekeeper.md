
# The Timekeeper

## Role Description

The Timekeeper is a silent utility agent within the LogoMesh ecosystem responsible for maintaining accurate timestamp metadata across all agent operations.

### What the Timekeeper Does
- Maintains a centralized timestamp file (`docs/_timestamp.md`) as the single source of truth
- Provides consistent UTC date/time formatting for all agents
- Eliminates timestamp guessing and inconsistencies across the system
- Ensures all log files and documentation use synchronized timestamps

### What the Timekeeper Does NOT Do
- Build, refactor, or comment on code
- Create logs or documentation files (other than the timestamp file)
- Make decisions about filenames or project structure
- Interact with other agents directly

## Script Behavior

The Timekeeper operates through a single Bash script: `scripts/update-date.sh`

### Line-by-Line Breakdown
```bash
#!/bin/bash
# Standard shebang for Bash execution

# The Timekeeper - Updates timestamp file for LogoMesh agents
# This script creates/overwrites docs/_timestamp.md with current UTC time

# Get current UTC date and time
CURRENT_DATE=$(date -u +"%Y-%m-%d")
CURRENT_TIME=$(date -u +"%H:%M:%S")
```
- Captures current UTC date in YYYY-MM-DD format
- Captures current UTC time in HH:MM:SS (24-hour) format

```bash
# Create the timestamp file content
cat > docs/_timestamp.md << EOF
# Current Session Timestamp
**Date:** ${CURRENT_DATE}
**Time:** ${CURRENT_TIME} (24-hour format)
EOF
```
- Overwrites/creates `docs/_timestamp.md` with formatted timestamp
- Uses heredoc syntax for clean file generation

```bash
echo "✔ Timestamp file updated: docs/_timestamp.md"
```
- Confirms successful execution

### Execution Frequency
- **Manual trigger**: Run before starting any agent coordination session
- **Development workflow**: Execute at the beginning of each dev session
- **Agent handoffs**: Run when switching between different personas
- **Documentation updates**: Execute before generating logs or reports

### Dependencies
The following agents depend on the Timekeeper:
- **The Archivist**: Uses timestamps for log filenames and progress tracking
- **Napoleon**: References timestamps for strategic planning logs
- **All log-creating agents**: Must align with centralized timestamp for consistency

## Reference Policy

### Single Source of Truth
- `docs/_timestamp.md` is the **only** authoritative timestamp source
- All agents must reference this file, never generate their own timestamps
- Timestamp format is standardized: `YYYY-MM-DD` and `HH:MM:SS`

### Strict Guidelines
1. **Never guess timestamps** - Always reference the timestamp file
2. **Synchronize before logging** - Run the script before creating any dated files
3. **Consistent naming** - Use the timestamp format for all log filenames
4. **UTC only** - All timestamps are in UTC to avoid timezone confusion

### File Naming Convention
Log files should follow this pattern:
```
[agent-name]_[YYYY-MM-DD]_[description].md
```

## Integration Suggestions

### Development Workflow Integration
```bash
# Add to package.json scripts
"scripts": {
  "timestamp": "bash scripts/update-date.sh",
  "dev": "bash scripts/update-date.sh && npm start"
}
```

### Manual Execution
```bash
# Run before starting any agent session
bash scripts/update-date.sh

# Verify timestamp is current
cat docs/_timestamp.md
```

### Automated Integration Options
- **Git hooks**: Add to pre-commit hooks for consistent timestamps
- **CI/CD pipeline**: Execute at the start of automated processes
- **Cron job**: Schedule regular updates (though manual execution is preferred)

### Agent Coordination Workflow
1. Human operator runs `bash scripts/update-date.sh`
2. All agents reference `docs/_timestamp.md` for their operations
3. Consistent timestamps across all generated files and logs
4. Re-run script when starting new sessions or switching contexts

## Technical Notes

- **Dependencies**: Only native shell commands (`date`, `echo`, `cat`)
- **Compatibility**: POSIX/Bash compliant
- **Output format**: Markdown for easy integration with documentation
- **Error handling**: Minimal - relies on shell command success
- **File location**: Fixed path ensures consistent agent access

---

*The Timekeeper operates silently but ensures temporal consistency across the entire LogoMesh ecosystem.*
