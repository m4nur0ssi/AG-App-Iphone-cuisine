const fs = require('fs');
const path = require('path');
const https = require('https');

const MOCK_DATA_PATH = path.join(__dirname, '..', 'data', 'mockData.ts');
const CACHE_PATH = path.join(__dirname, '..', 'data', 'ingredient-cache.json');
const MARMITON_JSON_PATH = path.join(__dirname, '..', 'data', 'marmiton-ingredients.json');

// --- Helper Functions from App --- //
function cleanIngredientName(name) {
    if (!name) return '';
    let cleaned = name
        .toLowerCase()
        .replace(/\n/g, ' ')
        .replace(/^[\u0020-\u007E]*[\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]+\s*/, '') // Remove emojis correctly
        .replace(/^(?:les?|la|l['’\u0027]|d['’\u0027]|des|du|au|une?)\s*/i, '')
        .replace(/^(?:\d+[\s,.]*[\d\/-]*|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s*(?:cuillères?\s*(?:à\s*café|à\s*soupe)?|cuil\.?\s*(?:à\s*café|à\s*soupe)?|c\.\s*à\s*(?:soupe|café)|cas|cac|c\.a\.c|c\.à\.s|c\.à\.c|pincées?|poignées?|tablettes?|morceaux?|tranches?|gousses?|conserves?|sachets?|briques?|verres?|filets?|filet|blancs?|blanc|jaunes?|jaune|bottes?|tasses?|cuil|cubes?|pots?|boîtes?|boite|grammes?|millilitres?|centilitres?|kilogrammes?|grosses?|petites?|moyennes?|pièces?|mini|belles?|g|cl|ml|kg|jus|zeste|zestes|vanille)\s*(?:de\s+|d['’\u0027]|of\s+|du\s+|des\s+)?\s*/i, '')
        .replace(/^(?:de\s+|d['’\u0027]|du\s+|des\s+|le\s+|la\s+|l['’\u0027]|un\s+|une\s+|au\s+|le\s+jus\s+de\s+|les\s+jus\s+de\s+|le\s+zeste\s+de\s+|les\s+zestes\s+de\s+)/i, '')
        .split(' (')[0]
        .split(',')[0]
        .replace(/\*/g, '')
        .trim();
    return cleaned;
}

const HTTP_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
};

async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, HTTP_OPTIONS, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = 'https://www.marmiton.org' + redirectUrl;
                }
                return resolve(fetchHtml(redirectUrl));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode} for ${url}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function findMarmitonImageUrl(ingredientName) {
    try {
        console.log(`\n🔍 Recherche Marmiton : "${ingredientName}"...`);
        const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(ingredientName)}`;
        const searchHtml = await fetchHtml(searchUrl);
        
        const recipeMatch = searchHtml.match(/href="(\/recettes\/recette_[^"]+\.aspx)"/);
        if (!recipeMatch) {
            console.log(`  ❌ Aucune recette trouvée pour ${ingredientName}`);
            return null;
        }
        
        const recipeUrl = `https://www.marmiton.org${recipeMatch[1]}`;
        const recipeHtml = await fetchHtml(recipeUrl);
        
        const blocks = recipeHtml.split('card-ingredient-title');
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const nameMatch = block.match(/data-ingredientNameSingular="([^"]+)"/i);
            if (nameMatch) {
                const marmitonName = nameMatch[1].toLowerCase();
                
                if (marmitonName.includes(ingredientName) || ingredientName.includes(marmitonName)) {
                    let imgMatch = block.match(/data-srcset="([^ ]+)/) || block.match(/src="([^"]+afcdn\.com[^"]+)"/);
                    if (imgMatch) {
                        const url = imgMatch[1].split(' ')[0];
                        if (url.includes('afcdn.com/recipe')) {
                            console.log(`  ✅ Trouvé ! (${marmitonName}) -> ${url}`);
                            return url;
                        }
                    }
                }
            }
        }
        console.log(`  ❌ L'ingrédient n'a pas été trouvé avec une image sur la page de recette.`);
        return null;
    } catch (e) {
        console.error(`  ⚠️ Erreur lors de la recherche de ${ingredientName}: ${e.message}`);
        return null;
    }
}

async function run() {
    let cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : {};
    let marmitonCache = fs.existsSync(MARMITON_JSON_PATH) ? JSON.parse(fs.readFileSync(MARMITON_JSON_PATH, 'utf8')) : {};
    
    // Combine dictionaries to check existence
    const fullDict = { ...marmitonCache, ...cache };

    console.log("Lecture de mockData.ts...");
    let mockData = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const match = mockData.match(/export const mockRecipes: Recipe\[\] = (\[(.*)\]);/s);
    if (!match) {
        console.error("Impossible de trouver mockRecipes array.");
        return;
    }

    let recipesStr = match[1];
    let recipes;
    try {
        recipes = eval(`(${recipesStr})`);
    } catch (err) {
        console.error("Failed to eval recipes string.", err);
        return;
    }

    let allExtracted = new Set();
    recipes.forEach(r => {
        if (r.ingredients) {
            r.ingredients.forEach(i => {
                const cleanName = cleanIngredientName(i.name);
                if (cleanName && cleanName.length >= 2) {
                    allExtracted.add(cleanName);
                }
            });
        }
    });

    console.log(`${allExtracted.size} ingrédients uniques extraits des recettes.`);

    let addedToCache = 0;
    const normalize = (str) => str.toLowerCase().replace(/œ/g, 'oe').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Prepare full dictionary keys for checking inclusion
    const sortedKeys = Object.keys(fullDict).sort((a, b) => b.length - a.length);

    for (let cleanName of allExtracted) {
        const normCleanName = normalize(cleanName);
        let found = false;

        // Exactly identical?
        if (fullDict[cleanName]) {
            found = true;
            continue;
        }

        // Search by word boundary inclusion
        const quoteHandler = (str) => str.replace(/[.*+?^$\{()|[\\]\\\\]/g, '\\\\$&');
        for (const key of sortedKeys) {
            const normKey = normalize(key);
            if (normKey.length < 3) continue;
            try {
                const escapedKey = quoteHandler(normKey);
                const regex = new RegExp(`\\\\b${escapedKey}s?\\\\b`, 'i');
                if (regex.test(normCleanName)) {
                    found = true;
                    break;
                }
            } catch (e) { }
        }

        if (!found) {
            // Check if already in cache with explicit null or valid val
            if (!(cleanName in cache)) {
                cache[cleanName] = null; // Mark to be fetched
                addedToCache++;
            }
        }
    }

    console.log(`Ajout de ${addedToCache} nouveaux ingrédients dans le cache.`);
    
    // Now fetch any item in cache that is null or empty.
    const keys = Object.keys(cache);
    let updatedCount = 0;

    for (const rawKey of keys) {
        const currentUrl = cache[rawKey];
        if (currentUrl && currentUrl.startsWith('/ingredients/')) {
            continue;
        }

        // Fetch if null or wikipedia
        if (!currentUrl || currentUrl === 'no-image' || currentUrl.includes('wikipedia')) {
            const marmitonUrl = await findMarmitonImageUrl(rawKey);
            if (marmitonUrl) {
                cache[rawKey] = marmitonUrl;
                updatedCount++;
                fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
            } else {
                // strict fail, try first word
                const firstWord = rawKey.split(' ')[0];
                if (firstWord !== rawKey && firstWord.length > 2) {
                    const splitUrl = await findMarmitonImageUrl(firstWord);
                    if (splitUrl) {
                        cache[rawKey] = splitUrl;
                        updatedCount++;
                        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
                    } else {
                        // Mark as handled but no image found (so it doesn't loop forever manually)
                        cache[rawKey] = 'no-image';
                        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
                    }
                } else {
                    cache[rawKey] = 'no-image';
                    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
                }
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    console.log(`\\n🎉 Terminé ! ${updatedCount} images ajoutées/remplacées par les officiels Marmiton.`);
}

run();
