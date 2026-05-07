const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

// Config manuelle pour chaque fichier pour garantir un rendu parfait
const filesToProcess = [
    { file: 'paques.jpg', lines: ['PÂQUES'], fontSize: 90, letterSpacing: 40 },
    { file: 'glaces.jpg', lines: ['GLACES'], fontSize: 90, letterSpacing: 45 },
    { file: 'cest-lhiver.jpg', lines: ["C'EST", "L'HIVER"], fontSize: 90, letterSpacing: 40 },
    { file: 'astuces.jpg', lines: ['ASTUCES'], fontSize: 90, letterSpacing: 40 },
    { file: 'sauces.png', lines: ['SAUCES'], fontSize: 90, letterSpacing: 45 },
    { file: 'healthy.png', lines: ['HEALTHY'], fontSize: 90, letterSpacing: 40 },
    { file: 'airfryer.png', lines: ['AIRFRYER'], fontSize: 90, letterSpacing: 35 },
    { file: 'barbecue.png', lines: ['BARBECUE'], fontSize: 90, letterSpacing: 35 },
    { file: 'express.png', lines: ['EXPRESS'], fontSize: 90, letterSpacing: 40 },
    { file: 'famille.png', lines: ['FAMILLE'], fontSize: 90, letterSpacing: 40 },
    { file: 'vegetarien.png', lines: ['VÉGÉTARIEN'], fontSize: 80, letterSpacing: 25 },
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'fixed_spacing_' + item.file);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            const compositeElements = [];

            // 1. Erase the top 30% where the old text is
            const { data, info } = await sharp(inputPath)
                .raw()
                .toBuffer({ resolveWithObject: true });

            const idx = (20 * width + 20) * info.channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = info.channels === 4 ? data[idx + 3] : 255;

            const eraseHeight = Math.floor(height * 0.30);
            const eraseRect = `
                <svg width="${width}" height="${height}">
                    <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(${r},${g},${b},${a/255})" />
                </svg>
            `;
            compositeElements.push({ input: Buffer.from(eraseRect), blend: 'over' });

            // 2. Add the text with specific font size and letter spacing
            let textContent = '';
            if (item.lines.length === 1) {
                textContent = `<tspan x="50%" dy="0">${item.lines[0]}</tspan>`;
            } else {
                textContent = `
                  <tspan x="50%" dy="0">${item.lines[0]}</tspan>
                  <tspan x="50%" dy="1.4em">${item.lines[1]}</tspan>
                `;
            }

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.8" />
                    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.6" />
                  </filter>
                </defs>
                <text 
                    x="50%" 
                    y="${item.lines.length === 1 ? '15%' : '12%'}" 
                    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
                    font-size="${item.fontSize}" 
                    font-weight="900" 
                    fill="#ffffff" 
                    text-anchor="middle" 
                    letter-spacing="${item.letterSpacing}" 
                    filter="url(#shadow)"
                >
                  ${textContent}
                </text>
              </svg>
            `;

            compositeElements.push({ input: Buffer.from(svgText), blend: 'over' });

            const ext = item.file.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';

            await sharp(inputPath)
                .composite(compositeElements)
                .toFormat(ext, { quality: 100 })
                .toFile(outputPath);

            fs.renameSync(outputPath, inputPath);
            console.log(`✅ Processed ${item.file}`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages().then(() => {
    console.log("All done!");
});
