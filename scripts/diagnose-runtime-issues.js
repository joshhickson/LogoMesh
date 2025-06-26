
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr, command });
    });
  });
}

async function diagnoseProblem() {
  console.log('🔍 LogoMesh Runtime Diagnostics\n');
  
  const checks = [
    { name: 'Backend Build Status', cmd: 'cd server && npm run build' },
    { name: 'Port 3001 Availability', cmd: 'netstat -tulpn | grep :3001 || ss -tulpn | grep :3001' },
    { name: 'Node Processes', cmd: 'ps aux | grep -E "(node|npm)" | grep -v grep' },
    { name: 'API Health Check', cmd: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/health || echo "FAILED"' },
    { name: 'Auth Endpoint Test', cmd: 'curl -v http://localhost:3001/api/v1/auth/user 2>&1 | head -20' },
    { name: 'Server Files Present', cmd: 'ls -la server/dist/ 2>/dev/null | head -10 || echo "No dist directory"' },
    { name: 'Missing Types Check', cmd: 'cd server && npm list @types/sqlite3 @types/uuid 2>&1 | grep -E "(missing|UNMET)" || echo "Types OK"' },
    { name: 'Frontend ESLint Errors', cmd: 'npm run lint 2>&1 | grep -E "(error|Error)" | head -10' }
  ];

  const results = [];
  for (const check of checks) {
    console.log(`Running: ${check.name}...`);
    const result = await runCommand(check.cmd);
    results.push({ ...check, ...result });
    console.log(`${result.error ? '❌' : '✅'} ${check.name}\n`);
  }

  // Generate report
  const report = results.map(r => 
    `## ${r.name}\n**Command**: \`${r.command}\`\n**Status**: ${r.error ? 'FAILED' : 'PASSED'}\n**Output**:\n\`\`\`\n${r.stdout || r.stderr || 'No output'}\n\`\`\`\n`
  ).join('\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `test-results/2025-06-26/runtime-diagnostics-${timestamp}.md`;
  
  fs.writeFileSync(reportPath, `# Runtime Diagnostics Report\n\n${report}`);
  console.log(`📝 Full report saved to: ${reportPath}`);

  // Quick summary
  const failures = results.filter(r => r.error);
  console.log(`\n📊 Summary: ${results.length - failures.length}/${results.length} checks passed`);
  if (failures.length > 0) {
    console.log('❌ Failed checks:', failures.map(f => f.name).join(', '));
  }
}

diagnoseProblem().catch(console.error);
