import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
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
  }

  console.log('✓ Image compression complete!');
}

compressImages().catch(error => {
  console.error('Error compressing images:', error);
  process.exit(1);
});
