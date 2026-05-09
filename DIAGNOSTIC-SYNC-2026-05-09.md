# 🔧 Diagnostic synchro WordPress → App iPhone — 9 mai 2026

## 🎯 Symptôme
Recette publiée sur WordPress hier soir (8 mai). Visible sur le site WP, **absente** de l'app iPhone et du site web généré.

## 🔬 Cause confirmée
**Aucun job GitHub Actions de synchro n'a tourné depuis le 7 mai 11:47 UTC.**

Preuves trouvées dans le repo local :

| Indice | Valeur |
|---|---|
| Dernier commit `🔄 iPhone Sync` | `5cf86e8` — 7 mai 11:47 UTC |
| `src/data/sync-stats.json` → lastSync | `2026-05-07T11:47:14.579Z` |
| `totalRecipes` figé à | 217 |
| Conflit de merge sur `mockData.ts` résolu manuellement | 8 mai 12:25 |
| Conflit de merge sur `sync-stats.json` résolu manuellement | 8 mai 22:55 |

Les 2 conflits venaient de `Stashed changes` locaux (sync local antérieur non commité) **vs** upstream — et leur résolution n'a **pas** déclenché de nouveau sync. Le workflow GitHub n'a tout simplement pas été appelé entre le 7 et maintenant.

## ⛓️ Chaîne de synchro (rappel)
```
WP (NAS 192.168.1.200/109.221.250.122)
  └─[plugin wp-auto-sync-plugin.php]→ POST https://lesrecettesmagiques.vercel.app/api/wordpress-sync
       └─[Vercel "site cuisine"]→ repository_dispatch (wp_full_sync) → repo iPhone
            └─[GitHub Actions auto-recipe.yml] → node sync-recipes.js → commit + push
                 └─[Vercel iPhone] → rebuild → app à jour
```

Tous les sync historiques (`🔄 iPhone Sync: wp_full_sync - DATE`) ont été déclenchés par `repository_dispatch` action `wp_full_sync` → c'est donc le projet **site cuisine** qui dispatche, pas le endpoint Vercel iPhone.

## 🚑 Réparation immédiate (la nouvelle recette d'hier)

### Option A — Forcer le workflow depuis GitHub (le plus rapide)
1. Ouvrir : https://github.com/m4nur0ssi/magie-cuisine-tiktok/actions/workflows/auto-recipe.yml
2. Bouton vert **Run workflow** (en haut à droite)
3. Mode = `full` (pour rattraper toutes les recettes manquantes), Delete ID = vide
4. Lancer → en 2-3 min un commit `🔄 iPhone Sync: full - …` apparaît, Vercel iPhone rebuild

### Option B — Sync local depuis ton Mac
Double-clic sur `MAGIE_DEPLOIEMENT.command` → choix **2 (MODE GRIMOIRE)** pour resynchroniser la totalité depuis le NAS, puis push manuel.

## 🧰 Cause racine — à investiguer après

Hypothèses par ordre de probabilité (à vérifier dans cet ordre) :

1. **Workflow `wp-sync.yml` du repo `site cuisine` désactivé**
   GitHub désactive auto un workflow après 60 j d'inactivité OU plusieurs échecs.
   → Vérifier sur https://github.com/m4nu*?/site-cuisine/actions — y a-t-il un bandeau "This scheduled workflow was disabled" ?

2. **`GITHUB_PAT` expiré sur Vercel "site cuisine"**
   Les fine-grained PATs expirent (souvent 30/90 j). Si expiré → `wordpress-sync` répond 500.
   → Vercel → projet site-cuisine → Settings → Environment Variables → `GITHUB_PAT` → vérifier la date d'expiration côté GitHub Settings → Personal access tokens.

3. **Plugin WP en cooldown bloqué ou désactivé**
   Le transient `recettes_last_sync` peut rester coincé. Le plugin peut aussi avoir été désactivé après une maj WP.
   → WP Admin → Extensions → vérifier que "Recettes Magiques - Auto Sync" est actif.
   → Vider le transient via WP-CLI : `wp transient delete recettes_last_sync` (ou simplement republier la recette d'hier en mode édition).

4. **Bug latent : inputs non déclarés dans `wordpress-sync/route.ts`**
   Ce endpoint envoie `inputs: { video_url, country, trigger_source, delete_id }` mais la déclaration `workflow_dispatch.inputs` ne connaît que `mode` et `delete_id`. GitHub renvoie 422 dans ce cas.
   → Pas la cause des sync passés (qui passaient par `repository_dispatch`), mais à corriger pour que ce endpoint marche aussi en fallback.

## 📌 À faire ensuite

- [ ] Lancer Option A (rattraper la recette d'hier)
- [ ] Vérifier le statut du workflow `wp-sync.yml` côté repo site cuisine
- [ ] Vérifier l'expiration du `GITHUB_PAT` sur Vercel site cuisine
- [ ] Confirmer que le plugin WP est actif sur le NAS
- [ ] Optionnel : nettoyer `wordpress-sync/route.ts` (retirer `video_url`, `country`, `trigger_source` ou les déclarer dans le workflow)

## 📎 Fichiers consultés
- `.github/workflows/auto-recipe.yml`
- `sync-recipes.js`
- `src/data/sync-stats.json`
- `src/app/api/wordpress-sync/route.ts`
- `wp-auto-sync-plugin.php`
- `build.log`, `server.log`, `tiktok-bot/bot_server_v3.log`
- `git log`, `git reflog`
