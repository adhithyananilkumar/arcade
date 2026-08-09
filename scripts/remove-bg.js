const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const foundersDir = path.join(__dirname, '../public/founders');

async function makeTransparent(inputFilename, outputFilename) {
  const inputPath = path.join(foundersDir, inputFilename);
  const outputPath = path.join(foundersDir, outputFilename);

  if (!fs.existsSync(inputPath)) {
    console.log('File not found:', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 210; // Threshold for background light pixels

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is near-white / light background
    if (r > threshold && g > threshold && b > threshold) {
      const minVal = Math.min(r, g, b);
      if (minVal > 230) {
        data[i + 3] = 0; // Fully transparent
      } else {
        const alpha = Math.floor((255 - minVal) * (255 / (255 - threshold)));
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully created transparent cutout:', outputFilename);
}

async function run() {
  await makeTransparent('founder_1_cutout.png', 'founder_1_transparent.png');
  await makeTransparent('founder_2_cutout.png', 'founder_2_transparent.png');
  await makeTransparent('founder_3_cutout.png', 'founder_3_transparent.png');
  console.log('All 3 founder images converted to 100% transparent cutouts!');
}

run().catch(console.error);
