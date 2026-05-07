const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const themesDir = '/Users/manu/CloudStation/Anti Gravity/Ag - Projet app iphone cuisine/public/images/themes';

const svgs = {
  'sauces.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF8C00;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF4500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <g transform="translate(130, 150)">
    <circle cx="0" cy="0" r="60" fill="#f1f1f1" />
    <circle cx="0" cy="0" r="50" fill="#FF3B30" />
    <path d="M0 -50 A50 50 0 0 1 50 0 L0 0 Z" fill="rgba(255,255,255,0.1)" />
  </g>
  <g transform="translate(250, 220)">
    <circle cx="0" cy="0" r="50" fill="#f1f1f1" />
    <circle cx="0" cy="0" r="40" fill="#4CD964" />
    <path d="M0 -40 A40 40 0 0 1 40 0 L0 0 Z" fill="rgba(255,255,255,0.1)" />
  </g>
  <g transform="translate(260, 100)">
    <circle cx="0" cy="0" r="45" fill="#f1f1f1" />
    <circle cx="0" cy="0" r="35" fill="#FFCC00" />
    <path d="M0 -35 A35 35 0 0 1 35 0 L0 0 Z" fill="rgba(255,255,255,0.1)" />
  </g>
</svg>`,
  'healthy.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A8E063;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#56AB2F;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <g transform="translate(150, 180) rotate(-15)">
    <ellipse cx="0" cy="0" rx="45" ry="60" fill="#2E7D32" />
    <ellipse cx="0" cy="5" rx="35" ry="50" fill="#C5E1A5" />
    <circle cx="0" cy="15" r="15" fill="#5D4037" />
  </g>
  <g transform="translate(250, 220)">
    <circle cx="0" cy="0" r="40" fill="#FF5252" />
    <path d="M-5 -45 L0 -35 L5 -45 Z" fill="#388E3C" />
  </g>
</svg>`,
  'airfryer.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#43C6AC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#191654;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.2)" />
  <rect x="100" y="100" width="200" height="220" rx="40" fill="#333" />
  <rect x="110" y="110" width="180" height="80" rx="10" fill="#111" />
  <rect x="180" y="220" width="40" height="60" rx="10" fill="#555" />
</svg>`,
  'barbecue.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF416C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF4B2B;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.2)" />
  <rect x="100" y="150" width="200" height="20" rx="5" fill="#333" />
  <line x1="80" y1="140" x2="320" y2="140" stroke="#DDD" stroke-width="4" />
  <rect x="160" y="125" width="25" height="30" fill="#FF5252" rx="2" />
</svg>`,
  'pas-cher.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0BA360;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3CBA92;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <path d="M120 180 A60 60 0 1 1 280 180 Q280 240 200 240 Q120 240 120 180" fill="#F48FB1" />
  <circle cx="200" cy="100" r="15" fill="#FFD700" />
</svg>`,
  'express.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FDFC47;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#24FE41;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <circle cx="200" cy="150" r="80" fill="#FFF" />
  <line x1="200" y1="150" x2="200" y2="100" stroke="#FF3B30" stroke-width="6" />
  <line x1="200" y1="150" x2="240" y2="150" stroke="#333" stroke-width="8" />
</svg>`,
  'famille.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4E50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F9D423;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <rect x="120" y="180" width="160" height="100" rx="10" fill="#333" />
  <circle cx="100" cy="300" r="40" fill="#FFF" />
  <circle cx="300" cy="300" r="40" fill="#FFF" />
</svg>`,
  'vegetarien.jpg': `
<svg width="800" height="800" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00C853;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B2FF59;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" rx="40" />
  <path d="M200 200 L400 400 L200 400 Z" fill="rgba(0,0,0,0.15)" />
  <g transform="translate(150, 150) rotate(-45)">
    <path d="M0 0 L100 0 L90 30 L0 0 Z" fill="#FF9800" />
  </g>
  <g transform="translate(250, 250)">
    <circle cx="0" cy="0" r="30" fill="#2E7D32" />
  </g>
</svg>`
};

async function convert() {
  for (const [filename, svgContent] of Object.entries(svgs)) {
    const outputPath = path.join(themesDir, filename);
    console.log(\`Converting \${filename}...\`);
    try {
      await sharp(Buffer.from(svgContent))
        .jpeg()
        .toFile(outputPath);
      console.log(\`Successfully saved to \${outputPath}\`);
    } catch (err) {
      console.error(\`Error converting \${filename}:\`, err);
    }
  }
}

convert();
