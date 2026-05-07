const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

// Seulement les images restaurées depuis Git
const filesToProcess = [
    { file: 'simplissime.jpg', lines: ['S I M P L I', 'S S I M E'] },
    { file: 'rafraichissements.jpg', lines: ["C ' E S T", 'F R A I S'] },
    { file: 'dolce-vita.jpg', lines: ['D O L C E', 'V I T A'] },
    { file: 'cest-lhiver.jpg', lines: ["C ' E S T", "L ' H I V E R"] },
    { file: 'voila-lete.jpg', lines: ["V O I L À", "L ' É T É"] }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outputPath = path.join(themesDir, 'nobandeau_' + item.file);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            const compositeElements = [];

            // Text configuration
            let fontSizeRatio = 0.08; 
            const fontSize = Math.floor(width * fontSizeRatio);
            const letterSpacing = Math.floor(width * 0.03);

            let textContent = `
              <tspan x="50%" dy="0">${item.lines[0]}</tspan>
              <tspan x="50%" dy="1.3em">${item.lines[1]}</tspan>
            `;

            // On ajoute une ombre forte pour que le texte soit lisible sur l'image d'origine
            // et cache un peu l'ancien faux-texte généré par l'IA si présent
            const svgText = `
              <svg width="${width}" height="${height}">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="15" flood-color="#000000" flood-opacity="0.9" />
                    <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                <text x="50%" y="15%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="${letterSpacing}" filter="url(#shadow)">
                  ${textContent}
                </text>
              </svg>
            `;

            compositeElements.push({ input: Buffer.from(svgText), blend: 'over' });

            await sharp(inputPath)
                .composite(compositeElements)
                .toFormat(item.file.endsWith('.png') ? 'png' : 'jpeg', { quality: 100 })
                .toFile(outputPath);

            fs.renameSync(outputPath, inputPath);
            console.log(`Processed ${item.file} WITHOUT bandeau.`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages().then(() => {
    console.log("All done!");
});
