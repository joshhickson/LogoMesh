
#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runTestsWithArchive() {
  const timestamp = new Date().toISOString();
  const shortTimestamp = timestamp.replace(/[:.]/g, '-').split('.')[0] + 'Z';
  const filename = `test-results/test-run-${shortTimestamp}.txt`;
  
  console.log('🧪 Running comprehensive test suite with archival...');
  console.log(`📁 Results will be saved to: ${filename}`);
  console.log(`⏰ Started at: ${timestamp}`);
  
  const testProcess = spawn('npm', ['test'], { 
    stdio: 'pipe',
    env: { ...process.env, CI: 'true' }
  });
  
  let stdout = '';
  let stderr = '';
  
  testProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdout += output;
    process.stdout.write(output);
  });
  
  testProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderr += output;
    process.stderr.write(output);
  });
  
  testProcess.on('close', (code) => {
    const report = generateDetailedReport(stdout, stderr, code, timestamp);
    saveTestResults(filename, report);
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`Exit Code: ${code}`);
    console.log(`Status: ${code === 0 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Report saved to: ${filename}`);
    console.log(`Latest results: test-results/latest-test-run.txt`);
    
    // Also update latest-test-run.txt
    saveTestResults('test-results/latest-test-run.txt', report);
    
    // Generate quick summary
    const analysis = generateQuickAnalysis(stdout, stderr, code);
    console.log(`\n🔍 Quick Analysis:\n${analysis}`);
  });
}

function generateDetailedReport(stdout, stderr, exitCode, timestamp) {
  const analysis = generateQuickAnalysis(stdout, stderr, exitCode);
  
  return `# Test Run Report - ${timestamp}

## Summary
- Exit Code: ${exitCode}
- Status: ${exitCode === 0 ? '✅ PASSED' : '❌ FAILED'}
- Timestamp: ${timestamp}

## Standard Output
\`\`\`
${stdout}
\`\`\`

## Standard Error
\`\`\`
${stderr}
\`\`\`

## Environment Info
- Node Version: ${process.version}
- Platform: ${process.platform}
- Working Directory: ${process.cwd()}

## Quick Analysis
${analysis}
`;
}

function generateQuickAnalysis(stdout, stderr, code) {
  const analysis = [];

  // Test count analysis
  const testCountMatch = stdout.match(/(\d+) passed/);
  const testFailMatch = stdout.match(/(\d+) failed/);

  if (testCountMatch) {
    analysis.push(`✅ ${testCountMatch[1]} tests passed`);
  }

  if (testFailMatch) {
    analysis.push(`❌ ${testFailMatch[1]} tests failed`);
  }

  // Common error patterns
  if (stderr.includes('CJS build of Vite\'s Node API is deprecated')) {
    analysis.push('⚠️  Vite CJS deprecation warning detected');
  }

  if (stdout.includes('webkitSpeechRecognition')) {
    analysis.push('🎤 Speech recognition test issues detected');
  }

  if (stdout.includes('HTMLCanvasElement')) {
    analysis.push('🎨 Canvas element test issues detected');
  }

  if (stdout.includes('<body />')) {
    analysis.push('🚨 Component rendering failure - empty body elements detected');
  }

  if (stdout.includes('getSessionId')) {
    analysis.push('🔧 ErrorLogger sessionStorage issues detected');
  }

  // Performance analysis
  const durationMatch = stdout.match(/Duration\s+(\d+\.?\d*)s/);
  if (durationMatch) {
    const duration = parseFloat(durationMatch[1]);
    analysis.push(`⏱️  Test duration: ${duration}s ${duration > 30 ? '(slow)' : '(good)'}`);
  }

  return analysis.length > 0 ? analysis.join('\n') : 'No specific issues detected';
}

function saveTestResults(filename, content) {
  // Ensure directory exists
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filename, content, 'utf8');
}

// Run if called directly
if (require.main === module) {
  runTestsWithArchive();
}

module.exports = {
  runTestsWithArchive,
  generateQuickAnalysis,
  generateDetailedReport,
  saveTestResults
};
