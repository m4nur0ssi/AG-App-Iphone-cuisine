/**
 * Reconstruit pic-nic-ingredients.json proprement avec les images TheMealDB + bonnes images locales.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public/ingredients');
const JSON_PATH = path.join(__dirname, '../src/data/pic-nic-ingredients.json');

// Image locale préférée si elle est grande (≥ 300px)
const GOOD_LOCAL = {
  'ail':           '/ingredients/ail.png',        // 640x640
  'garlic':        '/ingredients/ail.png',
  'beurre':        '/ingredients/beurre.png',     // 640x640
  'butter':        '/ingredients/beurre.png',
  'oignon':        '/ingredients/oignon.png',     // 640x640
  'onion':         '/ingredients/oignon.png',
  'oignons':       '/ingredients/oignon.png',
  'tomate':        '/ingredients/tomate.png',     // 640x640
  'tomato':        '/ingredients/tomate.png',
  'tomates':       '/ingredients/tomate.png',
  'poivre':        '/ingredients/poivre.png',     // 640x640
  'pepper':        '/ingredients/pepper.png',
  'sel':           '/ingredients/sel.png',        // 640x640
  'salt':          '/ingredients/salt.png',
  'parmesan':      '/ingredients/parmesan.png',   // 640x640
  'feta':          '/ingredients/feta.png',       // 640x640
  'citron':        '/ingredients/citron.png',     // 640x640
  'lemon':         '/ingredients/citron.png',
  'huile':         '/ingredients/huile_olive.png',// 640x640
  'huile olive':   '/ingredients/huile_olive.png',
  "huile d'olive": '/ingredients/huile_olive.png',
  'oil':           '/ingredients/huile_olive.png',
  'paprika':       '/ingredients/paprika.png',    // 640x640
  'origan':        '/ingredients/origan.png',     // 640x640
  'oregano':       '/ingredients/origan.png',
  'basilic':       '/ingredients/basilic.png',    // 640x640
  'ciboulette':    '/ingredients/ciboulette.png', // 640x640
  'yaourt':        '/ingredients/yaourt.png',     // 640x640
  'yogurt':        '/ingredients/yaourt.png',
  'miel':          '/ingredients/miel.webp',      // 300x300
  'honey':         '/ingredients/miel.webp',
  'thon':          '/ingredients/thon.png',       // 640x640
  'farine':        '/ingredients/farine.webp',    // 300x300
  'flour':         '/ingredients/farine.webp',
};

// Helper: check if a meal-*.png was downloaded successfully
function mealPath(slug) {
  const p = path.join(PUBLIC_DIR, `meal-${slug}.png`);
  if (fs.existsSync(p)) {
    try {
      const stat = fs.statSync(p);
      if (stat.size > 10000) return `/ingredients/meal-${slug}.png`;
    } catch {}
  }
  return null;
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// All the ingredient mappings with their TheMealDB name
const MAPPINGS = [
  // Oeufs
  ['oeuf',                    'Egg'],
  ['oeufs',                   'Egg'],
  ['oeuf entier',             'Egg'],
  ['oeufs entiers',           'Egg'],
  ["jaune d'oeuf",            'Egg Yolk'],
  ["jaune d’oeuf",       'Egg Yolk'],
  ["jaunes d'oeufs",          'Egg Yolk'],
  ["jaune d'œuf",        'Egg Yolk'],
  ["jaunes d'œufs",      'Egg Yolk'],
  ['jaune',                   'Egg Yolk'],
  ['jaunes',                  'Egg Yolk'],
  ["blanc d'oeuf",            'Egg White'],
  ["blancs d'oeufs",          'Egg White'],
  ["blanc d'œuf",        'Egg White'],
  ["blancs d'œufs",      'Egg White'],
  ['blanc',                   'Egg White'],
  ['blancs',                  'Egg White'],

  // Laitages
  ['lait',                    'Milk'],
  ['lait entier',             'Milk'],
  ['beurre',                  'Butter'],
  ['beurre fondu',            'Butter'],
  ['beurre ramolli',          'Butter'],
  ['beurre non sale',         'Butter'],
  ['beurre non salé',    'Butter'],
  ['creme',                   'Double Cream'],
  ['crème',              'Double Cream'],
  ['creme liquide',           'Double Cream'],
  ['crème liquide',      'Double Cream'],
  ['creme fouettee',          'Double Cream'],
  ['crème fouettée','Double Cream'],
  ['creme fraiche',           'Creme Fraiche'],
  ['crème fraîche', 'Creme Fraiche'],
  ['creme epaisse',           'Creme Fraiche'],
  ['crème épaisse', 'Creme Fraiche'],
  ['heavy cream',             'Double Cream'],
  ['whipping cream',          'Double Cream'],
  ['yaourt',                  'Yogurt'],
  ['yaourt grec',             'Yogurt'],
  ['yaourt nature',           'Yogurt'],
  ['greek yogurt',            'Yogurt'],
  ['plain yogurt',            'Yogurt'],
  ['mascarpone',              'Mascarpone'],
  ['philadelphia',            'Cream Cheese'],
  ['fromage frais',           'Cream Cheese'],
  ['cream cheese',            'Cream Cheese'],
  ['ricotta',                 'Ricotta'],

  // Farines / Sucres
  ['farine',                  'Plain Flour'],
  ['sucre',                   'Sugar'],
  ['sucre glace',             'Icing Sugar'],
  ['sucre en poudre',         'Caster Sugar'],
  ['sucre cassonade',         'Brown Sugar'],
  ['cassonade',               'Brown Sugar'],
  ['sucre roux',              'Brown Sugar'],
  ['brown sugar',             'Brown Sugar'],
  ['powdered sugar',          'Icing Sugar'],
  ['icing sugar',             'Icing Sugar'],
  ['caster sugar',            'Caster Sugar'],
  ['levure',                  'Baking Powder'],
  ['levure chimique',         'Baking Powder'],
  ['baking powder',           'Baking Powder'],
  ['bicarbonate',             'Bicarbonate Of Soda'],
  ['baking soda',             'Bicarbonate Of Soda'],
  ['maizena',                 'Cornflour'],
  ['maïzena',            'Cornflour'],
  ['fecule',                  'Cornflour'],
  ['fécule',             'Cornflour'],
  ['cornflour',               'Cornflour'],
  ['cornstarch',              'Cornflour'],

  // Huiles
  ['huile vegetale',          'Vegetable Oil'],
  ['huile tournesol',         'Sunflower Oil'],
  ['huile colza',             'Vegetable Oil'],
  ['vegetable oil',           'Vegetable Oil'],
  ['sunflower oil',           'Sunflower Oil'],

  // Aromates / Épices
  ['vanille',                 'Vanilla'],
  ['vanilla',                 'Vanilla'],
  ['extrait vanille',         'Vanilla Extract'],
  ['extrait de vanille',      'Vanilla Extract'],
  ['vanilla extract',         'Vanilla Extract'],
  ['gousse vanille',          'Vanilla'],
  ['cannelle',                'Cinnamon'],
  ['cinnamon',                'Cinnamon'],
  ['paprika fume',            'Smoked Paprika'],
  ['paprika fumé',       'Smoked Paprika'],
  ['smoked paprika',          'Smoked Paprika'],
  ['cumin',                   'Cumin'],
  ['curry',                   'Curry Powder'],
  ['curry powder',            'Curry Powder'],
  ['gingembre',               'Ginger'],
  ['ginger',                  'Ginger'],
  ['gros sel',                'Salt'],
  ['fleur de sel',            'Salt'],
  ['poivre noir',             'Black Pepper'],
  ['black pepper',            'Black Pepper'],
  ['ground pepper',           'Black Pepper'],
  ['muscade',                 'Nutmeg'],
  ['noix de muscade',         'Nutmeg'],
  ['nutmeg',                  'Nutmeg'],
  ['safran',                  'Saffron'],
  ['saffron',                 'Saffron'],
  ['curcuma',                 'Turmeric'],
  ['turmeric',                'Turmeric'],
  ['coriandre',               'Coriander'],
  ['coriander',               'Coriander'],
  ['piment',                  'Red Chilli'],
  ['piment de cayenne',       'Cayenne Pepper'],
  ['cayenne',                 'Cayenne Pepper'],
  ['cayenne pepper',          'Cayenne Pepper'],
  ['quatre epices',           'Mixed Spice'],
  ['ground cinnamon',         'Cinnamon'],
  ['ground cumin',            'Cumin'],
  ['ground coriander',        'Coriander'],
  ['ground ginger',           'Ginger'],

  // Herbes
  ['persil',                  'Parsley'],
  ['parsley',                 'Parsley'],
  ['basilic frais',           'Basil'],
  ['fresh basil',             'Basil'],
  ['ciboulette fraiche',      'Chives'],
  ['chives',                  'Chives'],
  ['menthe fraiche',          'Mint'],
  ['fresh mint',              'Mint'],
  ['mint',                    'Mint'],
  ['thym',                    'Thyme'],
  ['thyme',                   'Thyme'],
  ['romarin',                 'Rosemary'],
  ['rosemary',                'Rosemary'],
  ['aneth',                   'Dill'],
  ['dill',                    'Dill'],
  ['estragon',                'Tarragon'],
  ['tarragon',                'Tarragon'],
  ['sauge',                   'Sage'],
  ['sage',                    'Sage'],
  ['laurier',                 'Bay Leaf'],
  ['bay leaf',                'Bay Leaf'],

  // Fruits
  ['fraise',                  'Strawberries'],
  ['fraises',                 'Strawberries'],
  ['strawberry',              'Strawberries'],
  ['strawberries',            'Strawberries'],
  ['myrtille',                'Blueberries'],
  ['myrtilles',               'Blueberries'],
  ['blueberry',               'Blueberries'],
  ['blueberries',             'Blueberries'],
  ['framboise',               'Raspberries'],
  ['framboises',              'Raspberries'],
  ['raspberry',               'Raspberries'],
  ['raspberries',             'Raspberries'],
  ['jus citron',              'Lemon Juice'],
  ['jus de citron',           'Lemon Juice'],
  ['lemon juice',             'Lemon Juice'],
  ['citron vert',             'Lime'],
  ['lime',                    'Lime'],
  ['orange',                  'Orange'],
  ['pomme',                   'Apple'],
  ['apple',                   'Apple'],
  ['poire',                   'Apple'],
  ['banane',                  'Banana'],
  ['banana',                  'Banana'],
  ['mangue',                  'Apple'],
  ['avocat',                  'Avocado'],
  ['avocado',                 'Avocado'],
  ['ananas',                  'Pineapple'],
  ['pineapple',               'Pineapple'],
  ['raisin',                  'Sultanas'],
  ['raisins secs',            'Sultanas'],

  // Légumes
  ['tomate cerise',           'Cherry Tomatoes'],
  ['cherry tomatoes',         'Cherry Tomatoes'],
  ['oignon rouge',            'Red Onion'],
  ['red onion',               'Red Onion'],
  ['ail en poudre',           'Garlic Powder'],
  ['garlic powder',           'Garlic Powder'],
  ['echalote',                'Shallots'],
  ['echalotes',               'Shallots'],
  ['shallots',                'Shallots'],
  ['shallot',                 'Shallots'],
  ['carotte',                 'Carrots'],
  ['carottes',                'Carrots'],
  ['carrot',                  'Carrots'],
  ['carrots',                 'Carrots'],
  ['pomme de terre',          'Potatoes'],
  ['pommes de terre',         'Potatoes'],
  ['potato',                  'Potatoes'],
  ['potatoes',                'Potatoes'],
  ['courgette',               'Courgettes'],
  ['courgettes',              'Courgettes'],
  ['zucchini',                'Courgettes'],
  ['aubergine',               'Aubergine'],
  ['aubergines',              'Aubergine'],
  ['eggplant',                'Aubergine'],
  ['poivron',                 'Red Pepper'],
  ['poivron rouge',           'Red Pepper'],
  ['red pepper',              'Red Pepper'],
  ['bell pepper',             'Red Pepper'],
  ['red bell pepper',         'Red Pepper'],
  ['poivron vert',            'Green Pepper'],
  ['green pepper',            'Green Pepper'],
  ['poivron jaune',           'Yellow Pepper'],
  ['concombre',               'Cucumber'],
  ['cucumber',                'Cucumber'],
  ['salade verte',            'Lettuce'],
  ['laitue',                  'Lettuce'],
  ['lettuce',                 'Lettuce'],
  ['epinard',                 'Spinach'],
  ['epinards',                'Spinach'],
  ['spinach',                 'Spinach'],
  ['champignon',              'Mushrooms'],
  ['champignons',             'Mushrooms'],
  ['mushroom',                'Mushrooms'],
  ['mushrooms',               'Mushrooms'],
  ['mais',                    'Sweetcorn'],
  ['maïs',               'Sweetcorn'],
  ['corn',                    'Sweetcorn'],
  ['sweetcorn',               'Sweetcorn'],
  ['pois',                    'Peas'],
  ['petits pois',             'Peas'],
  ['peas',                    'Peas'],
  ['pois chiches',            'Chickpeas'],
  ['chickpeas',               'Chickpeas'],
  ['poireau',                 'Leek'],
  ['poireaux',                'Leek'],
  ['leek',                    'Leek'],
  ['brocoli',                 'Broccoli'],
  ['broccoli',                'Broccoli'],
  ['chou-fleur',              'Broccoli'],
  ['cauliflower',             'Broccoli'],
  ['celeri',                  'Celery'],
  ['céleri',             'Celery'],
  ['celery',                  'Celery'],
  ['fenouil',                 'Fennel'],
  ['fennel',                  'Fennel'],
  ['asperge',                 'Asparagus'],
  ['asperges',                'Asparagus'],
  ['asparagus',               'Asparagus'],
  ['haricots verts',          'Green Beans'],
  ['green beans',             'Green Beans'],
  ['betterave',               'Beetroot'],
  ['beetroot',                'Beetroot'],
  ['courge',                  'Pumpkin'],
  ['potiron',                 'Pumpkin'],
  ['pumpkin',                 'Pumpkin'],

  // Protéines
  ['poulet',                  'Chicken'],
  ['chicken',                 'Chicken'],
  ['blanc de poulet',         'Chicken Breasts'],
  ['blancs de poulet',        'Chicken Breasts'],
  ['chicken breast',          'Chicken Breasts'],
  ['chicken breasts',         'Chicken Breasts'],
  ['cuisse poulet',           'Chicken Thighs'],
  ['cuisses poulet',          'Chicken Thighs'],
  ['chicken thighs',          'Chicken Thighs'],
  ['boeuf',                   'Beef'],
  ['bœuf',               'Beef'],
  ['beef',                    'Beef'],
  ['viande hachee',           'Minced Beef'],
  ['viande hachée',      'Minced Beef'],
  ['boeuf hache',             'Minced Beef'],
  ['bœuf haché',    'Minced Beef'],
  ['minced beef',             'Minced Beef'],
  ['ground beef',             'Minced Beef'],
  ['steak',                   'Beef'],
  ['rumsteck',                'Beef'],
  ['bavette',                 'Beef'],
  ['agneau',                  'Lamb Mince'],
  ['lamb',                    'Lamb Mince'],
  ['porc',                    'Pork'],
  ['pork',                    'Pork'],
  ['jambon',                  'Serrano Ham'],
  ['ham',                     'Serrano Ham'],
  ['lardons',                 'Bacon'],
  ['lardon',                  'Bacon'],
  ['bacon',                   'Bacon'],
  ['saucisse',                'Pork Sausages'],
  ['saucisses',               'Pork Sausages'],
  ['saumon',                  'Salmon'],
  ['salmon',                  'Salmon'],
  ['thon en conserve',        'Tuna'],
  ['tuna',                    'Tuna'],
  ['crevettes',               'Prawns'],
  ['prawns',                  'Prawns'],
  ['shrimp',                  'Prawns'],
  ['cabillaud',               'Cod'],
  ['cod',                     'Cod'],

  // Fromages
  ['fromage',                 'Cheese'],
  ['cheese',                  'Cheese'],
  ['fromage rape',            'Parmesan'],
  ['fromage rapé',       'Parmesan'],
  ['gruyere',                 'Gruyere'],
  ['gruyère',            'Gruyere'],
  ['emmental',                'Gruyere'],
  ['mozzarella',              'Mozzarella'],
  ['cheddar',                 'Cheddar Cheese'],
  ['cheddar cheese',          'Cheddar Cheese'],
  ['roquefort',               'Stilton Cheese'],
  ['blue cheese',             'Stilton Cheese'],
  ['brie',                    'Brie'],
  ['camembert',               'Brie'],
  ['comte',                   'Parmesan'],
  ['comté',              'Parmesan'],

  // Féculents
  ['riz',                     'Rice'],
  ['rice',                    'Rice'],
  ['riz basmati',             'Basmati Rice'],
  ['basmati rice',            'Basmati Rice'],
  ['pates',                   'Spaghetti'],
  ['pâtes',              'Spaghetti'],
  ['pasta',                   'Spaghetti'],
  ['spaghetti',               'Spaghetti'],
  ['tagliatelles',            'Tagliatelle'],
  ['tagliatelle',             'Tagliatelle'],
  ['penne',                   'Spaghetti'],
  ['pain',                    'Bread'],
  ['bread',                   'Bread'],
  ['pain de mie',             'Breadcrumbs'],
  ['chapelure',               'Breadcrumbs'],
  ['breadcrumbs',             'Breadcrumbs'],
  ['pate feuilletee',         'Puff Pastry'],
  ['pâte feuilletee',    'Puff Pastry'],
  ['puff pastry',             'Puff Pastry'],
  ['gnocchis',                'Spaghetti'],
  ['gnocchi',                 'Spaghetti'],
  ['lasagnes',                'Lasagne Sheets'],
  ['lasagne',                 'Lasagne Sheets'],
  ['lasagna',                 'Lasagne Sheets'],

  // Condiments
  ['sauce soja',              'Soy Sauce'],
  ['soy sauce',               'Soy Sauce'],
  ['sauce tomate',            'Tomato Puree'],
  ['concentre tomate',        'Tomato Puree'],
  ['tomato puree',            'Tomato Puree'],
  ['tomato paste',            'Tomato Puree'],
  ['vinaigre',                'White Wine Vinegar'],
  ['vinegar',                 'White Wine Vinegar'],
  ['vinaigre balsamique',     'Balsamic Vinegar'],
  ['balsamic vinegar',        'Balsamic Vinegar'],
  ['vinaigre riz',            'Rice Wine Vinegar'],
  ['rice vinegar',            'Rice Wine Vinegar'],
  ['moutarde',                'Dijon Mustard'],
  ['mustard',                 'Dijon Mustard'],
  ['mayonnaise',              'Mayonnaise'],
  ['sirop erable',            'Maple Syrup'],
  ['maple syrup',             'Maple Syrup'],
  ['olive',                   'Black Olives'],
  ['olives',                  'Black Olives'],
  ['olives noires',           'Black Olives'],
  ['black olives',            'Black Olives'],
  ['sauce worcestershire',    'Worcestershire Sauce'],
  ['worcestershire sauce',    'Worcestershire Sauce'],
  ['sauce poisson',           'Fish Sauce'],
  ['fish sauce',              'Fish Sauce'],
  ['ketchup',                 'Ketchup'],

  // Chocolat & Pâtisserie
  ['chocolat',                'Dark Chocolate'],
  ['chocolate',               'Dark Chocolate'],
  ['chocolat noir',           'Dark Chocolate'],
  ['dark chocolate',          'Dark Chocolate'],
  ['chocolat blanc',          'White Chocolate'],
  ['white chocolate',         'White Chocolate'],
  ['chocolat lait',           'Milk Chocolate'],
  ['milk chocolate',          'Milk Chocolate'],
  ['cacao',                   'Cocoa Powder'],
  ['poudre cacao',            'Cocoa Powder'],
  ['cocoa powder',            'Cocoa Powder'],
  ['caramel',                 'Golden Syrup'],

  // Noix & Fruits secs
  ['noix',                    'Walnuts'],
  ['walnuts',                 'Walnuts'],
  ['amande',                  'Almonds'],
  ['amandes',                 'Almonds'],
  ['almonds',                 'Almonds'],
  ['noisette',                'Almonds'],
  ['noisettes',               'Almonds'],
  ['hazelnuts',               'Almonds'],
  ['cacahuete',               'Peanuts'],
  ['cacahuetes',              'Peanuts'],
  ['peanuts',                 'Peanuts'],
  ['pistache',                'Peanuts'],
  ['pistaches',               'Peanuts'],
  ['pistachios',              'Peanuts'],
  ['noix de cajou',           'Cashew Nuts'],
  ['cashews',                 'Cashew Nuts'],
  ['noix de coco',            'Desiccated Coconut'],
  ['coconut',                 'Desiccated Coconut'],

  // Légumineuses
  ['lentille',                'Red Lentils'],
  ['lentilles',               'Red Lentils'],
  ['lentils',                 'Red Lentils'],
  ['lentilles rouges',        'Red Lentils'],
  ['haricot',                 'Cannellini Beans'],
  ['haricots',                'Cannellini Beans'],
  ['haricots blancs',         'Cannellini Beans'],
  ['beans',                   'Cannellini Beans'],

  // Divers
  ['lait de coco',            'Coconut Milk'],
  ['coconut milk',            'Coconut Milk'],
  ['eau',                     'Water'],
  ['bouillon',                'Vegetable Stock'],
  ['bouillon poulet',         'Chicken Stock'],
  ['bouillon legumes',        'Vegetable Stock'],
  ['vegetable stock',         'Vegetable Stock'],
  ['chicken stock',           'Chicken Stock'],
];

function buildJSON() {
  const result = {};

  for (const [frName, mealdbName] of MAPPINGS) {
    // Priority 1: Good local image
    if (GOOD_LOCAL[frName]) {
      const localFile = path.join(PUBLIC_DIR, path.basename(GOOD_LOCAL[frName]));
      if (fs.existsSync(localFile)) {
        result[frName] = GOOD_LOCAL[frName];
        continue;
      }
    }

    // Priority 2: TheMealDB image
    const slug = slugify(mealdbName);
    const meal = mealPath(slug);
    if (meal) {
      result[frName] = meal;
      continue;
    }

    // Not found - don't add (will use emoji fallback)
  }

  return result;
}

const json = buildJSON();
fs.writeFileSync(JSON_PATH, JSON.stringify(json, null, 2));

const count = Object.keys(json).length;
console.log(`✅ pic-nic-ingredients.json reconstruit : ${count} entrées`);

// Show a few samples
const samples = Object.entries(json).slice(0, 10);
for (const [k, v] of samples) {
  console.log(`  ${k.padEnd(30)} → ${v}`);
}
