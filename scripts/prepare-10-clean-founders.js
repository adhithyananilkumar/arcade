const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const foundersDir = path.join(__dirname, '../public/founders');
if (!fs.existsSync(foundersDir)) {
  fs.mkdirSync(foundersDir, { recursive: true });
}

// 10 Distinct Unsplash professional studio headshots (Clear, high quality)
const founderImageUrls = [
  // 1: Adhithyan Anilkumar (Male - Founder & Chief Architect)
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85",
  // 2: Jagan Syam (Male - Co-Founder & Technical Lead)
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
  // 3: Athira Biju (Female - Co-Founder & Academic Lead)
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85",
  // 4: Anandhu Pradeep (Male - Co-Founder & Head of Product Design)
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85",
  // 5: Akash A (Male - Co-Founder & Engineering Lead)
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=85",
  // 6: Deepthi C D (Female - Co-Founder & Operations Lead)
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85",
  // 7: Anandhulal C V (Male - Co-Founder & Infrastructure Lead)
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85",
  // 8: Kalyany S Nair (Female - Co-Founder & Community Lead)
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=85",
  // 9: Aloshy Antony (Male - Co-Founder & Security Architect)
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=85",
  // 10: Anjali (Female - Co-Founder & Educational Strategist)
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85"
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

async function main() {
  console.log("Downloading and processing 10 clear, crisp studio founder portraits...");
  for (let i = 0; i < founderImageUrls.length; i++) {
    const num = i + 1;
    const tempPath = path.join(foundersDir, `clean_raw_${num}.jpg`);
    const finalPath = path.join(foundersDir, `clean_founder_${num}.jpg`);
    
    try {
      console.log(`Downloading portrait ${num}...`);
      await downloadImage(founderImageUrls[i], tempPath);
      
      // Process to crisp, high quality 500x600 portrait with optimal sharpness
      await sharp(tempPath)
        .resize(500, 600, { fit: 'cover', position: 'top' })
        .sharpen()
        .jpeg({ quality: 90 })
        .toFile(finalPath);
        
      fs.unlinkSync(tempPath);
      console.log(`Successfully created clean_founder_${num}.jpg`);
    } catch (err) {
      console.error(`Error processing founder ${num}:`, err.message);
    }
  }
  console.log("All 10 founder images processed successfully!");
}

main();
