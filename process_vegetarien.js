const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

const filesToProcess = [
    { file: 'vegetarien.png', text: 'V É G É T A R I E N', long: true }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'processed_' + item.file);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            let fontSizeRatio = 0.055; 

            const fontSize = Math.floor(width * fontSizeRatio);
            const letterSpacing = Math.floor(width * 0.03);

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                <text x="50%" y="15%" 
                  font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
                  font-size="${fontSize}" 
                  font-weight="900" 
                  fill="#ffffff" 
                  text-anchor="middle" 
                  dominant-baseline="central" 
                  letter-spacing="${letterSpacing}"
                  filter="url(#shadow)">
                  ${item.text}
                </text>
              </svg>
            `;

            await sharp(inputPath)
                .composite([{
                    input: Buffer.from(svgText),
                    blend: 'over'
                }])
                .toFormat('png', { quality: 90 })
                .toFile(outputPath);

            fs.renameSync(outputPath, path.join(themesDir, item.file));
            console.log(`Processed ${item.file}`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages();
