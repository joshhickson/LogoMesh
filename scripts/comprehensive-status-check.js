
#!/usr/bin/env node

/**
 * Comprehensive Status Check Script
 * Date: 07.03.2025
 * 
 * This script verifies all critical system components and exports detailed results
 * for TypeScript compilation, database schema, security implementation, and API endpoints.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure export directories exist
const exportDir = path.join(__dirname, '../test-results');
const errorExportDir = path.join(__dirname, '../error_exports/status_checks');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDirectoryExists(exportDir);
ensureDirectoryExists(errorExportDir);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

function runCommand(command, description, workingDir = '.') {
  console.log(`\n🔍 Checking: ${description}`);
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..', workingDir),
      env: { ...process.env, CI: 'true' }
    });
    
    console.log(`✅ ${description}: PASSED`);
    return { success: true, output, command, description };
    
  } catch (error) {
    console.log(`❌ ${description}: FAILED`);
    
    const errorOutput = `Command: ${command}
Exit Code: ${error.status}
Working Directory: ${workingDir}

STDOUT:
${error.stdout || 'No stdout'}

STDERR:
${error.stderr || 'No stderr'}

Error Message:
${error.message}`;
    
    return { success: false, output: errorOutput, command, description };
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  console.log(`📁 ${description}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  
  return {
    success: exists,
    output: exists ? `File exists: ${fullPath}` : `File missing: ${fullPath}`,
    description
  };
}

function analyzeSchemaAlignment() {
  console.log('\n🗃️  Analyzing Database Schema Alignment...');
  
  const results = {
    schemaFile: checkFileExists('core/db/schema.sql', 'Database Schema File'),
    typesFile: checkFileExists('contracts/types.ts', 'TypeScript Types File'),
    sqliteAdapter: checkFileExists('core/storage/sqliteAdapter.ts', 'SQLite Adapter File')
  };
  
  // Check for specific schema elements
  try {
    const schemaContent = fs.readFileSync(path.join(__dirname, '../core/db/schema.sql'), 'utf8');
    const typesContent = fs.readFileSync(path.join(__dirname, '../contracts/types.ts'), 'utf8');
    
    const schemaAnalysis = {
      hasThoughtsTable: schemaContent.includes('CREATE TABLE IF NOT EXISTS thoughts'),
      hasSegmentsTable: schemaContent.includes('CREATE TABLE IF NOT EXISTS segments'),
      hasTagsTable: schemaContent.includes('CREATE TABLE IF NOT EXISTS tags'),
      hasThoughtBubbleId: schemaContent.includes('thought_bubble_id'),
      hasPositionFields: schemaContent.includes('position_x') && schemaContent.includes('position_y')
    };
    
    const typesAnalysis = {
      hasThoughtRecord: typesContent.includes('interface ThoughtRecord'),
      hasSegmentRecord: typesContent.includes('interface SegmentRecord'),
      hasDatabaseRow: typesContent.includes('interface DatabaseRow'),
      hasThoughtData: typesContent.includes('interface ThoughtData')
    };
    
    results.schemaAnalysis = schemaAnalysis;
    results.typesAnalysis = typesAnalysis;
    
  } catch (error) {
    results.error = `Failed to analyze schema files: ${error.message}`;
  }
  
  return results;
}

function checkSecurityImplementation() {
  console.log('\n🔒 Checking Security Implementation Status...');
  
  const results = {
    pluginHost: checkFileExists('core/services/pluginHost.ts', 'Plugin Host Service'),
    pluginInterface: checkFileExists('core/plugins/pluginRuntimeInterface.ts', 'Plugin Runtime Interface'),
    vm2Package: false,
    jwtImplementation: false,
    rateLimiting: false
  };
  
  // Check for VM2 in package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    results.vm2Package = !!(packageJson.dependencies?.vm2 || packageJson.devDependencies?.vm2);
  } catch (error) {
    results.packageJsonError = error.message;
  }
  
  // Check for JWT implementation
  try {
    const serverFiles = ['server/src/routes/userRoutes.ts', 'server/src/index.ts'];
    for (const file of serverFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('jwt') || content.includes('jsonwebtoken')) {
          results.jwtImplementation = true;
          break;
        }
      }
    }
  } catch (error) {
    results.jwtError = error.message;
  }
  
  // Check for rate limiting
  try {
    const serverIndex = path.join(__dirname, '../server/src/index.ts');
    if (fs.existsSync(serverIndex)) {
      const content = fs.readFileSync(serverIndex, 'utf8');
      results.rateLimiting = content.includes('rateLimit') || content.includes('express-rate-limit');
    }
  } catch (error) {
    results.rateLimitError = error.message;
  }
  
  return results;
}

function checkAPIEndpoints() {
  console.log('\n🌐 Checking API Endpoint Implementation...');
  
  const results = {
    adminRoutes: checkFileExists('server/src/routes/adminRoutes.ts', 'Admin Routes'),
    thoughtRoutes: checkFileExists('server/src/routes/thoughtRoutes.ts', 'Thought Routes'),
    llmRoutes: checkFileExists('server/src/routes/llmRoutes.ts', 'LLM Routes'),
    endpoints: {
      health: false,
      status: false,
      auth: false
    }
  };
  
  // Check specific endpoints
  try {
    const routeFiles = [
      'server/src/routes/adminRoutes.ts',
      'server/src/routes/userRoutes.ts',
      'server/src/index.ts'
    ];
    
    for (const file of routeFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('/health')) {
          results.endpoints.health = true;
        }
        if (content.includes('/status')) {
          results.endpoints.status = true;
        }
        if (content.includes('/auth') || content.includes('/login')) {
          results.endpoints.auth = true;
        }
      }
    }
  } catch (error) {
    results.endpointError = error.message;
  }
  
  return results;
}

async function main() {
  console.log('🚀 Starting Comprehensive Status Check...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };
  
  // 1. TypeScript Compilation Status
  console.log('\n=== TYPESCRIPT COMPILATION STATUS ===');
  results.checks.typescript = {
    frontend: runCommand('npx tsc --noEmit', 'Frontend TypeScript Compilation'),
    backend: runCommand('npx tsc --noEmit', 'Backend TypeScript Compilation', 'server')
  };
  
  // 2. ESLint Status
  console.log('\n=== ESLINT STATUS ===');
  results.checks.eslint = runCommand('npm run lint', 'ESLint Check');
  
  // 3. Database Schema Alignment
  console.log('\n=== DATABASE SCHEMA ALIGNMENT ===');
  results.checks.database = analyzeSchemaAlignment();
  
  // 4. Security Implementation Status
  console.log('\n=== SECURITY IMPLEMENTATION STATUS ===');
  results.checks.security = checkSecurityImplementation();
  
  // 5. API Endpoint Completeness
  console.log('\n=== API ENDPOINT COMPLETENESS ===');
  results.checks.api = checkAPIEndpoints();
  
  // 6. Backend Build Status
  console.log('\n=== BACKEND BUILD STATUS ===');
  results.checks.build = runCommand('npm run build', 'Backend Build', 'server');
  
  // Generate comprehensive report
  const report = generateStatusReport(results);
  
  // Save results
  const reportPath = path.join(exportDir, `comprehensive-status-${timestamp}.md`);
  fs.writeFileSync(reportPath, report);
  
  // Also save as latest
  const latestPath = path.join(exportDir, 'latest-status-check.md');
  fs.writeFileSync(latestPath, report);
  
  console.log(`\n📋 Comprehensive status report saved to: ${reportPath}`);
  console.log(`📋 Latest status available at: ${latestPath}`);
  
  // Summary
  const criticalIssues = [];
  if (!results.checks.typescript.frontend.success) criticalIssues.push('Frontend TypeScript compilation');
  if (!results.checks.typescript.backend.success) criticalIssues.push('Backend TypeScript compilation');
  if (!results.checks.security.vm2Package) criticalIssues.push('VM2 plugin sandboxing');
  if (!results.checks.security.jwtImplementation) criticalIssues.push('JWT authentication');
  if (!results.checks.api.endpoints.status) criticalIssues.push('/status endpoint');
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`Critical Issues Found: ${criticalIssues.length}`);
  if (criticalIssues.length > 0) {
    console.log('❌ Critical Issues:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ No critical issues found!');
  }
}

function generateStatusReport(results) {
  const { checks } = results;
  
  return `# Comprehensive Status Report
**Generated:** ${results.timestamp}

## Executive Summary

### Critical Issues Status
- **TypeScript Compilation**: ${checks.typescript.frontend.success && checks.typescript.backend.success ? '✅ PASSING' : '❌ FAILING'}
- **Database Schema Alignment**: ${checks.database.schemaFile.success && checks.database.typesFile.success ? '✅ FILES EXIST' : '❌ MISSING FILES'}
- **Security Implementation**: ${checks.security.vm2Package && checks.security.jwtImplementation ? '✅ IMPLEMENTED' : '❌ INCOMPLETE'}
- **API Endpoint Completeness**: ${checks.api.endpoints.health && checks.api.endpoints.status ? '✅ COMPLETE' : '❌ INCOMPLETE'}

## Detailed Analysis

### 1. TypeScript Compilation Status

#### Frontend Compilation
- **Status**: ${checks.typescript.frontend.success ? '✅ PASSED' : '❌ FAILED'}
- **Command**: \`npx tsc --noEmit\`

${checks.typescript.frontend.success ? 
  '**Result**: No compilation errors found.' : 
  '**Errors Found**:\n```\n' + checks.typescript.frontend.output + '\n```'
}

#### Backend Compilation
- **Status**: ${checks.typescript.backend.success ? '✅ PASSED' : '❌ FAILED'}
- **Command**: \`cd server && npx tsc --noEmit\`

${checks.typescript.backend.success ? 
  '**Result**: No compilation errors found.' : 
  '**Errors Found**:\n```\n' + checks.typescript.backend.output + '\n```'
}

### 2. Database Schema Alignment

#### File Existence
- **Schema File**: ${checks.database.schemaFile.success ? '✅ EXISTS' : '❌ MISSING'}
- **Types File**: ${checks.database.typesFile.success ? '✅ EXISTS' : '❌ MISSING'}
- **SQLite Adapter**: ${checks.database.sqliteAdapter.success ? '✅ EXISTS' : '❌ MISSING'}

#### Schema Analysis
${checks.database.schemaAnalysis ? `
- **Thoughts Table**: ${checks.database.schemaAnalysis.hasThoughtsTable ? '✅' : '❌'}
- **Segments Table**: ${checks.database.schemaAnalysis.hasSegmentsTable ? '✅' : '❌'}
- **Tags Table**: ${checks.database.schemaAnalysis.hasTagsTable ? '✅' : '❌'}
- **Thought Bubble ID**: ${checks.database.schemaAnalysis.hasThoughtBubbleId ? '✅' : '❌'}
- **Position Fields**: ${checks.database.schemaAnalysis.hasPositionFields ? '✅' : '❌'}
` : 'Schema analysis failed'}

#### Types Analysis
${checks.database.typesAnalysis ? `
- **ThoughtRecord Interface**: ${checks.database.typesAnalysis.hasThoughtRecord ? '✅' : '❌'}
- **SegmentRecord Interface**: ${checks.database.typesAnalysis.hasSegmentRecord ? '✅' : '❌'}
- **DatabaseRow Interface**: ${checks.database.typesAnalysis.hasDatabaseRow ? '✅' : '❌'}
- **ThoughtData Interface**: ${checks.database.typesAnalysis.hasThoughtData ? '✅' : '❌'}
` : 'Types analysis failed'}

### 3. Security Implementation Status

#### Core Security Components
- **Plugin Host Service**: ${checks.security.pluginHost.success ? '✅ EXISTS' : '❌ MISSING'}
- **Plugin Runtime Interface**: ${checks.security.pluginInterface.success ? '✅ EXISTS' : '❌ MISSING'}

#### Security Features
- **VM2 Package**: ${checks.security.vm2Package ? '✅ INSTALLED' : '❌ NOT INSTALLED'}
- **JWT Authentication**: ${checks.security.jwtImplementation ? '✅ IMPLEMENTED' : '❌ NOT IMPLEMENTED'}
- **Rate Limiting**: ${checks.security.rateLimiting ? '✅ IMPLEMENTED' : '❌ NOT IMPLEMENTED'}

### 4. API Endpoint Completeness

#### Route Files
- **Admin Routes**: ${checks.api.adminRoutes.success ? '✅ EXISTS' : '❌ MISSING'}
- **Thought Routes**: ${checks.api.thoughtRoutes.success ? '✅ EXISTS' : '❌ MISSING'}
- **LLM Routes**: ${checks.api.llmRoutes.success ? '✅ EXISTS' : '❌ MISSING'}

#### Critical Endpoints
- **/health Endpoint**: ${checks.api.endpoints.health ? '✅ IMPLEMENTED' : '❌ MISSING'}
- **/status Endpoint**: ${checks.api.endpoints.status ? '✅ IMPLEMENTED' : '❌ MISSING'}
- **Authentication Endpoints**: ${checks.api.endpoints.auth ? '✅ IMPLEMENTED' : '❌ MISSING'}

### 5. Build Status

#### Backend Build
- **Status**: ${checks.build.success ? '✅ PASSED' : '❌ FAILED'}
- **Command**: \`cd server && npm run build\`

${checks.build.success ? 
  '**Result**: Build completed successfully.' : 
  '**Build Errors**:\n```\n' + checks.build.output + '\n```'
}

### 6. ESLint Status

- **Status**: ${checks.eslint.success ? '✅ PASSED' : '❌ VIOLATIONS FOUND'}

${checks.eslint.success ? 
  '**Result**: No linting violations found.' : 
  '**Violations Found**:\n```\n' + checks.eslint.output + '\n```'
}

## Recommendations

### Immediate Actions Required
${!checks.typescript.frontend.success || !checks.typescript.backend.success ? 
  '1. **Fix TypeScript compilation errors** - Critical blocking issue\n' : ''
}${!checks.security.vm2Package ? 
  '2. **Install VM2 package** - Required for plugin sandboxing\n' : ''
}${!checks.security.jwtImplementation ? 
  '3. **Implement JWT authentication** - Security requirement\n' : ''
}${!checks.api.endpoints.status ? 
  '4. **Implement /status endpoint** - Monitoring requirement\n' : ''
}${!checks.security.rateLimiting ? 
  '5. **Add rate limiting** - DoS protection\n' : ''
}

### Next Steps
1. Address critical compilation errors first
2. Implement missing security features
3. Complete API endpoint implementation
4. Verify end-to-end functionality

---
**Report Generated**: ${results.timestamp}
**Export Location**: test-results/comprehensive-status-${results.timestamp.replace(/[:.]/g, '-')}.md
`;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generateStatusReport, analyzeSchemaAlignment, checkSecurityImplementation, checkAPIEndpoints };
