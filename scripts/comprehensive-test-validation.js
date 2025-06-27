
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function runTestSuite(name, command, workingDir = '.') {
  console.log(`\n🧪 Running ${name} tests...`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..', workingDir),
      env: { ...process.env, CI: 'true' }
    });
    
    console.log(`✅ ${name} tests passed`);
    
    // Export successful test results
    const reportPath = path.join(__dirname, '..', 'test-results', `${name.toLowerCase()}-success-${timestamp}.txt`);
    fs.writeFileSync(reportPath, `${name} Tests - SUCCESS\n\n${output}`);
    
    return { success: true, output, reportPath };
    
  } catch (error) {
    console.log(`❌ ${name} tests failed`);
    
    const errorOutput = `${name} Tests - FAILED
Exit Code: ${error.status}
Timestamp: ${new Date().toISOString()}

STDOUT:
${error.stdout || 'No stdout'}

STDERR:
${error.stderr || 'No stderr'}

Error Message:
${error.message}`;
    
    // Export failed test results
    const errorExportPath = path.join(__dirname, '..', 'error_exports', 'test_errors');
    ensureDirectoryExists(errorExportPath);
    
    const reportPath = path.join(errorExportPath, `${name.toLowerCase()}-failed-${timestamp}.md`);
    fs.writeFileSync(reportPath, `# ${name} Test Failure Report\n\n\`\`\`\n${errorOutput}\n\`\`\``);
    
    console.log(`📄 Error report exported to: ${reportPath}`);
    
    return { success: false, output: errorOutput, reportPath };
  }
}

function main() {
  console.log('🔍 Running comprehensive test validation...');
  
  // Ensure directories exist
  ensureDirectoryExists(path.join(__dirname, '..', 'test-results'));
  ensureDirectoryExists(path.join(__dirname, '..', 'error_exports', 'test_errors'));
  
  const results = [];
  
  // Test frontend
  results.push(runTestSuite('Frontend', 'npm test'));
  
  // Test backend (if it exists and has tests)
  if (fs.existsSync(path.join(__dirname, '..', 'server', 'package.json'))) {
    results.push(runTestSuite('Backend', 'npm test', 'server'));
  }
  
  // Test linting
  results.push(runTestSuite('Lint', 'npm run lint'));
  
  // Summary
  console.log('\n📊 Test Summary:');
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}: Report at ${result.reportPath}`);
  });
  
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log(`\n❌ ${failedTests.length} test suite(s) failed. Check error exports for details.`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTestSuite, main };
