const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

const filesToProcess = [
    { file: 'pas-cher.png', line1: 'P A S', line2: 'C H E R', eraseTop: true }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'fixed_lines_' + item.file);

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

                // Create a rectangle of that color to cover the top 35% of the image (since it's two lines now)
                const eraseHeight = Math.floor(height * 0.35);
                const eraseRect = `
                    <svg width="${width}" height="${height}">
                        <rect x="0" y="0" width="${width}" height="${eraseHeight}" fill="rgba(${r},${g},${b},${a/255})" />
                    </svg>
                `;
                compositeElements.push({ input: Buffer.from(eraseRect), blend: 'over' });
            }

            // Text configuration
            const fontSizeRatio = 0.08; // Normal size for two lines
            const fontSize = Math.floor(width * fontSizeRatio);
            const letterSpacing = Math.floor(width * 0.03);

            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                <text x="50%" y="15%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="${letterSpacing}" filter="url(#shadow)">
                  <tspan x="50%" dy="0">${item.line1}</tspan>
                  <tspan x="50%" dy="1.3em">${item.line2}</tspan>
                </text>
              </svg>
            `;

            compositeElements.push({ input: Buffer.from(svgText), blend: 'over' });

            await sharp(inputPath)
                .composite(compositeElements)
                .toFormat('png', { quality: 100 })
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
