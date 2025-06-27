
#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure error_exports directory exists
const errorExportsDir = path.join(__dirname, '..', 'error_exports');
if (!fs.existsSync(errorExportsDir)) {
  fs.mkdirSync(errorExportsDir, { recursive: true });
}

// Ensure test_errors subdirectory exists
const testErrorsDir = path.join(errorExportsDir, 'test_errors');
if (!fs.existsSync(testErrorsDir)) {
  fs.mkdirSync(testErrorsDir, { recursive: true });
}

function createTestReport(testOutput, timestamp) {
  const reportPath = path.join(testErrorsDir, `test-run-${timestamp}.md`);
  const report = `# Test Run Report
**Date:** ${new Date().toISOString()}
**Timestamp:** ${timestamp}

## Test Output
\`\`\`
${testOutput}
\`\`\`

## Summary
- Test run completed at ${new Date().toISOString()}
- Results exported to: ${reportPath}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`✅ Test report exported to: ${reportPath}`);
  return reportPath;
}

function runTests() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log('🧪 Running tests with error export...');
  
  try {
    // Run tests and capture output
    const testOutput = execSync('npm test', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, CI: 'true' }
    });
    
    console.log('✅ Tests completed successfully');
    console.log(testOutput);
    
    // Create test report
    createTestReport(testOutput, timestamp);
    
  } catch (error) {
    console.log('❌ Tests failed or encountered errors');
    console.log(error.stdout || error.message);
    
    // Still create report for failed tests
    const errorOutput = `Exit Code: ${error.status}
STDOUT:
${error.stdout || 'No stdout'}

STDERR:
${error.stderr || 'No stderr'}

Error Message:
${error.message}`;
    
    createTestReport(errorOutput, timestamp);
    
    // Also update latest test run
    const latestPath = path.join(__dirname, '..', 'test-results', 'latest-test-run.txt');
    if (fs.existsSync(path.dirname(latestPath))) {
      fs.writeFileSync(latestPath, errorOutput);
    }
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests, createTestReport };
