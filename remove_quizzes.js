const fs = require('fs');

const files = [
  'apps/creator/orchestrators/CourseEditorOrchestrator.tsx',
  'apps/creator/shared/content-editor/SharedContentEditorOrchestrator.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace ModuleNode properties
  content = content.replace(/quizzes:\s*QuizNode\[\];/g, '');
  
  // Replace array spreading in handleDragEnd
  content = content.replace(/,\s*\.\.\.m\.quizzes\.map\([^)]+\)/g, '');
  
  // Replace quizzes state updates
  content = content.replace(/const nextQuizzes = \[\.\.\.m\.quizzes\];/g, '');
  content = content.replace(/} else {[\s\S]*?const qIndex = nextQuizzes\.findIndex\([\s\S]*?if \(qIndex !== -1\) nextQuizzes\[qIndex\] = \{ \.\.\.nextQuizzes\[qIndex\], position: index \};[\s\S]*?}/g, '}');
  content = content.replace(/quizzes:\s*nextQuizzes/g, '');
  content = content.replace(/,\s*quizzes:\s*\[\]/g, '');
  content = content.replace(/,\s*quizzes:\s*m\.quizzes\s*\?\?\s*\[\]/g, '');
  
  // AddQuiz functionality
  content = content.replace(/const handleAddQuiz =[\s\S]*?};\n/g, '');
  content = content.replace(/const handleRenameQuiz =[\s\S]*?};\n/g, '');
  content = content.replace(/const handleDeleteQuiz =[\s\S]*?};\n/g, '');

  content = content.replace(/quizzes:\s*m\.quizzes\.map[^\n]+/g, '');
  content = content.replace(/quizzes:\s*m\.quizzes\.filter[^\n]+/g, '');
  content = content.replace(/quizzes:\s*\[\.\.\.m\.quizzes,\s*newQuiz[^\]]*\]/g, '');
  
  // Remove from the sort / find activeQuizId etc
  content = content.replace(/const hadActiveQuiz = mod\.quizzes\.some[^\n]+/g, '');
  content = content.replace(/\|\|\s*hadActiveQuiz/g, '');

  // Render lists
  content = content.replace(/,\s*\.\.\.mod\.quizzes\.map[^\n]+/g, '');
  
  // Replace remaining loose instances carefully
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Processed ${file}`);
}
