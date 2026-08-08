const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:/Users/hp/.gemini/antigravity-ide/brain/0a401aca-f096-4327-9fb6-db9927dacae8';
const foundersDir = path.join(__dirname, '../public/founders');

// Find original generated cutout image paths
function getLatestImage(pattern) {
  const files = fs.readdirSync(brainDir).filter(f => f.startsWith(pattern) && f.endsWith('.png'));
  files.sort((a, b) => fs.statSync(path.join(brainDir, b)).mtimeMs - fs.statSync(path.join(brainDir, a)).mtimeMs);
  return files[0] ? path.join(brainDir, files[0]) : null;
}

async function floodFillBackground(inputPath, outputFilename) {
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.log('Input path not found:', inputPath);
    return;
  }

  const outputPath = path.join(foundersDir, outputFilename);

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const { data } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isLight = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r > 215 && g > 215 && b > 215;
  };

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Add boundary pixels to queue
  for (let x = 0; x < width; x++) {
    if (isLight(x, 0)) { queue.push([x, 0]); visited[0 * width + x] = 1; }
    if (isLight(x, height - 1)) { queue.push([x, height - 1]); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isLight(0, y)) { queue.push([0, y]); visited[y * width + 0] = 1; }
    if (isLight(width - 1, y)) { queue.push([width - 1, y]); visited[y * width + (width - 1)] = 1; }
  }

  // BFS Flood Fill from outer edges ONLY
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const idx = (y * width + x) * 4;
    data[idx + 3] = 0; // Transparent alpha for outer background only

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
      [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isLight(nx, ny)) {
          visited[nPos] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  await sharp(data, {
    raw: { width, height, channels: 4 }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully flood filled background for:', outputFilename);
}

async function run() {
  const img1 = getLatestImage('founder_1_cutout');
  const img2 = getLatestImage('founder_2_cutout');
  const img3 = getLatestImage('founder_3_cutout');

  await floodFillBackground(img1, 'founder_1_transparent.png');
  await floodFillBackground(img2, 'founder_2_transparent.png');
  await floodFillBackground(img3, 'founder_3_transparent.png');

  console.log('All founder cutouts processed cleanly!');
}

run().catch(console.error);
