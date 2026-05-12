import marmitonIngredients from '../data/marmiton-ingredients.json';
import ingredientCache from '../data/ingredient-cache.json';
import picNicIngredients from '../data/pic-nic-ingredients.json';

/**
 * Nettoie le nom d'un ingrédient pour la recherche
 */
export function cleanIngredientName(name: string): string {
    if (!name) return '';

    let cleaned = name
        .toLowerCase()
        .replace(/\n/g, ' ')
        // Supprime l'émoji au début
        .replace(/^[ -~]*[\uD83C-􏰀-\uDFFF️]+\s*/, '')
        // Supprime les articles
        .replace(/^(?:les?|la|l['’']|d['’']|des|du|au|une?)\s*/i, '')
        // Supprime les quantités
        .replace(/^(?:\d+[\s,.]*[\d\/-]*|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s*(?:cuillères?\s*(?:à\s*café|à\s*soupe)?|cuil\.?\s*(?:à\s*café|à\s*soupe)?|c\.\s*à\s*(?:soupe|café)|cas|cac|c\.a\.c|c\.à\.s|c\.à\.c|pincées?|poignées?|tablettes?|morceaux?|tranches?|gousses?|conserves?|sachets?|briques?|verres?|filets?|filet|blancs?|blanc|jaunes?|jaune|bottes?|tasses?|cuil|cubes?|pots?|boîtes?|boite|grammes?|millilitres?|centilitres?|kilogrammes?|grosses?|petites?|moyennes?|pièces?|mini|belles?|g|cl|ml|kg|jus|zeste|zestes|vanille)\s*(?:de\s+|d['’']|of\s+|du\s+|des\s+)?\s*/i, '')
        .replace(/^(?:de\s+|d['’']|du\s+|des\s+|le\s+|la\s+|l['’']|un\s+|une\s+|au\s+|le\s+jus\s+de\s+|les\s+jus\s+de\s+|le\s+zeste\s+de\s+|les\s+zestes\s+de\s+)/i, '')
        .split(' (')[0]
        .split(',')[0]
        .replace(/\*/g, '')
        .trim();

    return cleaned;
}

/**
 * Traduit un nom d'ingrédient FR/EN vers le format Spoonacular
 * (uniquement pour les ingrédients qu'on sait être dispos sur leur CDN)
 */
const FR_TO_EN: Record<string, string> = {
    // Œufs et laitages
    'oeuf': 'egg',
    'oeufs': 'egg',
    'egg': 'egg',
    'eggs': 'egg',
    'jaune': 'egg-yolk',
    'jaunes': 'egg-yolk',
    'jaune d oeuf': 'egg-yolk',
    'jaunes d oeufs': 'egg-yolk',
    'egg yolk': 'egg-yolk',
    'egg yolks': 'egg-yolk',
    'blanc d oeuf': 'egg-white',
    'lait': 'milk',
    'milk': 'milk',
    'beurre': 'butter',
    'butter': 'butter',
    'creme': 'whipping-cream',
    'cream': 'whipping-cream',
    'whipped cream': 'whipping-cream',
    'whipping cream': 'whipping-cream',
    'yaourt': 'yogurt',
    'yogurt': 'yogurt',
    // Farines / Sucres
    'farine': 'flour',
    'flour': 'flour',
    'cake flour': 'flour',
    'sucre': 'sugar',
    'sugar': 'sugar',
    'cassonade': 'light-brown-sugar',
    'sucre roux': 'light-brown-sugar',
    'levure': 'yeast',
    'yeast': 'yeast',
    // Huiles
    'huile': 'olive-oil',
    'oil': 'olive-oil',
    'vegetable oil': 'olive-oil',
    'huile d olive': 'olive-oil',
    'olive oil': 'olive-oil',
    // Aromates / Épices
    'vanille': 'vanilla',
    'vanilla': 'vanilla',
    'vanilla extract': 'vanilla',
    'cannelle': 'cinnamon',
    'cinnamon': 'cinnamon',
    'paprika': 'paprika',
    'cumin': 'cumin',
    'curry': 'curry-powder',
    'gingembre': 'ginger',
    'ginger': 'ginger',
    'sel': 'salt',
    'salt': 'salt',
    'poivre': 'pepper',
    'pepper': 'pepper',
    // Herbes
    'persil': 'parsley',
    'parsley': 'parsley',
    'basilic': 'basil',
    'basil': 'basil',
    'ciboulette': 'chives',
    'chives': 'chives',
    'menthe': 'mint',
    'mint': 'mint',
    'origan': 'oregano',
    'oregano': 'oregano',
    'thym': 'thyme',
    'thyme': 'thyme',
    'romarin': 'rosemary',
    'rosemary': 'rosemary',
    'aneth': 'dill',
    'dill': 'dill',
    // Fruits
    'fraise': 'strawberries',
    'fraises': 'strawberries',
    'strawberry': 'strawberries',
    'strawberries': 'strawberries',
    'strawberry cubes': 'strawberries',
    'myrtille': 'blueberries',
    'myrtilles': 'blueberries',
    'blueberry': 'blueberries',
    'blueberries': 'blueberries',
    'framboise': 'raspberries',
    'framboises': 'raspberries',
    'raspberry': 'raspberries',
    'raspberries': 'raspberries',
    'citron': 'lemon',
    'lemon': 'lemon',
    'orange': 'orange',
    'pomme': 'apple',
    'apple': 'apple',
    'banane': 'banana',
    'banana': 'banana',
    'mangue': 'mango',
    'mango': 'mango',
    // Légumes
    'tomate': 'tomato',
    'tomates': 'tomato',
    'tomato': 'tomato',
    'tomatoes': 'tomato',
    'tomate cerise': 'cherry-tomatoes',
    'cherry tomato': 'cherry-tomatoes',
    'oignon': 'onion',
    'oignons': 'onion',
    'onion': 'onion',
    'onions': 'onion',
    'ail': 'garlic',
    'garlic': 'garlic',
    'echalote': 'shallots',
    'shallots': 'shallots',
    'carotte': 'carrots',
    'carottes': 'carrots',
    'carrots': 'carrots',
    'carrot': 'carrots',
    'pomme de terre': 'potatoes',
    'pommes de terre': 'potatoes',
    'potato': 'potatoes',
    'potatoes': 'potatoes',
    'courgette': 'zucchini',
    'zucchini': 'zucchini',
    'aubergine': 'eggplant',
    'eggplant': 'eggplant',
    'poivron': 'red-bell-pepper',
    'concombre': 'cucumber',
    'cucumber': 'cucumber',
    'salade': 'lettuce',
    'lettuce': 'lettuce',
    'epinard': 'spinach',
    'spinach': 'spinach',
    'champignon': 'mushrooms',
    'champignons': 'mushrooms',
    'mushroom': 'mushrooms',
    'mushrooms': 'mushrooms',
    'mais': 'corn',
    'corn': 'corn',
    'pois': 'peas',
    'peas': 'peas',
    // Protéines
    'poulet': 'chicken-breasts',
    'chicken': 'chicken-breasts',
    'boeuf': 'beef',
    'beef': 'beef',
    'rumsteck': 'beef',
    'bavette': 'beef',
    'porc': 'pork',
    'pork': 'pork',
    'jambon': 'ham',
    'ham': 'ham',
    'saumon': 'salmon',
    'salmon': 'salmon',
    'thon': 'tuna',
    'tuna': 'tuna',
    'lardon': 'bacon',
    'lardons': 'bacon',
    'bacon': 'bacon',
    // Fromages (Spoonacular en a beaucoup)
    'fromage': 'cheese',
    'cheese': 'cheese',
    'parmesan': 'parmesan',
    'gruyere': 'gruyere',
    'comte': 'gruyere',
    'mozzarella': 'mozzarella',
    'feta': 'feta',
    'cheddar': 'cheddar-cheese',
    'roquefort': 'blue-cheese',
    'camembert': 'camembert',
    'brie': 'brie',
    // Féculents et autres
    'riz': 'rice',
    'rice': 'rice',
    'pates': 'pasta',
    'pasta': 'pasta',
    'pain': 'bread',
    'bread': 'bread',
    // Condiments
    'sauce soja': 'soy-sauce',
    'soy sauce': 'soy-sauce',
    'sauce tomate': 'tomato-sauce',
    'tomato sauce': 'tomato-sauce',
    'vinaigre': 'vinegar',
    'vinegar': 'vinegar',
    'vinaigre de riz': 'rice-vinegar',
    'rice vinegar': 'rice-vinegar',
    'moutarde': 'mustard',
    'mustard': 'mustard',
    'mayonnaise': 'mayonnaise',
    'ketchup': 'ketchup',
    'miel': 'honey',
    'honey': 'honey',
    'sriracha': 'sriracha',
    'olive': 'olives',
    'olives': 'olives',
    // Sucré
    'chocolat': 'milk-chocolate',
    'chocolate': 'milk-chocolate',
    'chocolat noir': 'dark-chocolate',
    'dark chocolate': 'dark-chocolate',
    // Fruits secs
    'noix': 'walnuts',
    'walnuts': 'walnuts',
    'amande': 'almonds',
    'almonds': 'almonds',
    'noisette': 'hazelnuts',
    'hazelnuts': 'hazelnuts',
    'cacahuete': 'peanuts',
    'peanuts': 'peanuts',
    'pistache': 'pistachios',
    'pistaches': 'pistachios',
    'pistachios': 'pistachios',
    // Légumineuses
    'lentille': 'lentils',
    'lentilles': 'lentils',
    'lentils': 'lentils',
    'haricot': 'beans',
    'beans': 'beans',
    'pois chiche': 'chickpeas',
    'chickpeas': 'chickpeas',
    // Divers
    'piment': 'chili-pepper',
    'chili': 'chili-pepper',
    'coco': 'coconut',
    'coconut': 'coconut',
    'lait de coco': 'coconut-milk',
    'coconut milk': 'coconut-milk',
    'red food coloring': 'food-coloring',
    'colorant': 'food-coloring',
    'colorant alimentaire': 'food-coloring',
    'food coloring': 'food-coloring'
};

/**
 * Récupère le meilleur visuel pour un ingrédient.
 * Stratégie :
 *   1. Image LOCALE (/ingredients/*) — qualité garantie
 *   2. Spoonacular CDN avec traduction EN explicite (style Pic Nic, fond blanc)
 *   3. null → l'UI affichera un emoji intelligent
 *
 * Important : on n'accepte PAS les URLs externes (afcdn.com etc.) car elles
 * pointent souvent sur des images cassées ou peu lisibles.
 */
export function getIngredientVisual(name: string): string | null {
    if (!name) return null;

    const cleanName = cleanIngredientName(name);
    if (!cleanName) return null;

    const allDict = {
        ...(ingredientCache as Record<string, string>),
        ...(marmitonIngredients as Record<string, string>),
        ...(picNicIngredients as Record<string, string>)
    };

    const INGREDIENT_ALIASES: Record<string, string> = {
        'sauce salade': 'vinaigrette',
        'chips de pomme de terre': 'pomme de terre',
        'fleur de sel': 'sel',
        'gros sel': 'sel',
        'parmesan rape': 'parmesan',
        'gruyere rape': 'gruyere',
        'emmental rape': 'emmental'
    };

    let searchName = cleanName;
    for (const [key, alias] of Object.entries(INGREDIENT_ALIASES)) {
        if (cleanName.includes(key)) {
            searchName = alias;
            break;
        }
    }

    const normalize = (str: string) => str
        .toLowerCase()
        .replace(/œ/g, 'oe')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/['’]/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const normCleanName = normalize(searchName);

    // N'accepte que les URLs locales (fiables)
    const acceptLocal = (url: string | undefined): string | null => {
        if (!url || url === 'no-image') return null;
        if (url.startsWith('/ingredients/')) return url;
        return null;
    };

    // 1. Match exact dans base locale
    const allKeys = Object.keys(allDict);
    for (const key of allKeys) {
        if (normalize(key) === normCleanName) {
            const local = acceptLocal(allDict[key]);
            if (local) return local;
        }
    }

    const quoteHandler = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 2. Match par mot entier dans base locale
    const sortedKeys = allKeys.sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const normKey = normalize(key);
        if (normKey.length < 4) continue;

        try {
            const escapedKey = quoteHandler(normKey);
            const regex = new RegExp(`\\b${escapedKey}s?\\b`, 'i');
            if (regex.test(normCleanName)) {
                const local = acceptLocal(allDict[key]);
                if (local) return local;
            }
        } catch (e) {
            continue;
        }
    }

    // 3. Spoonacular — UNIQUEMENT si traduction explicite connue
    if (FR_TO_EN[normCleanName]) {
        return `https://img.spoonacular.com/ingredients_500x500/${FR_TO_EN[normCleanName]}.png`;
    }

    const words = normCleanName.split(/\s+/).filter(w => w.length >= 4);
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    for (const word of sortedWords) {
        if (FR_TO_EN[word]) {
            return `https://img.spoonacular.com/ingredients_500x500/${FR_TO_EN[word]}.png`;
        }
    }

    // Pas de match fiable → l'UI affichera l'emoji
    return null;
}

/**
 * Traduit (très simplement) un nom d'ingrédient anglais vers le français.
 * On garde les quantités/nombres et on remplace les mots-clés connus.
 * Si rien à traduire, on retourne la chaîne d'origine.
 */
const EN_TO_FR_WORDS: Array<[RegExp, string]> = [
    // Phrases complètes d'abord (plus longues → plus prioritaires)
    [/\bred\s+food\s+coloring\b/gi, 'colorant alimentaire rouge'],
    [/\bfood\s+coloring\b/gi, 'colorant alimentaire'],
    [/\bcake\s+flour\b/gi, 'farine à gâteau'],
    [/\bvegetable\s+oil\b/gi, 'huile végétale'],
    [/\bolive\s+oil\b/gi, "huile d'olive"],
    [/\bvanilla\s+extract\b/gi, 'extrait de vanille'],
    [/\bwhipped\s+cream\b/gi, 'crème fouettée'],
    [/\bwhipping\s+cream\b/gi, 'crème liquide'],
    [/\bheavy\s+cream\b/gi, 'crème épaisse'],
    [/\bsour\s+cream\b/gi, 'crème aigre'],
    [/\bcoconut\s+milk\b/gi, 'lait de coco'],
    [/\bsoy\s+sauce\b/gi, 'sauce soja'],
    [/\btomato\s+sauce\b/gi, 'sauce tomate'],
    [/\brice\s+vinegar\b/gi, 'vinaigre de riz'],
    [/\begg\s+yolks?\b/gi, "jaunes d'œufs"],
    [/\begg\s+whites?\b/gi, "blancs d'œufs"],
    [/\bbrown\s+sugar\b/gi, 'cassonade'],
    [/\bpowdered\s+sugar\b/gi, 'sucre glace'],
    [/\bgranulated\s+sugar\b/gi, 'sucre'],
    [/\bcherry\s+tomatoes?\b/gi, 'tomates cerises'],
    [/\bbell\s+peppers?\b/gi, 'poivron'],
    [/\bchicken\s+breasts?\b/gi, 'blanc de poulet'],
    [/\bground\s+beef\b/gi, 'bœuf haché'],
    [/\bcake\s+pieces?\b/gi, 'morceaux de gâteau'],
    [/\bstrawberry\s+cubes?\b/gi, 'cubes de fraise'],
    [/\bteaspoon\b/gi, 'cuillère à café'],
    [/\btablespoons?\b/gi, 'cuillères à soupe'],
    [/\babout\b/gi, 'environ'],
    [/\bcups?\b/gi, 'tasses'],

    // Mots simples ensuite
    [/\beggs?\b/gi, 'œufs'],
    [/\bmilk\b/gi, 'lait'],
    [/\bsugar\b/gi, 'sucre'],
    [/\bflour\b/gi, 'farine'],
    [/\bbutter\b/gi, 'beurre'],
    [/\bcream\b/gi, 'crème'],
    [/\bcheese\b/gi, 'fromage'],
    [/\bsalt\b/gi, 'sel'],
    [/\bpepper\b/gi, 'poivre'],
    [/\boil\b/gi, 'huile'],
    [/\bgarlic\b/gi, 'ail'],
    [/\bonions?\b/gi, 'oignon'],
    [/\bshallots?\b/gi, 'échalote'],
    [/\btomato(?:es)?\b/gi, 'tomate'],
    [/\bcarrots?\b/gi, 'carotte'],
    [/\bpotato(?:es)?\b/gi, 'pomme de terre'],
    [/\bzucchini\b/gi, 'courgette'],
    [/\beggplants?\b/gi, 'aubergine'],
    [/\bcucumbers?\b/gi, 'concombre'],
    [/\blettuce\b/gi, 'salade'],
    [/\bspinach\b/gi, 'épinards'],
    [/\bmushrooms?\b/gi, 'champignons'],
    [/\bcorn\b/gi, 'maïs'],
    [/\bpeas\b/gi, 'pois'],
    [/\bchicken\b/gi, 'poulet'],
    [/\bbeef\b/gi, 'bœuf'],
    [/\bpork\b/gi, 'porc'],
    [/\bham\b/gi, 'jambon'],
    [/\bsalmon\b/gi, 'saumon'],
    [/\btuna\b/gi, 'thon'],
    [/\bbacon\b/gi, 'lardons'],
    [/\brice\b/gi, 'riz'],
    [/\bpasta\b/gi, 'pâtes'],
    [/\bbread\b/gi, 'pain'],
    [/\byeast\b/gi, 'levure'],
    [/\bvinegar\b/gi, 'vinaigre'],
    [/\bmustard\b/gi, 'moutarde'],
    [/\bhoney\b/gi, 'miel'],
    [/\bolives?\b/gi, 'olives'],
    [/\bchocolate\b/gi, 'chocolat'],
    [/\bvanilla\b/gi, 'vanille'],
    [/\bcinnamon\b/gi, 'cannelle'],
    [/\bginger\b/gi, 'gingembre'],
    [/\bparsley\b/gi, 'persil'],
    [/\bbasil\b/gi, 'basilic'],
    [/\bchives\b/gi, 'ciboulette'],
    [/\bmint\b/gi, 'menthe'],
    [/\boregano\b/gi, 'origan'],
    [/\bthyme\b/gi, 'thym'],
    [/\brosemary\b/gi, 'romarin'],
    [/\bdill\b/gi, 'aneth'],
    [/\bstrawberries\b/gi, 'fraises'],
    [/\bstrawberry\b/gi, 'fraise'],
    [/\bblueberries\b/gi, 'myrtilles'],
    [/\bblueberry\b/gi, 'myrtille'],
    [/\braspberries\b/gi, 'framboises'],
    [/\braspberry\b/gi, 'framboise'],
    [/\blemon\b/gi, 'citron'],
    [/\borange\b/gi, 'orange'],
    [/\bapples?\b/gi, 'pomme'],
    [/\bbananas?\b/gi, 'banane'],
    [/\bmango\b/gi, 'mangue'],
    [/\bwalnuts?\b/gi, 'noix'],
    [/\balmonds?\b/gi, 'amandes'],
    [/\bhazelnuts?\b/gi, 'noisettes'],
    [/\bpeanuts?\b/gi, 'cacahuètes'],
    [/\bpistachios?\b/gi, 'pistaches'],
    [/\blentils\b/gi, 'lentilles'],
    [/\bbeans\b/gi, 'haricots'],
    [/\bchickpeas\b/gi, 'pois chiches'],
    [/\bmascarpone\b/gi, 'mascarpone'],
    [/\bparmesan\b/gi, 'parmesan'],
    [/\bmozzarella\b/gi, 'mozzarella'],
    [/\bfeta\b/gi, 'feta'],
    [/\bgruyere\b/gi, 'gruyère'],
    [/\bcamembert\b/gi, 'camembert'],
    [/\bbrie\b/gi, 'brie'],
    [/\bcake\b/gi, 'gâteau'],
    [/\bcoconut\b/gi, 'noix de coco'],
    [/\bchili\b/gi, 'piment'],
    [/\byogurt\b/gi, 'yaourt']
];

export function translateIngredientName(name: string): string {
    if (!name) return name;
    let result = name;
    for (const [regex, fr] of EN_TO_FR_WORDS) {
        result = result.replace(regex, fr);
    }
    return result;
}

