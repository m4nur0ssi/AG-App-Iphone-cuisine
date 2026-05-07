const fs = require('fs');
const path = require('path');

const brainDir = '/Users/manu/.gemini/antigravity/brain/fe169e8f-f1b0-4c19-8959-11a81052a7a2';
const destDir = path.join(__dirname, 'public/images/themes/recovered');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  "pas_cher_base_1777988408418.png",
  "pas_cher_piggy_1777988695882.png",
  "sauces_base_1777988775894.png",
  "uploaded_media_1777987066209.img",
  "uploaded_media_1777988748653.img",
  "uploaded_media_1777988841609.img",
  "uploaded_media_1777989289084.img",
  "uploaded_media_1777989674835.img",
  "uploaded_media_1777989952420.img",
  "uploaded_media_1777990320103.img",
  "uploaded_media_1777990538609.img",
  "uploaded_media_1777990629922.img",
  "uploaded_media_1777990770716.img",
  "uploaded_media_1777990886959.img",
  "uploaded_media_1777990985799.img",
  "uploaded_media_1777991078334.img",
  "uploaded_media_1777991314770.img",
  "uploaded_media_1777991746723.img",
  "uploaded_media_1777991959159.img",
  "uploaded_media_1777992057590.img",
  "uploaded_media_1777992222367.img",
  "vegetarien_base_1777988870183.png"
];

for (const file of files) {
    try {
        fs.copyFileSync(path.join(brainDir, file), path.join(destDir, file));
        console.log('Copied', file);
    } catch(e) {
        console.log('Failed', file, e.message);
    }
}
