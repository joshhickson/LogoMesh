
#!/usr/bin/env node

/**
 * Test Runner Script
 * Date: 06.21.2025
 * 
 * This script runs the npm test command and captures comprehensive output
 * for analysis and debugging. It saves detailed test results including:
 * - Standard output and error streams
 * - Test pass/fail counts and duration
 * - Quick analysis of common issues (Canvas API, Speech Recognition, etc.)
 * - Environment information
 * 
 * Output files are saved to test-results/ directory with timestamps,
 * and a latest-test-run.txt file is maintained for easy access.
 * 
 * Usage: npm run test:capture
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create test results directory if it doesn't exist
const testResultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Generate timestamp for this test run
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(testResultsDir, `test-run-${timestamp}.txt`);

console.log(`🧪 Running tests and capturing output to: ${outputFile}`);

// Run the test command
const testProcess = spawn('npm', ['test'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

let stdout = '';
let stderr = '';

// Capture stdout
testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdout += output;
  process.stdout.write(output); // Still show in console
});

// Capture stderr
testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderr += output;
  process.stderr.write(output); // Still show in console
});

testProcess.on('close', (code) => {
  // Create comprehensive test report
  const report = `# Test Run Report - ${new Date().toISOString()}

## Summary
- Exit Code: ${code}
- Status: ${code === 0 ? '✅ PASSED' : '❌ FAILED'}
- Timestamp: ${new Date().toISOString()}

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
${generateQuickAnalysis(stdout, stderr, code)}
`;

  // Write the report
  fs.writeFileSync(outputFile, report);
  
  console.log(`\n📋 Test report saved to: ${outputFile}`);
  console.log(`📊 Test ${code === 0 ? 'PASSED' : 'FAILED'} with exit code: ${code}`);
  
  // Also create a "latest" symlink for easy access
  const latestFile = path.join(testResultsDir, 'latest-test-run.txt');
  if (fs.existsSync(latestFile)) {
    fs.unlinkSync(latestFile);
  }
  fs.writeFileSync(latestFile, report);
  
  process.exit(code);
});

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
  
  if (stdout.includes('multiple elements with the role')) {
    analysis.push('🔍 DOM query selector ambiguity detected');
  }
  
  // Performance analysis
  const durationMatch = stdout.match(/Duration\s+(\d+\.?\d*)s/);
  if (durationMatch) {
    const duration = parseFloat(durationMatch[1]);
    analysis.push(`⏱️  Test duration: ${duration}s ${duration > 30 ? '(slow)' : '(good)'}`);
  }
  
  return analysis.length > 0 ? analysis.join('\n') : 'No specific issues detected in quick analysis.';
}
