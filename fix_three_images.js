const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

const filesToProcess = [
    { file: 'vegetarien.png', text: 'V É G É T A R I E N', eraseTop: true, extraSmall: true },
    { file: 'cest-lhiver.jpg', lines: ["C ' E S T", "L ' H I V E R"], eraseTop: true },
    { file: 'voila-lete.jpg', lines: ["V O I L À", "L ' É T É"], eraseTop: true }
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

            if (item.eraseTop) {
                // Get the background color from a pixel at the top left
                const { data, info } = await sharp(inputPath)
                    .raw()
                    .toBuffer({ resolveWithObject: true });

                const idx = (20 * width + 20) * info.channels;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = info.channels === 4 ? data[idx + 3] : 255;

                // Create a rectangle of that color to cover the top 25% of the image
                const eraseHeight = Math.floor(height * 0.25);
                const eraseRect = `
                    <svg width="${width}" height="${height}">
                        <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(${r},${g},${b},${a/255})" />
                    </svg>
                `;
                compositeElements.push({ input: Buffer.from(eraseRect), blend: 'over' });
            }

            // Text configuration
            let fontSizeRatio = 0.08;
            if (item.extraSmall) fontSizeRatio = 0.040;
            
            const fontSize = Math.floor(width * fontSizeRatio);
            const letterSpacing = Math.floor(width * 0.03);

            let textContent = '';
            if (item.lines) {
                textContent = `
                    <text x="50%" y="10%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${letterSpacing}" filter="url(#shadow)">${item.lines[0]}</text>
                    <text x="50%" y="20%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${letterSpacing}" filter="url(#shadow)">${item.lines[1]}</text>
                `;
            } else {
                textContent = `
                    <text x="50%" y="15%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${letterSpacing}" filter="url(#shadow)">${item.text}</text>
                `;
            }

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                ${textContent}
              </svg>
            `;

            compositeElements.push({ input: Buffer.from(svgText), blend: 'over' });

            await sharp(inputPath)
                .composite(compositeElements)
                .toFormat(item.file.endsWith('.png') ? 'png' : 'jpeg', { quality: 90 })
                .toFile(outputPath);

            fs.renameSync(outputPath, inputPath);
            console.log(`Processed ${item.file}`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages().then(() => {
    console.log("All done!");
});
