const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

const filesToProcess = [
    { file: 'airfryer.png', text: 'AIRFRYER' },
    { file: 'barbecue.png', text: 'BARBECUE' },
    { file: 'famille.png', text: 'FAMILLE' },
    { file: 'express.png', text: 'EXPRESS' },
    { file: 'sauces.png', text: 'SAUCES' },
    { file: 'vegetarien.png', text: 'VÉGÉTARIEN' },
    { file: 'healthy.png', text: 'HEALTHY' }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'fixed_' + item.file);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            const compositeElements = [];

            // 1. Erase the top 25% where the old text is
            // Get the background color from a pixel at the top left (x: 20, y: 20)
            const { data, info } = await sharp(inputPath)
                .raw()
                .toBuffer({ resolveWithObject: true });

            const idx = (20 * width + 20) * info.channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = info.channels === 4 ? data[idx + 3] : 255;

            const eraseHeight = Math.floor(height * 0.28);
            const eraseRect = `
                <svg width="${width}" height="${height}">
                    <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(${r},${g},${b},${a/255})" />
                </svg>
            `;
            compositeElements.push({ input: Buffer.from(eraseRect), blend: 'over' });

            // 2. Add the text, intelligently scaled!
            // Max allowed text width is 90% of image width (so roughly 0.9 * width)
            const maxTextWidth = width * 0.90;
            // Estimated average char width for bold font is 0.7 * fontSize
            // So: textLength * fontSize * 0.7 = maxTextWidth
            let calculatedFontSize = Math.floor(maxTextWidth / (item.text.length * 0.7));
            
            // Cap the font size to not be ridiculously large for short words (max 180px)
            // And ensure it's not too small
            const fontSize = Math.min(220, Math.max(90, calculatedFontSize));
            
            // Small aesthetic letter spacing
            const letterSpacing = Math.floor(width * 0.015);

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.8" />
                    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.6" />
                  </filter>
                </defs>
                <text 
                    x="50%" 
                    y="13%" 
                    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
                    font-size="${fontSize}" 
                    font-weight="900" 
                    fill="#ffffff" 
                    text-anchor="middle" 
                    letter-spacing="${letterSpacing}" 
                    filter="url(#shadow)"
                >
                  ${item.text}
                </text>
              </svg>
            `;

            compositeElements.push({ input: Buffer.from(svgText), blend: 'over' });

            await sharp(inputPath)
                .composite(compositeElements)
                .toFormat('png', { quality: 100 })
                .toFile(outputPath);

            fs.renameSync(outputPath, inputPath);
            console.log(`✅ Processed ${item.file} with font size ${fontSize}px`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages().then(() => {
    console.log("All done!");
});
