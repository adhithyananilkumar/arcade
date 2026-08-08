const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const foundersDir = path.join(__dirname, '../public/founders');
if (!fs.existsSync(foundersDir)) {
  fs.mkdirSync(foundersDir, { recursive: true });
}

// 10 Distinct Unsplash professional studio headshots
const founderImageUrls = [
  // 1: Adhithyan Anilkumar (Male - Founder & Chief Architect)
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  // 2: Jagan Syam (Male - Co-Founder & Technical Lead)
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  // 3: Athira Biju (Female - Co-Founder & Academic Lead)
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  // 4: Anandhu Pradeep (Male - Co-Founder & Head of Product Design)
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
  // 5: Akash A (Male - Co-Founder & Engineering Lead)
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
  // 6: Deepthi C D (Female - Co-Founder & Operations Lead)
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
  // 7: Anandhulal C V (Male - Co-Founder & Infrastructure Lead)
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  // 8: Kalyany S Nair (Female - Co-Founder & Community Lead)
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=500&q=80",
  // 9: Aloshy Antony (Male - Co-Founder & Security Architect)
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
  // 10: Anjali (Female - Co-Founder & Educational Strategist)
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
];

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const follow = (currentUrl) => {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
        } else if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
        } else {
          reject(new Error(`Failed to download ${currentUrl}, status: ${res.statusCode}`));
        }
      }).on('error', reject);
    };
    follow(url);
  });
}

async function processCutout(rawPath, outputPath) {
  // 1. Load image, resize, convert to B&W PNG
  const bwPng = await sharp(rawPath)
    .resize(400, 480, { fit: 'cover', position: 'center' })
    .grayscale()
    .linear(1.15, -5)
    .png()
    .toBuffer();

  // 2. Read raw RGBA buffer from the PNG
  const { data, info } = await sharp(bwPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function getIdx(x, y) { return y * width + x; }

  // Sample corner colors
  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [2, 2], [width - 3, 2]
  ];
  const cornerColors = corners.map(([x, y]) => {
    const idx = (y * width + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2]];
  });

  function isBackgroundPixel(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    for (const [cr, cg, cb] of cornerColors) {
      const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (dist < 55) return true;
    }
    if (r > 190 && g > 190 && b > 190) return true;
    return false;
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    if (isBackgroundPixel(x, 0)) { queue.push(x, 0); visited[getIdx(x, 0)] = 1; }
    if (isBackgroundPixel(x, height - 1)) { queue.push(x, height - 1); visited[getIdx(x, height - 1)] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBackgroundPixel(0, y)) { queue.push(0, y); visited[getIdx(0, y)] = 1; }
    if (isBackgroundPixel(width - 1, y)) { queue.push(width - 1, y); visited[getIdx(width - 1, y)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = getIdx(nx, ny);
        if (!visited[nIdx] && isBackgroundPixel(nx, ny)) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Set alpha = 0 for background pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = getIdx(x, y);
      if (visited[pIdx]) {
        data[pIdx * 4 + 3] = 0; // Make 100% transparent!
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);
}

async function main() {
  console.log("Downloading 10 unique, distinct studio headshots...");
  for (let i = 0; i < founderImageUrls.length; i++) {
    const num = i + 1;
    const rawPath = path.join(foundersDir, `raw_founder_${num}.jpg`);
    const targetPath = path.join(foundersDir, `portrait_${num}.png`);
    
    console.log(`Downloading portrait ${num}...`);
    try {
      await downloadImage(founderImageUrls[i], rawPath);
      console.log(`Processing B&W cutout for portrait ${num}...`);
      await processCutout(rawPath, targetPath);
      console.log(`Successfully created portrait_${num}.png!`);
    } catch (err) {
      console.error(`Error processing portrait ${num}:`, err.message);
    }
  }
  console.log("All 10 portraits processed!");
}

main();
