const fs = require('fs');
const path = require('path');
// fetch() est disponible nativement depuis Node 18 — pas besoin de node-fetch

/**
 * sync-recipes.js — App iPhone
 * Synchronise les recettes WordPress vers src/data/mockData.ts
 * Déclenché par le workflow GitHub Actions lors d'un wp_recipe_updated/published
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const WORDPRESS_PUBLIC_IP = process.env.WP_PUBLIC_IP || '109.221.250.122';
const isCI = process.env.GITHUB_ACTIONS === 'true';

// En CI, on passe toujours par l'IP publique
const ACTIVE_IP = (isCI || process.env.WP_FORCE_PUBLIC === 'true')
    ? WORDPRESS_PUBLIC_IP
    : (process.env.WP_LOCAL_IP || WORDPRESS_PUBLIC_IP);

console.log(`📡 Environnement: ${isCI ? 'GitHub CI' : 'Local'} | IP: ${ACTIVE_IP}`);

const WORDPRESS_API_URL = `http://${ACTIVE_IP}/wordpress/wp-json/wp/v2`;
const MOCK_DATA_PATH    = path.join(__dirname, 'src/data/mockData.ts');
const SYNC_STATS_PATH   = path.join(__dirname, 'src/data/sync-stats.json');

const DELETE_ID = process.argv.find(a => a.startsWith('--delete-id='))?.split('=')[1] || null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function decodeHtmlEntities(text) {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, '-')
        .replace(/&#8230;/g, '...')
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        // Apostrophes et guillemets typographiques Unicode (WordPress Smart Quotes)
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u2026/g, "...")
        .replace(/\u00AB/g, '"').replace(/\u00BB/g, '"');
}

function extractRecipeData(post) {
    const cleanContent = post.content.rendered;
    const splitIndex   = cleanContent.indexOf('<div id="mpprecipe-container');

    let rawDescription = splitIndex !== -1 ? cleanContent.substring(0, splitIndex) : cleanContent;
    let pluginContent  = splitIndex !== -1 ? cleanContent.substring(splitIndex) : '';

    // Ingrédients depuis le plugin mpprecipe
    let ingredients = [];
    const ingBlock = pluginContent.match(/<ul[^>]*id=["']mpprecipe-ingredients-list["'][^>]*>([\s\S]*?)<\/ul>/i);
    if (ingBlock) {
        for (const m of ingBlock[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
            const text = m[1].replace(/<[^>]*>/g, '').trim();
            if (text) ingredients.push({ quantity: '', name: decodeHtmlEntities(text) });
        }
    }

    // Étapes depuis le plugin mpprecipe
    let steps = [];
    const stepBlock = pluginContent.match(/<ol[^>]*id=["']mpprecipe-instructions-list["'][^>]*>([\s\S]*?)<\/ol>/i);
    if (stepBlock) {
        for (const m of stepBlock[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
            const text = m[1].replace(/<[^>]*>/g, '').trim();
            if (text) steps.push(decodeHtmlEntities(text));
        }
    }

    // Fallback étapes si plugin absent
    if (steps.length < 2) {
        let txt = rawDescription
            .replace(/<div[^>]*>|<\/div>|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, ' ')
            .split(/<img[^>]*>|<hr[^>]*>|<p[^>]*>|<\/p>|<br\s*\/?>/i)
            .map(b => decodeHtmlEntities(b.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()))
            .filter(s => s.length > 20 && !s.toLowerCase().includes('save recipe'));
        if (txt.length >= 2) steps = txt;
    }

    // Métadonnées
    const prepTime   = pluginContent.match(/Préparation :<\/strong>\s*(\d+)/i)?.[1];
    const cookTime   = pluginContent.match(/Cuisson :<\/strong>\s*(\d+)/i)?.[1];
    const servings   = pluginContent.match(/Parts :<\/strong>\s*(\d+)/i)?.[1];
    const difficulty = pluginContent.match(/Difficulté :<\/strong>\s*(.*?)</i)?.[1];

    // Embed TikTok
    let videoHtml = '';
    const tiktokMatch = cleanContent.match(/<blockquote[^>]*tiktok-embed[\s\S]*?<\/blockquote>/i);
    if (tiktokMatch) {
        videoHtml = tiktokMatch[0] + '<script async src="https://www.tiktok.com/embed.js"></script>';
    }

    const description = decodeHtmlEntities(
        rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    ).substring(0, 250);

    // Tags et pays
    const tags = post._embedded?.['wp:term']?.[1]?.map(t => t.name) || [];

    // Catégorie
    const titleLower = decodeHtmlEntities(post.title.rendered).toLowerCase();
    const tagsLower  = tags.map(t => t.toLowerCase());

    let category = 'plats';
    if (tagsLower.some(t => ['glaces', 'sorbet'].includes(t))) category = 'glaces';
    else if (tagsLower.some(t => ['boissons', 'cocktail'].includes(t))) category = 'boissons';
    else if (tagsLower.some(t => ['apéro', 'apéritifs', 'aperitifs'].includes(t))) category = 'aperitifs';
    else if (tagsLower.includes('entrées')) category = 'entrees';
    else if (tagsLower.includes('plats')) category = 'plats';
    else if (tagsLower.includes('desserts')) category = 'desserts';
    else if (tagsLower.includes('pâtisserie')) category = 'patisserie';
    else if (titleLower.includes('glace') || titleLower.includes('sorbet')) category = 'glaces';
    else if (titleLower.includes('cocktail') || titleLower.includes('boisson')) category = 'boissons';
    else if (['gâteau', 'cake', 'tarte', 'cookie', 'tiramisu', 'mousse', 'chocolat'].some(k => titleLower.includes(k))) category = 'desserts';

    // Image via proxy pour éviter les problèmes CORS/SSL
    const rawImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const image = rawImageUrl
        ? `/api/image-proxy?url=${encodeURIComponent(rawImageUrl.replace('192.168.1.200', WORDPRESS_PUBLIC_IP))}&v=${new Date(post.modified).getTime()}`
        : '/images/recipe-placeholder.jpg';

    return {
        id:          String(post.id),
        title:       decodeHtmlEntities(post.title.rendered),
        description: description,
        image:       image,
        category:    category,
        difficulty:  difficulty?.toLowerCase().trim() || 'moyen',
        prepTime:    parseInt(prepTime || '15'),
        cookTime:    parseInt(cookTime || '30'),
        servings:    parseInt(servings || '4'),
        videoHtml:   videoHtml,
        ingredients: ingredients.length > 0 ? ingredients : [{ quantity: '', name: 'Ingrédients détaillés dans la vidéo' }],
        steps:       steps.length  > 0 ? steps : ['Suivre les instructions dans la vidéo'],
        tags:        tags,
        isFeatured:  post.sticky || false,
        isFavorite:  false,
        address:     ''
    };
}

// ── Sync principale ────────────────────────────────────────────────────────────
async function syncRecipes() {
    console.log('🚀 Démarrage synchronisation WordPress → App iPhone...');

    let allPosts = [];
    let page = 1;
    let hasMore = true;

    try {
        while (hasMore) {
            const url = `${WORDPRESS_API_URL}/posts?per_page=100&page=${page}&status=publish&_embed&orderby=modified&nocache=${Date.now()}`;
            console.log(`📡 Connexion page ${page}...`);

            const res = await fetch(url);
            if (!res.ok) {
                if (res.status === 400 && page > 1) { hasMore = false; break; }
                throw new Error(`HTTP ${res.status}`);
            }

            const posts = await res.json();
            if (posts.length === 0) { hasMore = false; break; }

            console.log(`   📥 ${posts.length} recettes reçues...`);
            for (const post of posts) {
                // Supprimer la recette si elle est marquée pour suppression
                if (DELETE_ID && String(post.id) === String(DELETE_ID)) {
                    console.log(`   🗑️  Recette ${DELETE_ID} exclue (supprimée depuis WP)`);
                    continue;
                }
                allPosts.push(extractRecipeData(post));
            }

            if (posts.length < 100) hasMore = false;
            else page++;
        }

        // Génération du fichier mockData.ts
        const content = `import { Recipe } from '../types';

/**
 * Recettes synchronisées depuis WordPress — App iPhone
 * Dernière mise à jour: ${new Date().toLocaleString('fr-FR')}
 * Total: ${allPosts.length} recettes
 */
export const exportSyncId = "${Date.now()}";
export const mockRecipes: Recipe[] = ${JSON.stringify(allPosts, null, 4)};
`;
        fs.writeFileSync(MOCK_DATA_PATH, content);

        // Stats
        fs.writeFileSync(SYNC_STATS_PATH, JSON.stringify({
            lastSync:     new Date().toISOString(),
            totalRecipes: allPosts.length,
            trigger:      process.env.GITHUB_EVENT_NAME || 'local',
            mode:         process.argv.includes('--full') ? 'full' : 'recent',
            status:       'success',
            ts:           Math.floor(Date.now() / 1000)
        }, null, 2));

        console.log(`\n✅ App iPhone synchronisée ! ${allPosts.length} recettes.`);

    } catch (err) {
        console.error('❌ Erreur sync:', err.message);
        process.exit(1);
    }
}

syncRecipes();
