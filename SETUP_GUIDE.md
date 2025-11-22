# Vite + Sass + 画像圧縮 開発環境 セットアップガイド

このドキュメントは、Vite環境での開発構成を説明します。WordPress環境でも同様の構成が可能です。

## 📋 構成概要

### 使用ツール
- **Vite**: 開発サーバー（HMR対応）
- **Sass**: CSSプリプロセッサ
- **imagemin**: 画像圧縮
- **cpx2**: ファイルコピー
- **chokidar-cli**: ファイル監視
- **npm-run-all**: 並列タスク実行

### 特徴
- ✅ Sassファイルを自動でstyles.scssに統合
- ✅ 画像を自動圧縮（JPG: 約80-90%削減）
- ✅ ファイル変更を監視して自動ビルド
- ✅ ディレクトリ構造を維持
- ✅ gulpは不要（Viteのみで完結）

---

## 📁 ディレクトリ構造

```
project/
├── src/
│   ├── sass/                    # Sassソースファイル
│   │   ├── base/
│   │   │   ├── _base.scss
│   │   │   └── _reset.scss
│   │   ├── layout/
│   │   │   ├── _l-inner.scss
│   │   │   └── _test.scss
│   │   ├── project/
│   │   │   ├── _p-header.scss
│   │   │   └── _p-mv.scss
│   │   ├── component/
│   │   │   ├── _c-main-title.scss
│   │   │   └── _c-main-text.scss
│   │   └── styles.scss          # 自動生成（編集不要）
│   ├── images/                  # 画像ソースファイル
│   │   └── common/
│   │       ├── mv.jpg
│   │       └── dummy.jpg
│   └── main.js                  # Viteエントリーポイント
├── scripts/
│   ├── compress-images.js       # 画像圧縮スクリプト
│   └── generate-styles.js       # styles.scss自動生成
├── css/                         # 自動生成（gitignore）
│   └── styles.css
├── images/                      # 自動生成（gitignore）
│   └── common/
│       ├── mv.jpg               # 圧縮済み
│       └── dummy.jpg
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

---

## 🚀 セットアップ手順

### 1. 必要なパッケージのインストール

```bash
npm install --save-dev \
  vite \
  sass \
  chokidar-cli \
  cpx2 \
  npm-run-all \
  imagemin \
  imagemin-mozjpeg \
  imagemin-pngquant \
  imagemin-svgo \
  glob
```

### 2. package.json のスクリプト設定

```json
{
  "scripts": {
    "dev": "npm run copy:images && npm run compress:images && npm run generate:styles && run-p dev:*",
    "dev:vite": "vite",
    "dev:sass": "sass src/sass:css --watch --no-source-map",
    "dev:sass-files": "chokidar \"src/sass/**/*.scss\" --ignore \"src/sass/styles.scss\" -c \"npm run generate:styles\"",
    "dev:images": "chokidar \"src/images/**/*\" -c \"npm run copy:images && npm run compress:images\"",
    "copy:images": "cpx \"src/images/**/*\" images",
    "compress:images": "node scripts/compress-images.js",
    "generate:styles": "node scripts/generate-styles.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. vite.config.js の設定

```javascript
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [],
  root: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name].css';
          }
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
            return 'images/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  server: {
    open: true,
    port: 3000
  }
});
```

### 4. .gitignore の設定

```
.vscode/
node_modules
.DS_Store
.node-versions

# ビルド成果物（自動生成されるファイル）
css/
images/
dist/
```

### 5. スクリプトファイルの作成

#### scripts/generate-styles.js
新しいSassファイルを追加すると、自動的にstyles.scssに統合します。

```javascript
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

async function generateStylesScss() {
  const baseDir = 'src/sass';
  const outputFile = path.join(baseDir, 'styles.scss');
  const categories = ['base', 'layout', 'project', 'component'];
  let content = '';

  for (const category of categories) {
    const files = await glob(`${baseDir}/${category}/*.scss`, {
      ignore: [`${baseDir}/${category}/_index.scss`]
    });

    if (files.length > 0) {
      content += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      files.sort();
      for (const file of files) {
        const relativePath = `./${category}/${path.basename(file, '.scss')}`;
        content += `@use "${relativePath}";\n`;
      }
      content += '\n';
    }
  }

  await fs.writeFile(outputFile, content.trim() + '\n', 'utf-8');
  console.log('✓ styles.scss generated successfully!');
}

generateStylesScss().catch(error => {
  console.error('Error generating styles.scss:', error);
  process.exit(1);
});
```

#### scripts/compress-images.js
画像を圧縮し、ディレクトリ構造を維持します。

```javascript
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import { glob } from 'glob';
import path from 'path';

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
```

---

## 💻 開発の流れ

### 開発サーバーの起動
```bash
npm run dev
```

以下が自動的に実行されます：
1. 画像をコピー＆圧縮
2. styles.scssを自動生成
3. Vite開発サーバー起動（http://localhost:3000）
4. Sass自動コンパイル
5. ファイル変更監視

### 新しいSassファイルを追加する場合
1. `src/sass/project/_p-newpage.scss` などを作成
2. 保存すると自動的に `styles.scss` に追加される
3. CSSが自動的にコンパイルされる

### 画像を追加する場合
1. `src/images/common/` に画像を配置
2. 自動的に圧縮されて `images/common/` にコピーされる

### 本番ビルド
```bash
npm run build
```
`dist/` フォルダに最適化されたファイルが生成されます。

---

## 🔧 WordPress環境への適用

### 変更が必要な箇所

#### 1. ディレクトリ構造
```
wp-content/themes/your-theme/
├── assets/
│   └── src/              # srcフォルダをassetsに配置
│       ├── sass/
│       ├── images/
│       └── js/
├── css/                  # コンパイル先
├── images/              # 画像出力先
├── js/                  # JS出力先
├── functions.php
├── index.php
├── style.css            # WordPressテーマ用（別途作成）
├── package.json
└── vite.config.js
```

#### 2. package.json のパス調整
```json
{
  "scripts": {
    "dev:sass": "sass assets/src/sass:css --watch --no-source-map",
    "dev:sass-files": "chokidar \"assets/src/sass/**/*.scss\" --ignore \"assets/src/sass/styles.scss\" -c \"npm run generate:styles\"",
    "dev:images": "chokidar \"assets/src/images/**/*\" -c \"npm run copy:images && npm run compress:images\"",
    "copy:images": "cpx \"assets/src/images/**/*\" images"
  }
}
```

#### 3. スクリプトのパス修正
- `scripts/generate-styles.js`: `src/sass` → `assets/src/sass`
- `scripts/compress-images.js`: そのまま使用可能

#### 4. functions.php でCSSを読み込み
```php
function enqueue_theme_assets() {
    wp_enqueue_style('main-style', get_template_directory_uri() . '/css/styles.css', array(), '1.0.0');
    wp_enqueue_script('main-script', get_template_directory_uri() . '/js/script.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_theme_assets');
```

---

## 📝 トラブルシューティング

### Q: styles.scssが更新されない
A: `npm run generate:styles` を手動実行してください。

### Q: 画像が圧縮されない
A: `npm run copy:images && npm run compress:images` を手動実行してください。

### Q: 開発サーバーが起動しない
A: ポート3000が使用中の可能性があります。vite.config.jsのportを変更してください。

### Q: Sassのエラーが出る
A: `src/sass/styles.scss` を削除して `npm run generate:styles` を実行してください。

---

## 🎯 この構成の利点

1. **gulpが不要**: Viteと軽量なツールのみで完結
2. **自動化**: Sassファイル追加時に手動編集不要
3. **高速**: Viteの高速なHMR
4. **画像最適化**: 自動圧縮でファイルサイズ削減
5. **再現性**: package.jsonで環境を完全に再現可能
6. **保守性**: シンプルな構成で理解しやすい

---

## 📚 参考資料

- [Vite公式ドキュメント](https://vitejs.dev/)
- [Sass公式ドキュメント](https://sass-lang.com/)
- [imagemin](https://github.com/imagemin/imagemin)
