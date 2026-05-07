const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const brainDir = '/Users/manu/.gemini/antigravity/brain/02985044-a650-4b78-9835-bda384095a64';
const themesDir = '/Users/manu/CloudStation/Anti Gravity/Ag - Projet app iphone cuisine/public/images/themes';

const mapping = {
  'sauces_screenshot_1777903967495.png': 'sauces.jpg',
  'healthy_screenshot_1777903979618.png': 'healthy.jpg',
  'airfryer_screenshot_1777903980371.png': 'airfryer.jpg',
  'barbecue_screenshot_1777903980735.png': 'barbecue.jpg',
  'pas_cher_screenshot_1777903998296.png': 'pas-cher.jpg',
  'express_screenshot_1777903999121.png': 'express.jpg',
  'famille_screenshot_1777904000198.png': 'famille.jpg',
  'vegetarien_screenshot_1777904000581.png': 'vegetarien.jpg'
};

async function process() {
  for (const [src, dest] of Object.entries(mapping)) {
    const srcPath = path.join(brainDir, src);
    const destPath = path.join(themesDir, dest);
    
    if (!fs.existsSync(srcPath)) {
      console.error('Source not found:', srcPath);
      continue;
    }
    
    console.log('Processing ' + src + ' -> ' + dest);
    try {
      await sharp(srcPath)
        .jpeg({ quality: 90 })
        .toFile(destPath);
      console.log('Success!');
    } catch (err) {
      console.error('Error:', err);
    }
  }
}

process();
