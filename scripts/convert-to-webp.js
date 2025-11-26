import fs from 'fs/promises';
import path from 'path';

async function convertHtmlToWebp() {
  const htmlPath = 'index.html';
  let html = await fs.readFile(htmlPath, 'utf-8');

  // imgタグを<picture>タグに変換（mp4は除外）
  html = html.replace(
    /<img\s+([^>]*?)src="([^"]+\.(jpg|jpeg|png))"([^>]*?)>/gi,
    (match, before, src, ext, after) => {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const attributes = (before + after).trim();

      return `<picture>
      <source srcset="${webpSrc}" type="image/webp">
      <img ${attributes} src="${src}">
    </picture>`;
    }
  );

  await fs.writeFile(htmlPath, html, 'utf-8');
  console.log('✓ HTML updated with WebP images!');
}

convertHtmlToWebp().catch(error => {
  console.error('Error converting HTML:', error);
  process.exit(1);
});
