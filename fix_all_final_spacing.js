const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

// Max safe width for text is ~600px because the image is cropped on mobile due to portrait aspect ratio (objectFit: cover)
const filesToProcess = [
    // Original 11
    { file: 'paques.jpg', lines: ['PÂQUES'], fontSize: 60, letterSpacing: 15, lighten: false },
    { file: 'glaces.jpg', lines: ['GLACES'], fontSize: 60, letterSpacing: 15, lighten: false },
    { file: 'cest-lhiver.jpg', lines: ["C'EST", "L'HIVER"], fontSize: 60, letterSpacing: 15, lighten: false },
    { file: 'astuces.jpg', lines: ['ASTUCES'], fontSize: 60, letterSpacing: 15, lighten: true },
    { file: 'sauces.png', lines: ['SAUCES'], fontSize: 60, letterSpacing: 15, lighten: true },
    { file: 'healthy.png', lines: ['HEALTHY'], fontSize: 60, letterSpacing: 15, lighten: true },
    { file: 'airfryer.png', lines: ['AIRFRYER'], fontSize: 60, letterSpacing: 10, lighten: true },
    { file: 'barbecue.png', lines: ['BARBECUE'], fontSize: 60, letterSpacing: 10, lighten: true },
    { file: 'express.png', lines: ['EXPRESS'], fontSize: 60, letterSpacing: 15, lighten: true },
    { file: 'famille.png', lines: ['FAMILLE'], fontSize: 60, letterSpacing: 15, lighten: true },
    { file: 'vegetarien.png', lines: ['VÉGÉTARIEN'], fontSize: 50, letterSpacing: 5, lighten: true },
    // Missing 4
    { file: 'simplissime.jpg', lines: ['SIMPLISSIME'], fontSize: 45, letterSpacing: 5, lighten: false },
    { file: 'rafraichissements.jpg', lines: ["C'EST", 'FRAIS'], fontSize: 60, letterSpacing: 15, lighten: false },
    { file: 'dolce-vita.jpg', lines: ['DOLCE', 'VITA'], fontSize: 60, letterSpacing: 15, lighten: false },
    { file: 'voila-lete.jpg', lines: ['VOILÀ', "L'ÉTÉ"], fontSize: 60, letterSpacing: 15, lighten: false }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'final2_' + item.file);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            const compositeElements = [];

            // Get the color of the top-left pixel
            const { data, info } = await sharp(inputPath)
                .raw()
                .toBuffer({ resolveWithObject: true });

            const idx = (20 * width + 20) * info.channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = info.channels === 4 ? data[idx + 3] : 255;

            // Draw the base bandeau
            const eraseHeight = Math.floor(height * 0.30);
            const eraseRect = `
                <svg width="${width}" height="${height}">
                    <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(${r},${g},${b},${a/255})" />
                </svg>
            `;
            compositeElements.push({ input: Buffer.from(eraseRect), blend: 'over' });

            if (item.lighten) {
                const lightenRect = `
                    <svg width="${width}" height="${height}">
                        <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(255,255,255,0.08)" />
                        <line x1="0" y1="${eraseHeight}" x2="${width}" y2="${eraseHeight}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
                    </svg>
                `;
                compositeElements.push({ input: Buffer.from(lightenRect), blend: 'over' });
            } else {
                const lineRect = `
                    <svg width="${width}" height="${height}">
                        <line x1="0" y1="${eraseHeight}" x2="${width}" y2="${eraseHeight}" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
                    </svg>
                `;
                compositeElements.push({ input: Buffer.from(lineRect), blend: 'over' });
            }

            // Add the text
            let textContent = '';
            if (item.lines.length === 1) {
                textContent = `<tspan x="50%" dy="0">${item.lines[0]}</tspan>`;
            } else {
                textContent = `
                  <tspan x="50%" dy="-0.2em">${item.lines[0]}</tspan>
                  <tspan x="50%" dy="1.4em">${item.lines[1]}</tspan>
                `;
            }

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                <text 
                    x="50%" 
                    y="16%" 
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
