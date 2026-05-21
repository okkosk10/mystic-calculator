import sharp from 'sharp';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

const INPUT_DIR = 'public/image';
const files = await readdir(INPUT_DIR);
const pngs = files.filter(f => f.endsWith('.png'));

console.log(`변환 대상: ${pngs.length}개`);

for (const file of pngs) {
  const input = join(INPUT_DIR, file);
  const output = join(INPUT_DIR, file.replace('.png', '.webp'));

  const info = await sharp(input)
    .webp({ quality: 82 })
    .toFile(output);

  const before = (await import('fs')).statSync(input).size;
  const pct = Math.round((1 - info.size / before) * 100);
  console.log(`  ${file} → ${file.replace('.png','.webp')}  ${(before/1024).toFixed(0)}KB → ${(info.size/1024).toFixed(0)}KB  (-${pct}%)`);
}

console.log('\n완료!');
