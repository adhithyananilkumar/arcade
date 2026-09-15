const fs = require('fs');

const files = [
  'app/(public)/explore/page.tsx',
  'apps/core/components/ExploreHub.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // We find CATEGORY_DATA object boundaries.
  // It starts with `CATEGORY_DATA: Record<string, {`
  // We can use a replacer function on `content.replace()`
  
  const categories = [
    "Information Technology",
    "Business & Management",
    "Civil & Mechanical",
    "Basic Sciences",
    "Humanities & Languages",
    "Personal Development",
    "Marketing & SEO"
  ];
  
  for (const cat of categories) {
    // We want to replace the block inside this category.
    // We can use a regex to match the start of the category to the next category or closing brace.
    const regex = new RegExp(`("${cat}":\\s*\\{[\\s\\S]*?\\})\\s*(?="[A-Za-z &]+":|};)`, 'g');
    content = content.replace(regex, (match, p1) => {
      let block = p1;
      block = block.replace(/coursesCount:\s*\d+,/, 'coursesCount: 0,');
      block = block.replace(/courses:\s*\[[\s\S]*?\],\s*bootcamps/, 'courses: [],\n    bootcamps');
      block = block.replace(/bootcamps:\s*\[[\s\S]*?\],\s*resources/, 'bootcamps: [],\n    resources');
      // For resources it might be the last key, so it might not have a trailing comma
      block = block.replace(/resources:\s*\[[\s\S]*?\]/, 'resources: []');
      return block;
    });
  }
  
  fs.writeFileSync(file, content);
  console.log('Processed ' + file);
});
