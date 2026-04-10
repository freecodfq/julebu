// Run this script to generate xingrong_courses.json:
//   node scripts/build_xingrong.mjs

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = String.raw`D:\Desktop\yinyuxuexi\earthworm-main\packages\xingrong-courses\data\courses`;
const outputFile = join(__dirname, '..', 'src', 'assets', 'xingrong_courses.json');

const files = readdirSync(sourceDir)
  .filter(f => f.endsWith('.json'))
  .sort((a, b) => parseInt(a) - parseInt(b));

const courses = [];

for (const file of files) {
  const num = parseInt(file.replace('.json', ''));
  const items = JSON.parse(readFileSync(join(sourceDir, file), 'utf-8'));
  
  const words = items
    .filter(item => item.english && item.chinese)
    .map(item => ({
      en: item.english.trim(),
      zh: item.chinese.trim(),
      ipa: (item.soundmark || '').trim()
    }));
  
  if (words.length > 0) {
    courses.push({
      id: `xingrong-${String(num).padStart(2, '0')}`,
      category: '星荣课程',
      title: `第 ${num} 课`,
      words
    });
  }
}

writeFileSync(outputFile, JSON.stringify(courses, null, 2), 'utf-8');
console.log(`Successfully generated ${courses.length} xingrong courses to ${outputFile}`);
console.log(`Total items: ${courses.reduce((sum, c) => sum + c.words.length, 0)}`);
