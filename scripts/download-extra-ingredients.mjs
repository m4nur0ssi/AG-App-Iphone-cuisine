/**
 * Télécharge les images TheMealDB manquantes (fruits, légumes, épices).
 * Utilise des équivalents proches quand l'ingrédient exact n'existe pas.
 */
import https from 'https';
import fs from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public/ingredients');
const JSON_PATH = path.join(__dirname, '../src/data/pic-nic-ingredients.json');

// Nouveaux ingrédients à télécharger : [nom FR, nom TheMealDB]
const EXTRA_INGREDIENTS = [
  // Agrumes & fruits oubliés
  ['clementine',          'Orange'],        // Agrume similaire
  ['clémentine',          'Orange'],
  ['zeste de clementine', 'Lemon Zest'],
  ['zeste de clémentine', 'Lemon Zest'],
  ['mandarine',           'Orange'],
  ['pamplemousse',        'Lemon'],
  ['kiwi',                'Kiwi'],
  ['kiwis',               'Kiwi'],
  ['peche',               'Peaches'],
  ['pêche',               'Peaches'],
  ['peches',              'Peaches'],
  ['pêches',              'Peaches'],
  ['prune',               'Blueberries'],
  ['prunes',              'Blueberries'],
  ['abricot',             'Apricot'],
  ['abricots',            'Apricot'],
  ['cerise',              'Cherry'],
  ['cerises',             'Cherry'],
  ['figue',               'Figs'],
  ['figues',              'Figs'],
  ['grenade',             'Pomegranate'],
  ['airelle',             'Cranberry'],
  ['airelles',            'Cranberry'],
  ['cranberry',           'Cranberry'],
  ['cranberries',         'Cranberry'],
  ['mure',                'Blackberries'],
  ['mûre',                'Blackberries'],
  ['mures',               'Blackberries'],
  ['mûres',               'Blackberries'],
  ['papaye',              'Papaya'],
  ['noix de cajou',       'Cashew Nuts'],
  ['noix de pecan',       'Pecans'],
  ['zeste citron',        'Lemon Zest'],
  ['zeste de citron',     'Lemon Zest'],
  ['zeste orange',        'Orange Zest'],
  ['zeste de orange',     'Orange Zest'],
  ['zeste d orange',      'Orange Zest'],
  ['poire',               'Pears'],
  ['poires',              'Pears'],
  ['melon',               'Pineapple'],
  ['pasteque',            'Watermelon'],
  ['pastèque',            'Watermelon'],

  // Légumes oubliés
  ['chou de bruxelles',   'Brussels Sprouts'],
  ['choux de bruxelles',  'Brussels Sprouts'],
  ['navet',               'Turnip'],
  ['navets',              'Turnip'],
  ['panais',              'Turnip'],
  ['patate douce',        'Sweet Potatoes'],
  ['patates douces',      'Sweet Potatoes'],
  ['chou',                'Cabbage'],
  ['chou vert',           'Cabbage'],
  ['chou rouge',          'Red Cabbage'],
  ['chou frise',          'Kale'],
  ['chou frisé',          'Kale'],
  ['roquette',            'Rocket'],
  ['ciboule',             'Spring Onion'],
  ['oignon nouveau',      'Spring Onion'],
  ['oignons nouveaux',    'Spring Onion'],
  ['radis',               'Radish'],
  ['pousses',             'Bean Sprouts'],
  ['germes',              'Bean Sprouts'],
  ['mais doux',           'Sweetcorn'],
  ['maïs doux',           'Sweetcorn'],
  ['potimarron',          'Pumpkin'],
  ['potiron',             'Pumpkin'],
  ['courge butternut',    'Squash'],
  ['butternut',           'Squash'],
  ['courgette',           'Zucchini'],
  ['jalapeño',            'Jalapeno'],
  ['jalapeno',            'Jalapeno'],
  ['piment jalapeño',     'Jalapeno'],
  ['artichaut',           'Artichoke'],
  ['artichauts',          'Artichoke'],
  ['edamame',             'Peas'],
  ['bok choy',            'Kale'],
  ['pak choi',            'Kale'],
  ['cresson',             'Rocket'],
  ['endive',              'Lettuce'],
  ['chicon',              'Lettuce'],
  ['poivron orange',      'Red Pepper'],

  // Herbes fraîches supplémentaires
  ['persil plat',         'Parsley'],
  ['persil frise',        'Parsley'],
  ['coriandre fraiche',   'Coriander'],
  ['cerfeuil',            'Parsley'],
  ['sarriette',           'Thyme'],
  ['marjolaine',          'Oregano'],
  ['verveine',            'Mint'],
  ['citronnelle',         'Lemon Zest'],
  ['combava',             'Lemon Zest'],

  // Épices supplémentaires
  ['epices',              'Paprika'],
  ['herbes de provence',  'Oregano'],
  ['ras el hanout',       'Cumin'],
  ['harissa',             'Red Chilli'],
  ['tabasco',             'Red Chilli'],
  ['miso',                'Soy Sauce'],
  ['tamari',              'Soy Sauce'],
  ['wasabi',              'Garlic Powder'],
  ['piment en poudre',    'Paprika'],
  ['poivre de sichuan',   'Black Pepper'],
  ['baie rose',           'Black Pepper'],
  ['anis etoile',         'Cumin'],
  ['badiane',             'Cumin'],

  // Produits laitiers supplémentaires
  ['lait demi ecreme',    'Milk'],
  ['lait demi-écrémé',    'Milk'],
  ['lait ecreme',         'Milk'],
  ['lait écrémé',         'Milk'],
  ['lait ribot',          'Milk'],
  ['babeurre',            'Milk'],
  ['buttermilk',          'Milk'],
  ['creme chantilly',     'Double Cream'],
  ['creme entiere',       'Double Cream'],
  ['crème entière',       'Double Cream'],
  ['burrata',             'Mozzarella'],
  ['provolone',           'Mozzarella'],
  ['gorgonzola',          'Stilton Cheese'],
  ['saint-nectaire',      'Brie'],
  ['reblochon',           'Brie'],
  ['raclette',            'Gruyere'],
  ['munster',             'Brie'],
  ['tomme',               'Gruyere'],

  // Viandes/poissons supplémentaires
  ['viande',              'Beef'],
  ['rumsteck',            'Beef'],
  ['bavette',             'Beef'],
  ['entrecote',           'Beef'],
  ['côte de boeuf',       'Beef'],
  ['gigot',               'Lamb Mince'],
  ['cote d agneau',       'Lamb Mince'],
  ['magret',              'Chicken Breasts'],
  ['canard',              'Chicken'],
  ['lapin',               'Chicken'],
  ['dinde',               'Chicken'],
  ['veau',                'Pork'],
  ['escalope',            'Chicken Breasts'],
  ['filet mignon',        'Pork'],
  ['roti',                'Beef'],
  ['sardine',             'Salmon'],
  ['sardines',            'Salmon'],
  ['morue',               'Cod'],
  ['cabillaud',           'Cod'],
  ['lieu',                'Cod'],
  ['maquereau',           'Salmon'],
  ['anchois',             'Salmon'],
  ['hareng',              'Salmon'],
  ['bar',                 'Cod'],
  ['daurade',             'Cod'],
  ['sole',                'Cod'],
  ['raie',                'Cod'],
  ['moule',               'Prawns'],
  ['moules',              'Prawns'],
  ['palourde',            'Prawns'],
  ['palourdes',           'Prawns'],
  ['homard',              'Prawns'],
  ['coquille saint-jacques', 'Prawns'],
  ['noix de saint-jacques',  'Prawns'],
  ['calmar',              'Prawns'],
  ['seiche',              'Prawns'],
  ['pieuvre',             'Prawns'],

  // Féculents supplémentaires
  ['boulgour',            'Rice'],
  ['bulgur',              'Rice'],
  ['quinoa',              'Rice'],
  ['epeautre',            'Rice'],
  ['orzo',                'Spaghetti'],
  ['farfalle',            'Spaghetti'],
  ['fusilli',             'Spaghetti'],
  ['rigatoni',            'Spaghetti'],
  ['vermicelle',          'Spaghetti'],
  ['coquillettes',        'Spaghetti'],
  ['macaroni',            'Spaghetti'],
  ['tortellini',          'Spaghetti'],
  ['ravioli',             'Spaghetti'],
  ['croissant',           'Bread'],
  ['brioche',             'Bread'],
  ['pain grille',         'Breadcrumbs'],
  ['chapelure',           'Breadcrumbs'],
  ['baguette',            'Bread'],
  ['naan',                'Bread'],
  ['pita',                'Bread'],

  // Condiments supplémentaires
  ['vinaigre de cidre',   'White Wine Vinegar'],
  ['vinaigre blanc',      'White Wine Vinegar'],
  ['fond de veau',        'Chicken Stock'],
  ['fond de volaille',    'Chicken Stock'],
  ['jus de citron',       'Lemon Juice'],
  ['jus d orange',        'Orange Zest'],
  ['coulis de tomate',    'Tomato Puree'],
  ['sauce bechamel',      'Cream'],
  ['sauce hollandaise',   'Cream'],
  ['tahini',              'Peanuts'],
  ['tamarin',             'Soy Sauce'],
  ['nuoc mam',            'Fish Sauce'],
  ['sauce nuoc mam',      'Fish Sauce'],
  ['pate de curry',       'Curry Powder'],
  ['sauce curry',         'Curry Powder'],

  // Sucré
  ['miel d acacia',       'Honey'],
  ['miel de lavande',     'Honey'],
  ['sucre vanille',       'Vanilla'],
  ['sucre vanillé',       'Vanilla'],
  ['praline',             'Almonds'],
  ['pralinoise',          'Dark Chocolate'],
  ['gianduja',            'Dark Chocolate'],
  ['pâte praliné',        'Almonds'],
  ['speculoos',           'Biscuits'],
  ['oreo',                'Biscuits'],

  // Divers
  ['agar agar',           'Gelatin'],
  ['gelee',               'Gelatin'],
  ['levure de boulanger', 'Baking Powder'],
  ['levure fraiche',      'Baking Powder'],
  ['bicarbonate de soude','Bicarbonate Of Soda'],
  ['sel de guerande',     'Salt'],
  ['fleur de sel',        'Salt'],
  ['vinaigre de framboise','White Wine Vinegar'],
  ['mirin',               'Rice Wine Vinegar'],
  ['saké',                'Rice Wine Vinegar'],
  ['sake',                'Rice Wine Vinegar'],
  ['vin blanc',           'White Wine Vinegar'],
  ['vin rouge',           'Balsamic Vinegar'],
  ['porto',               'Balsamic Vinegar'],
  ['cognac',              'Balsamic Vinegar'],
  ['rhum',                'Vanilla Extract'],
  ['extrait de rhum',     'Vanilla Extract'],
  ['eau de rose',         'Vanilla'],
  ['eau de fleur d oranger', 'Vanilla'],
  ['arôme',               'Vanilla Extract'],
  ['arome',               'Vanilla Extract'],
];

// TheMealDB names that don't exist — map to close equivalents
const FALLBACKS = {
  'Watermelon': 'Pineapple',
};

function download(url, dest) {
  return new Promise((resolve) => {
    const file = createWriteStream(dest);
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
        file.on('error', () => resolve(false));
      } else {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        resolve(false);
      }
    });
    req.on('error', () => { file.close(); try { fs.unlinkSync(dest); } catch {}; resolve(false); });
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  let added = 0;

  for (const [frName, mealdbName] of EXTRA_INGREDIENTS) {
    // Already mapped with a good image?
    if (existing[frName] && existing[frName] !== 'no-image') continue;

    const actualName = FALLBACKS[mealdbName] || mealdbName;
    const slug = slugify(actualName);
    const localPath = `/ingredients/meal-${slug}.png`;
    const destPath = path.join(PUBLIC_DIR, `meal-${slug}.png`);

    // Already downloaded?
    if (fs.existsSync(destPath)) {
      try {
        const stat = fs.statSync(destPath);
        if (stat.size > 10000) {
          existing[frName] = localPath;
          added++;
          continue;
        }
      } catch {}
    }

    // Download
    const url = `https://www.themealdb.com/images/ingredients/${encodeURIComponent(actualName)}.png`;
    process.stdout.write(`  ↓ ${frName} (${actualName})... `);
    const ok = await download(url, destPath);

    if (ok && fs.existsSync(destPath)) {
      try {
        const stat = fs.statSync(destPath);
        if (stat.size > 10000) {
          existing[frName] = localPath;
          added++;
          console.log(`✓`);
        } else {
          try { fs.unlinkSync(destPath); } catch {}
          console.log(`✗ trop petite`);
        }
      } catch { console.log(`✗`); }
    } else {
      console.log(`✗`);
    }
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(existing, null, 2));
  console.log(`\n✅ ${added} nouvelles entrées ajoutées`);
}

main().catch(console.error);
