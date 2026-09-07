import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Simple replacements
  content = content.replace(/bg-\[\#0d1117\]/g, 'bg-white dark:bg-[#0d1117]');
  content = content.replace(/bg-\[\#161b22\]/g, 'bg-gray-50 dark:bg-[#161b22]');
  
  // Need to be careful with borders and backgrounds that have opacity
  // Look for text-white that are not part of dark:text-white
  content = content.replace(/(?<!dark:)text-white/g, 'text-gray-900 dark:text-white');
  content = content.replace(/(?<!dark:)text-gray-400/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/(?<!dark:)text-gray-300/g, 'text-gray-700 dark:text-gray-300');
  
  content = content.replace(/(?<!dark:)border-white\/5/g, 'border-black/5 dark:border-white/5');
  content = content.replace(/(?<!dark:)border-white\/10/g, 'border-black/10 dark:border-white/10');
  content = content.replace(/(?<!dark:)border-white\/20/g, 'border-black/20 dark:border-white/20');
  content = content.replace(/(?<!dark:)border-white\/30/g, 'border-black/30 dark:border-white/30');

  content = content.replace(/(?<!dark:)bg-white\/5/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/(?<!dark:)bg-white\/10/g, 'bg-black/5 dark:bg-white/10');

  // Fix up specific Landing page text-gray-900 to ensure it looks right in light mode
  // The selection background
  content = content.replace(/selection:bg-\[var\(--color-primary\)\].*?/, 'selection:bg-[var(--color-primary)]/30');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Migration complete.');
