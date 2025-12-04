import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateStylesScss() {
  const baseDir = 'src/sass';
  const outputFile = path.join(baseDir, 'styles.scss');

  // 各ディレクトリからSCSSファイルを取得
  const categories = ['base', 'layout', 'project', 'component'];
  let content = '';

  for (const category of categories) {
    const files = await glob(`${baseDir}/${category}/*.scss`, {
      ignore: [`${baseDir}/${category}/_index.scss`]
    });

    if (files.length > 0) {
      content += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;

      // ファイル名でソート
      files.sort();

      for (const file of files) {
        const relativePath = `./${category}/${path.basename(file, '.scss')}`;
        content += `@use "${relativePath}";\n`;
      }
      content += '\n';
    }
  }

  // ファイルに書き込み
  await fs.writeFile(outputFile, content.trim() + '\n', 'utf-8');
  console.log('✓ styles.scss generated successfully!');

  // SASSコンパイルを実行
  try {
    await execAsync('sass src/sass:css --no-source-map');
    console.log('✓ CSS compiled successfully!');
  } catch (error) {
    console.error('Error compiling SASS:', error.message);
    // エラーがあってもプロセスを継続
  }
}

generateStylesScss().catch(error => {
  console.error('Error generating styles.scss:', error);
  process.exit(1);
});
