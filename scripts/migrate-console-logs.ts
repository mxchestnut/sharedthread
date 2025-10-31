#!/usr/bin/env tsx
/**
 * Script to migrate console.log/error/warn to error-logger utility
 * 
 * Usage:
 *   npx tsx scripts/migrate-console-logs.ts --dry-run  # Preview changes
 *   npx tsx scripts/migrate-console-logs.ts            # Apply changes
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

interface Migration {
  file: string;
  line: number;
  old: string;
  new: string;
  needsImport: boolean;
}

const migrations: Migration[] = [];

// Files to skip (already using error-logger correctly)
const SKIP_FILES = [
  'src/lib/error-logger.ts',
  'src/app/test-sentry/page.tsx',
  'src/app/api/notifications/route.ts',
  'src/app/api/notifications/mark-read/route.ts',
];

/**
 * Get all TypeScript files in src directory
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      // Skip node_modules and other directories
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      
      // Skip files in SKIP_FILES list
      if (SKIP_FILES.some(skip => relativePath.includes(skip))) continue;
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(relativePath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Check if file already imports error-logger
 */
function hasErrorLoggerImport(content: string): boolean {
  return content.includes("from '@/lib/error-logger'") || 
         content.includes('from "@/lib/error-logger"');
}

/**
 * Add import to file if needed
 */
function addErrorLoggerImport(content: string, functionsNeeded: Set<string>): string {
  if (hasErrorLoggerImport(content)) return content;
  
  const functions = Array.from(functionsNeeded).join(', ');
  const importStatement = `import { ${functions} } from '@/lib/error-logger';\n`;
  
  // Find a good place to add the import (after other imports)
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i + 1;
    } else if (insertIndex > 0 && !lines[i].startsWith('import ')) {
      break;
    }
  }
  
  lines.splice(insertIndex, 0, importStatement);
  return lines.join('\n');
}

/**
 * Migrate console statements in a file
 */
function migrateFile(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const functionsNeeded = new Set<string>();
  let changeCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Pattern: console.error('message', error, ...)
    // -> logError('message', error, { context })
    if (line.includes('console.error(')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const match = line.match(/console\.error\((.*)\);?$/);
      
      if (match) {
        const args = match[1];
        
        // Simple case: console.error('message', error)
        if (args.includes(',')) {
          const newLine = `${indent}logError(${args});`;
          migrations.push({
            file: filePath,
            line: lineNumber,
            old: line.trim(),
            new: newLine.trim(),
            needsImport: true,
          });
          functionsNeeded.add('logError');
          lines[i] = newLine;
          changeCount++;
        } else {
          // Single argument: console.error(error)
          const newLine = `${indent}logError('Error', ${args});`;
          migrations.push({
            file: filePath,
            line: lineNumber,
            old: line.trim(),
            new: newLine.trim(),
            needsImport: true,
          });
          functionsNeeded.add('logError');
          lines[i] = newLine;
          changeCount++;
        }
      }
    }
    
    // Pattern: console.warn('message')
    // -> logWarning('message', { context })
    else if (line.includes('console.warn(')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const match = line.match(/console\.warn\((.*)\);?$/);
      
      if (match) {
        const args = match[1];
        const newLine = `${indent}logWarning(${args});`;
        migrations.push({
          file: filePath,
          line: lineNumber,
          old: line.trim(),
          new: newLine.trim(),
          needsImport: true,
        });
        functionsNeeded.add('logWarning');
        lines[i] = newLine;
        changeCount++;
      }
    }
    
    // Pattern: console.log('Debug:', ...)
    // -> Remove or convert to logInfo
    else if (line.includes('console.log(')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const match = line.match(/console\.log\((.*)\);?$/);
      
      if (match) {
        const args = match[1];
        
        // If it looks like debug logging, comment it out
        if (args.toLowerCase().includes('debug') || 
            args.toLowerCase().includes('test') ||
            args.includes('JSON.stringify')) {
          const newLine = `${indent}// console.log(${args}); // Migrated: Use logInfo if needed`;
          migrations.push({
            file: filePath,
            line: lineNumber,
            old: line.trim(),
            new: newLine.trim(),
            needsImport: false,
          });
          lines[i] = newLine;
          changeCount++;
        } else {
          // Convert to logInfo for informational logs
          const newLine = `${indent}logInfo(${args});`;
          migrations.push({
            file: filePath,
            line: lineNumber,
            old: line.trim(),
            new: newLine.trim(),
            needsImport: true,
          });
          functionsNeeded.add('logInfo');
          lines[i] = newLine;
          changeCount++;
        }
      }
    }
  }
  
  // Add import if we made changes
  if (changeCount > 0 && functionsNeeded.size > 0) {
    const newContent = addErrorLoggerImport(lines.join('\n'), functionsNeeded);
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
    }
  } else if (changeCount > 0) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    }
  }
  
  return changeCount;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning for console statements...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllTsFiles(srcDir);
  
  console.log(`Found ${files.length} TypeScript files\n`);
  
  if (DRY_RUN) {
    console.log('🔬 DRY RUN MODE - No files will be modified\n');
  }
  
  let totalChanges = 0;
  const modifiedFiles: string[] = [];
  
  for (const file of files) {
    const changes = migrateFile(file);
    if (changes > 0) {
      totalChanges += changes;
      modifiedFiles.push(file);
      console.log(`✏️  ${file}: ${changes} changes`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files modified: ${modifiedFiles.length}`);
  console.log(`  Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
    console.log('\nPreview of changes:');
    console.log('='.repeat(80));
    
    migrations.slice(0, 20).forEach((m) => {
      console.log(`\n${m.file}:${m.line}`);
      console.log(`  - ${m.old}`);
      console.log(`  + ${m.new}`);
    });
    
    if (migrations.length > 20) {
      console.log(`\n... and ${migrations.length - 20} more changes`);
    }
  } else {
    console.log('\n✅ Migration complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Review the changes with git diff');
    console.log('  2. Test your application');
    console.log('  3. Run npm run build to check for errors');
  }
}

main();
