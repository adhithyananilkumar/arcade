const fs = require('fs');
const files = [
  'app/(public)/explore/page.tsx',
  'apps/core/components/ExploreHub.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  const parts = content.split(/("[A-Za-z &]+"\s*:\s*\{)/);
  
  let newContent = parts[0];
  let currentCategory = '';
  
  for (let i = 1; i < parts.length; i += 2) {
    const catHeader = parts[i];
    let catBody = parts[i+1];
    
    const match = catHeader.match(/"([A-Za-z &]+)"/);
    if (match) {
      currentCategory = match[1];
    }
    
    if (currentCategory !== 'Computer Science' && currentCategory) {
      catBody = catBody.replace(/courses:\s*\[[\s\S]*?\n\s*\],/, 'courses: [],');
      catBody = catBody.replace(/bootcamps:\s*\[[\s\S]*?\n\s*\],/, 'bootcamps: [],');
      catBody = catBody.replace(/resources:\s*\[[\s\S]*?\n\s*\]\n?/, 'resources: []\n');
    }
    
    newContent += catHeader + catBody;
  }
  
  fs.writeFileSync(file, newContent);
  console.log('Processed ' + file);
});
