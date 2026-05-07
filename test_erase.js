const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function eraseTopAndAddText(filename, text, outFilename) {
    const inputPath = path.join(__dirname, 'public/images/themes', filename);
    const outputPath = path.join(__dirname, 'public/images/themes', outFilename);

    try {
        const metadata = await sharp(inputPath).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Get the background color from a pixel at the top left (x=10, y=10)
        // Wait, sharp doesn't easily expose getPixel without raw().
        const { data, info } = await sharp(inputPath)
            .raw()
            .toBuffer({ resolveWithObject: true });

        // pixel at x=10, y=10
        const idx = (10 * width + 10) * info.channels;
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

        // Add the new text
        let fontSizeRatio = 0.08;
        if (text.length > 12) fontSizeRatio = 0.055;
        if (text.length > 25) fontSizeRatio = 0.045;

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
                ${text}
            </text>
            </svg>
        `;

        // Composite the erasure and then the text
        await sharp(inputPath)
            .composite([
                { input: Buffer.from(eraseRect), blend: 'over' },
                { input: Buffer.from(svgText), blend: 'over' }
            ])
            .toFormat('png', { quality: 90 })
            .toFile(outputPath);

        console.log(`Processed ${filename} -> ${outFilename}`);
    } catch (e) {
        console.error(`Error processing ${filename}:`, e.message);
    }
}

eraseTopAndAddText('express.png', 'E X P R E S S', 'express_fixed.png');
