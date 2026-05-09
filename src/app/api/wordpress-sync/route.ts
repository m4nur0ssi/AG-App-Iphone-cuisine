import { NextResponse } from 'next/server';

/**
 * Endpoint pour la synchronisation automatique depuis WordPress
 * Utilisé par le plugin WP Webhooks (ou équivalent)
 * 
 * URL à configurer dans WP Webhooks:
 * https://[votre-app].vercel.app/api/wordpress-sync?secret=2TlsVemp
 * 
 * Déclenché sur : création, modification, suppression de recettes sur WordPress
 */
export async function POST(request: Request) {
    try {
        console.log('🔄 Webhook WordPress reçu...');
        
        const { searchParams } = new URL(request.url);
        const envSecret = process.env.WEBHOOK_SECRET || '2TlsVemp';

        // Support du secret dans query string, body JSON, ou header X-WP-Secret
        let secret = searchParams.get('secret') || '';
        
        // Tenter de lire le body pour trouver le secret dedans
        let body: any = {};
        try {
            const text = await request.text();
            if (text) {
                try { body = JSON.parse(text); } catch {
                    // Body non-JSON (form-urlencoded, text brut...)
                    // Chercher secret=xxx dans le body texte
                    const bodySecretMatch = text.match(/secret=([^&\s]+)/);
                    if (bodySecretMatch) secret = bodySecretMatch[1];
                }
            }
        } catch (_) {}

        // Secret peut aussi être dans le body JSON
        if (!secret && body.secret) secret = body.secret;
        
        // Ou dans le header X-WP-Secret
        const headerSecret = request.headers.get('x-wp-secret') || request.headers.get('x-webhook-secret') || '';
        if (!secret && headerSecret) secret = headerSecret;

        // Si aucun secret fourni du tout → on bloque
        if (!secret) {
            console.error('❌ Webhook WordPress : Aucun secret fourni');
            return NextResponse.json({ 
                error: 'Secret manquant. Ajoutez ?secret=VOTRE_SECRET à l\'URL du webhook.' 
            }, { status: 401 });
        }

        if (secret !== envSecret) {
            console.error(`❌ Webhook WordPress : Secret invalide (reçu: "${secret}")`);
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const githubToken = process.env.GITHUB_PAT;
        if (!githubToken) {
            console.error('❌ GITHUB_PAT non configuré dans les variables Vercel');
            return NextResponse.json({ error: 'GITHUB_PAT non configuré. Ajoutez-le dans les variables d\'environnement Vercel.' }, { status: 500 });
        }

        // Cibles de la synchronisation : les 2 repos qui hébergent l'app iPhone et le site web public.
        // Chacun écoute des `repository_dispatch` events (wp_recipe_published / wp_recipe_updated /
        // wp_recipe_deleted / wp_full_sync) déclarés dans leurs workflows .github/workflows/*.yml.
        const targetRepos = [
            'm4nur0ssi/AG-App-Iphone-cuisine',
            'm4nur0ssi/Ag---Projet-site-cuisine',
        ];

        // Déterminer le type d'action WordPress (publier, modifier, supprimer)
        const rawAction = (body.action || body.hook || body.trigger || 'wordpress').toString();
        const isDeletion = rawAction.includes('delete') || rawAction.includes('trash') || rawAction.includes('remove');
        const isUpdate   = rawAction.includes('update') || rawAction.includes('edit') || rawAction.includes('modif');

        // Mapper l'action WP vers un event_type de repository_dispatch reconnu par les workflows
        const eventType = isDeletion
            ? 'wp_recipe_deleted'
            : isUpdate
                ? 'wp_recipe_updated'
                : 'wp_recipe_published';

        // --- EXTRACTION DE L'ID DU POST + TITRE ---
        let postId = '';
        if (body.post && (body.post.ID || body.post.id)) {
            postId = (body.post.ID || body.post.id).toString();
        } else if (body.post_id || body.ID || body.id) {
            postId = (body.post_id || body.ID || body.id).toString();
        }
        const postTitle = (body.post && body.post.post_title) || body.post_title || '';

        const triggerSource = `${rawAction}${postId ? `_${postId}` : ''}`;
        console.log(`🚀 Webhook WP: Action=${rawAction} → event=${eventType}, ID=${postId}, titre="${postTitle}"`);

        // Le workflow consomme `client_payload.delete_id` et `client_payload.post_title`
        const clientPayload: Record<string, string> = {
            post_id: postId,
            post_title: postTitle,
            delete_id: isDeletion ? postId : '',
            trigger_source: triggerSource,
        };

        // Dispatch en parallèle vers les 2 repos cibles
        const dispatchResults = await Promise.all(targetRepos.map(async (repo) => {
            try {
                const r = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${githubToken}`,
                        'Content-Type': 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                    body: JSON.stringify({
                        event_type: eventType,
                        client_payload: clientPayload,
                    }),
                });

                if (!r.ok) {
                    const errorText = await r.text();
                    console.error(`❌ ${repo} → ${r.status}: ${errorText}`);
                    return { repo, ok: false, status: r.status, error: errorText };
                }
                console.log(`✅ ${repo} → repository_dispatch (${eventType}) OK`);
                return { repo, ok: true, status: r.status };
            } catch (e: any) {
                console.error(`❌ ${repo} → ${e.message}`);
                return { repo, ok: false, error: e.message };
            }
        }));

        const allOk = dispatchResults.every(r => r.ok);
        const anyOk = dispatchResults.some(r => r.ok);

        if (!anyOk) {
            // Échec total → renvoyer une vraie erreur
            throw new Error(`Aucun dispatch n'a abouti : ${JSON.stringify(dispatchResults)}`);
        }

        return NextResponse.json({
            success: allOk,
            partial: !allOk,
            message: allOk
                ? 'Pipeline de synchronisation lancée sur les 2 repos ! ✨'
                : 'Pipeline lancée sur certains repos seulement (voir details).',
            details: 'Les changements seront visibles dans 2-3 minutes.',
            event_type: eventType,
            trigger: triggerSource,
            dispatched: dispatchResults,
        });

    } catch (error: any) {
        console.error(`❌ Erreur Webhook WordPress: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET : test de connectivité et instructions
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const envSecret = process.env.WEBHOOK_SECRET || '2TlsVemp';
    
    const isAuthenticated = secret === envSecret;
    
    return NextResponse.json({ 
        status: 'ready',
        message: isAuthenticated 
            ? '✅ Endpoint prêt. Configurez ce hook dans WP Webhooks.'
            : '⚠️ Endpoint accessible, mais secret manquant ou invalide.',
        instructions: {
            url: `${new URL(request.url).origin}/api/wordpress-sync?secret=${envSecret}`,
            method: 'POST',
            events: ['post_published', 'post_updated', 'post_deleted', 'attachment_updated'],
            note: 'Ajoute cette URL dans WP Webhooks → Send Data sur chaque événement souhaité'
        }
    });
}
