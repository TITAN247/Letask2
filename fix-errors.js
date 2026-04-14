const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix error.message patterns
  content = content.replace(/error\.message/g, "error instanceof Error ? error.message : 'Unknown error'");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
    return true;
  }
  return false;
}

function walkDir(dir) {
  let fixed = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixed += walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixFile(filePath)) fixed++;
    }
  }
  return fixed;
}

const fixed = walkDir('app/api');
console.log(`\nTotal files fixed: ${fixed}`);
