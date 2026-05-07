const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const baseImg = '/Users/manu/CloudStation/Anti Gravity/Ag - Projet app iphone cuisine/public/images/themes/vegetarien-base.png';
  const outImg = '/Users/manu/CloudStation/Anti Gravity/Ag - Projet app iphone cuisine/public/images/themes/vegetarien.jpg';

  try {
    const metadata = await sharp(baseImg).metadata();
    const width = metadata.width;
    const height = metadata.height;

    const fontSize = Math.floor(width * 0.07); // Slightly smaller font size to fit the longer word
    const letterSpacing = Math.floor(width * 0.025);

    const svgText = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
          </filter>
        </defs>
        <text x="50%" y="50%" 
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="900" 
          fill="#ffffff" 
          text-anchor="middle" 
          dominant-baseline="central" 
          letter-spacing="${letterSpacing}"
          filter="url(#shadow)">
          V É G É T A R I E N
        </text>
      </svg>
    `;

    await sharp(baseImg)
      .composite([{
        input: Buffer.from(svgText),
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toFile(outImg);

    console.log('Image vegetarien.jpg générée avec succès !');
  } catch(e) {
    console.error("Erreur lors de la création de l'image:", e.message);
  }
}

processImage().catch(console.error);
