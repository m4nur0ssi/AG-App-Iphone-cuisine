/**
 * Télécharge les images d'ingrédients depuis TheMealDB (700x700, fond blanc/transparent).
 * Usage: node scripts/download-ingredients.mjs
 */

import https from 'https';
import fs from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public/ingredients');
const JSON_PATH = path.join(__dirname, '../src/data/pic-nic-ingredients.json');

// FR → Nom TheMealDB (case sensitive, espaces possibles)
const INGREDIENTS_MAP = [
  // Œufs & Laitages
  ['oeuf',              'Egg'],
  ['oeufs',             'Egg'],
  ['oeuf entier',       'Egg'],
  ['oeufs entiers',     'Egg'],
  ["jaune d'oeuf",      'Egg Yolk'],
  ["jaunes d'oeufs",    'Egg Yolk'],
  ["blanc d'oeuf",      'Egg White'],
  ["blancs d'oeufs",    'Egg White'],
  ['lait',              'Milk'],
  ['lait entier',       'Milk'],
  ['beurre',            'Butter'],
  ['beurre fondu',      'Butter'],
  ['beurre ramolli',    'Butter'],
  ['beurre non sale',   'Butter'],
  ['creme',             'Double Cream'],
  ['creme liquide',     'Double Cream'],
  ['creme fraiche',     'Creme Fraiche'],
  ['creme epaisse',     'Creme Fraiche'],
  ['creme fouettee',    'Double Cream'],
  ['yaourt',            'Yogurt'],
  ['yaourt grec',       'Yogurt'],
  ['yaourt nature',     'Yogurt'],
  ['mascarpone',        'Mascarpone'],
  ['philadelphia',      'Cream Cheese'],
  ['fromage frais',     'Cream Cheese'],
  ['cream cheese',      'Cream Cheese'],
  ['ricotta',           'Ricotta'],

  // Farines / Sucres / Levure / Fécule
  ['farine',            'Plain Flour'],
  ['farine complete',   'Wholegrain Flour'],
  ['sucre',             'Sugar'],
  ['sucre glace',       'Icing Sugar'],
  ['sucre en poudre',   'Caster Sugar'],
  ['cassonade',         'Brown Sugar'],
  ['sucre roux',        'Brown Sugar'],
  ['levure',            'Baking Powder'],
  ['levure chimique',   'Baking Powder'],
  ['levure boulangere', 'Active Dry Yeast'],
  ['bicarbonate',       'Bicarbonate Of Soda'],
  ['maizena',           'Cornflour'],
  ['fecule',            'Cornflour'],

  // Huiles & Graisses
  ['huile',             'Olive Oil'],
  ['huile olive',       'Olive Oil'],
  ["huile d'olive",     'Olive Oil'],
  ['huile vegetale',    'Vegetable Oil'],
  ['huile tournesol',   'Sunflower Oil'],
  ['huile colza',       'Vegetable Oil'],

  // Aromates / Épices
  ['vanille',           'Vanilla'],
  ['extrait vanille',   'Vanilla Extract'],
  ['gousse vanille',    'Vanilla'],
  ['cannelle',          'Cinnamon'],
  ['cannelle poudre',   'Cinnamon'],
  ['paprika',           'Paprika'],
  ['paprika fume',      'Smoked Paprika'],
  ['cumin',             'Cumin'],
  ['curry',             'Curry Powder'],
  ['gingembre',         'Ginger'],
  ['gingembre frais',   'Fresh Ginger Root'],
  ['sel',               'Salt'],
  ['gros sel',          'Salt'],
  ['fleur de sel',      'Salt'],
  ['poivre',            'Black Pepper'],
  ['poivre noir',       'Black Pepper'],
  ['muscade',           'Nutmeg'],
  ['noix de muscade',   'Nutmeg'],
  ['safran',            'Saffron'],
  ['curcuma',           'Turmeric'],
  ['coriandre',         'Coriander'],
  ['coriandre poudre',  'Coriander'],
  ['piment espelette',  'Paprika'],
  ['piment',            'Red Chilli'],
  ['piment de cayenne', 'Cayenne Pepper'],
  ['quatre epices',     'Mixed Spice'],

  // Herbes fraîches / séchées
  ['persil',            'Parsley'],
  ['persil frais',      'Parsley'],
  ['basilic',           'Basil'],
  ['basilic frais',     'Basil'],
  ['ciboulette',        'Chives'],
  ['menthe',            'Mint'],
  ['origan',            'Oregano'],
  ['thym',              'Thyme'],
  ['romarin',           'Rosemary'],
  ['aneth',             'Dill'],
  ['estragon',          'Tarragon'],
  ['sauge',             'Sage'],
  ['laurier',           'Bay Leaf'],

  // Fruits
  ['fraise',            'Strawberries'],
  ['fraises',           'Strawberries'],
  ['myrtille',          'Blueberries'],
  ['myrtilles',         'Blueberries'],
  ['framboise',         'Raspberries'],
  ['framboises',        'Raspberries'],
  ['citron',            'Lemon'],
  ['jus citron',        'Lemon Juice'],
  ['citron vert',       'Lime'],
  ['orange',            'Orange'],
  ['pomme',             'Apple'],
  ['poire',             'Pear'],
  ['banane',            'Banana'],
  ['mangue',            'Mango'],
  ['avocat',            'Avocado'],
  ['ananas',            'Pineapple'],
  ['raisin',            'Sultanas'],

  // Légumes
  ['tomate',            'Tomato'],
  ['tomates',           'Tomato'],
  ['tomate cerise',     'Cherry Tomatoes'],
  ['oignon',            'Onion'],
  ['oignons',           'Onion'],
  ['oignon rouge',      'Red Onion'],
  ['ail',               'Garlic'],
  ['ail en poudre',     'Garlic Powder'],
  ['echalote',          'Shallots'],
  ['echalotes',         'Shallots'],
  ['carotte',           'Carrots'],
  ['carottes',          'Carrots'],
  ['pomme de terre',    'Potatoes'],
  ['pommes de terre',   'Potatoes'],
  ['courgette',         'Courgettes'],
  ['courgettes',        'Courgettes'],
  ['aubergine',         'Aubergine'],
  ['aubergines',        'Aubergine'],
  ['poivron',           'Red Pepper'],
  ['poivron rouge',     'Red Pepper'],
  ['poivron vert',      'Green Pepper'],
  ['poivron jaune',     'Yellow Pepper'],
  ['concombre',         'Cucumber'],
  ['salade',            'Lettuce'],
  ['laitue',            'Lettuce'],
  ['epinard',           'Spinach'],
  ['epinards',          'Spinach'],
  ['champignon',        'Mushrooms'],
  ['champignons',       'Mushrooms'],
  ['mais',              'Sweetcorn'],
  ['pois',              'Peas'],
  ['petits pois',       'Peas'],
  ['pois chiches',      'Chickpeas'],
  ['poireau',           'Leek'],
  ['poireaux',          'Leek'],
  ['brocoli',           'Broccoli'],
  ['chou-fleur',        'Cauliflower'],
  ['celeri',            'Celery'],
  ['fenouil',           'Fennel'],
  ['asperge',           'Asparagus'],
  ['asperges',          'Asparagus'],
  ['haricots verts',    'Green Beans'],
  ['betterave',         'Beetroot'],
  ['courge',            'Pumpkin'],
  ['potiron',           'Pumpkin'],

  // Protéines
  ['poulet',            'Chicken'],
  ['blanc de poulet',   'Chicken Breasts'],
  ['cuisse poulet',     'Chicken Thighs'],
  ['boeuf',             'Beef'],
  ['viande hachee',     'Minced Beef'],
  ['steak',             'Steak'],
  ['agneau',            'Lamb Mince'],
  ['porc',              'Pork'],
  ['jambon',            'Serrano Ham'],
  ['lardons',           'Bacon'],
  ['lardon',            'Bacon'],
  ['saucisse',          'Pork Sausages'],
  ['saumon',            'Salmon'],
  ['thon',              'Tuna'],
  ['crevettes',         'Prawns'],
  ['cabillaud',         'Cod'],

  // Fromages
  ['fromage',           'Cheese'],
  ['parmesan',          'Parmesan'],
  ['gruyere',           'Gruyere'],
  ['emmental',          'Gruyere'],
  ['mozzarella',        'Mozzarella'],
  ['feta',              'Feta'],
  ['cheddar',           'Cheddar Cheese'],
  ['roquefort',         'Stilton Cheese'],
  ['brie',              'Brie'],
  ['camembert',         'Camembert'],
  ['comte',             'Parmesan'],
  ['fromage rape',      'Parmesan'],

  // Féculents & Pains
  ['riz',               'Rice'],
  ['riz basmati',       'Basmati Rice'],
  ['pates',             'Pasta'],
  ['spaghetti',         'Spaghetti'],
  ['tagliatelles',      'Tagliatelle'],
  ['penne',             'Penne'],
  ['pain',              'Bread'],
  ['pain de mie',       'Breadcrumbs'],
  ['pate feuilletee',   'Puff Pastry'],
  ['gnocchis',          'Gnocchi'],
  ['lasagnes',          'Lasagne Sheets'],
  ['polenta',           'Polenta'],
  ['orge',              'Pearl Barley'],

  // Condiments & Sauces
  ['sauce soja',        'Soy Sauce'],
  ['sauce tomate',      'Tomato Passata'],
  ['concentre tomate',  'Tomato Puree'],
  ['vinaigre',          'White Wine Vinegar'],
  ['vinaigre balsamique','Balsamic Vinegar'],
  ['vinaigre riz',      'Rice Wine Vinegar'],
  ['moutarde',          'Dijon Mustard'],
  ['mayonnaise',        'Mayonnaise'],
  ['ketchup',           'Ketchup'],
  ['miel',              'Honey'],
  ['sirop erable',      'Maple Syrup'],
  ['sriracha',          'Red Chilli'],
  ['olive',             'Black Olives'],
  ['olives',            'Black Olives'],
  ['olives noires',     'Black Olives'],
  ['cornichon',         'Gherkins'],
  ['cornichons',        'Gherkins'],
  ['sauce worcestershire','Worcestershire Sauce'],
  ['sauce poisson',     'Fish Sauce'],

  // Chocolat & Pâtisserie
  ['chocolat',          'Dark Chocolate'],
  ['chocolat noir',     'Dark Chocolate'],
  ['chocolat blanc',    'White Chocolate'],
  ['chocolat lait',     'Milk Chocolate'],
  ['cacao',             'Cocoa Powder'],
  ['poudre cacao',      'Cocoa Powder'],
  ['caramel',           'Golden Syrup'],

  // Fruits secs & Noix
  ['noix',              'Walnuts'],
  ['amande',            'Almonds'],
  ['amandes',           'Almonds'],
  ['noisette',          'Hazelnuts'],
  ['noisettes',         'Hazelnuts'],
  ['cacahuete',         'Peanuts'],
  ['cacahuetes',        'Peanuts'],
  ['pistache',          'Pistachios'],
  ['pistaches',         'Pistachios'],
  ['noix de cajou',     'Cashew Nuts'],
  ['noix de pecan',     'Pecans'],
  ['noix de coco',      'Desiccated Coconut'],
  ['raisins secs',      'Sultanas'],

  // Légumineuses
  ['lentille',          'Green Lentils'],
  ['lentilles',         'Green Lentils'],
  ['lentilles rouges',  'Red Lentils'],
  ['haricot',           'Red Kidney Beans'],
  ['haricots',          'Red Kidney Beans'],
  ['haricots blancs',   'Cannellini Beans'],

  // Divers
  ['lait de coco',      'Coconut Milk'],
  ['eau',               'Water'],
  ['bouillon',          'Vegetable Stock'],
  ['bouillon poulet',   'Chicken Stock'],
  ['colorant',          'Food Colouring'],
  ['gelatine',          'Gelatin'],
  ['levure',            'Baking Powder'],
];

function download(url, dest) {
  return new Promise((resolve) => {
    const file = createWriteStream(dest);
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
        file.on('error', () => { resolve(false); });
      } else {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        resolve(false);
      }
    });
    req.on('error', () => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      resolve(false);
    });
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  const result = { ...existing };

  // Cache: mealdb-name → local path (to avoid re-downloading)
  const cache = new Map();

  let success = 0;
  let fail = 0;

  for (const [frName, mealdbName] of INGREDIENTS_MAP) {
    const slug = slugify(mealdbName);
    const localPath = `/ingredients/meal-${slug}.png`;
    const destPath = path.join(PUBLIC_DIR, `meal-${slug}.png`);

    // Already processed this mealdb image?
    if (cache.has(mealdbName)) {
      result[frName] = cache.get(mealdbName);
      continue;
    }

    // Already exists locally with valid size?
    if (fs.existsSync(destPath)) {
      try {
        const stat = fs.statSync(destPath);
        if (stat.size > 10000) {
          cache.set(mealdbName, localPath);
          result[frName] = localPath;
          process.stdout.write(`  ✓ (cache) ${frName}\n`);
          success++;
          continue;
        }
      } catch {}
    }

    // Download from TheMealDB
    const encodedName = encodeURIComponent(mealdbName);
    const url = `https://www.themealdb.com/images/ingredients/${encodedName}.png`;
    process.stdout.write(`  ↓ ${frName} (${mealdbName})... `);

    const ok = await download(url, destPath);

    if (ok && fs.existsSync(destPath)) {
      try {
        const stat = fs.statSync(destPath);
        if (stat.size > 10000) {
          cache.set(mealdbName, localPath);
          result[frName] = localPath;
          console.log(`✓ (${Math.round(stat.size / 1024)}KB)`);
          success++;
        } else {
          try { fs.unlinkSync(destPath); } catch {}
          console.log(`✗ image trop petite`);
          fail++;
        }
      } catch {
        console.log(`✗ erreur stat`);
        fail++;
      }
    } else {
      console.log(`✗ échec`);
      fail++;
    }
  }

  // Write updated JSON
  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
  console.log(`\n✅ ${success} images téléchargées, ${fail} échecs`);
  console.log(`📄 JSON mis à jour`);
}

main().catch(console.error);
