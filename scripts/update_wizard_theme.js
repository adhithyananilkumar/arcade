const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/alosh/OneDrive/Desktop/Arcade/arcade/app/(authenticated)/studio/workshop/components/wizard';

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace input styles
  newContent = newContent.replace(/focus:ring-indigo-500 focus:border-indigo-500/g, 'outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300');
  
  // Replace generic indigo with violet
  newContent = newContent.replace(/indigo/g, 'violet');

  // Replace rounded-md with rounded-lg in typical class strings
  newContent = newContent.replace(/rounded-md/g, 'rounded-lg');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
