import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

async function compressImages() {
  const imageFiles = await glob('images/**/*.{jpg,jpeg,png,gif,svg}', {
    absolute: true,
    nodir: true
  });

  console.log(`Found ${imageFiles.length} images to compress...`);

  for (const file of imageFiles) {
    const dir = path.dirname(file);
    const ext = path.extname(file).toLowerCase();

    // 元の形式で圧縮
    await imagemin([file], {
      destination: dir,
      plugins: [
        imageminMozjpeg({ quality: 80 }),
        imageminPngquant({ quality: [0.65, 0.9] }),
        imageminSvgo({
          plugins: [{ name: 'removeViewBox', active: false }]
        })
      ]
    });

    // jpg/pngの場合はwebpも生成
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      await imagemin([file], {
        destination: dir,
        plugins: [
          imageminWebp({ quality: 80 })
        ]
      });
    }
  }

  console.log('✓ Image compression complete!');
  console.log('✓ WebP images generated!');
}

compressImages().catch(error => {
  console.error('Error compressing images:', error);
  process.exit(1);
});
