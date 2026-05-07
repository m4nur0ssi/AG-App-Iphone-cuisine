const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const themesDir = path.join(__dirname, 'public/images/themes');

const filesToProcess = [
    { file: 'astuces.jpg', text: 'A S T U C E S' },
    { file: 'cest-lhiver.jpg', text: "C ' E S T   L ' H I V E R", long: true },
    { file: 'dolce-vita.jpg', text: 'D O L C E   V I T A' },
    { file: 'glaces.jpg', text: 'G L A C E S' },
    { file: 'noel.jpg', text: 'N O Ë L' },
    { file: 'paques.jpg', text: 'P Â Q U E S' },
    { file: 'pas-cher-base.png', text: 'P A S   C H E R', out: 'pas-cher.png' },
    { file: 'rafraichissements.jpg', text: 'R A F R A Î C H I S S E M E N T S', long: true },
    { file: 'sauces-base.png', text: 'S A U C E S', out: 'sauces.png' },
    { file: 'simplissime.jpg', text: 'S I M P L I S S I M E' },
    { file: 'vegetarien-base.png', text: 'V É G É T A R I E N', long: true },
    { file: 'voila-lete.jpg', text: "V O I L À   L ' É T É", long: true }
];

async function processImages() {
    for (const item of filesToProcess) {
        const inputPath = path.join(themesDir, item.file);
        
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${item.file}, not found.`);
            continue;
        }

        const outName = item.out || item.file;
        const outputPath = path.join(themesDir, 'processed_' + outName);

        try {
            const metadata = await sharp(inputPath).metadata();
            const width = metadata.width;
            const height = metadata.height;

            // Use exact same logic as 'sauces'
            let fontSizeRatio = 0.08;
            if (item.long) {
                fontSizeRatio = 0.055; // Slightly smaller to fit
            }
            if (item.text.length > 25) {
                fontSizeRatio = 0.045; 
            }

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
                .toFormat(outName.endsWith('.png') ? 'png' : 'jpeg', { quality: 90 })
                .toFile(outputPath);

            // Replace original file
            fs.renameSync(outputPath, path.join(themesDir, outName));
            console.log(`Processed ${outName}`);

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e.message);
        }
    }
}

processImages().then(() => {
    console.log("All done!");
});
