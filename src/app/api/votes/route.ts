import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VOTES_FILE = path.join(process.cwd(), 'src/data/votes.json');

// Assurer que le fichier existe
function ensureVotesFile() {
    if (!fs.existsSync(VOTES_FILE)) {
        const dir = path.dirname(VOTES_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(VOTES_FILE, JSON.stringify({}));
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    ensureVotesFile();
    const votesData = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'));

    if (recipeId) {
        return NextResponse.json({ votes: votesData[recipeId] || 0 });
    }

    return NextResponse.json(votesData);
}

export async function POST(request: Request) {
    try {
        const { recipeId, action } = await request.json();
        if (!recipeId) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

        ensureVotesFile();
        let votesData: Record<string, number> = {};
        try {
            votesData = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'));
        } catch (e) {
            console.error('Erreur lecture votes:', e);
        }
        
        if (action === 'remove') {
            votesData[recipeId] = Math.max(0, (votesData[recipeId] || 1) - 1);
        } else {
            votesData[recipeId] = (votesData[recipeId] || 0) + 1;
        }
        
        try {
            fs.writeFileSync(VOTES_FILE, JSON.stringify(votesData, null, 2));
        } catch (e) {
            console.warn('Sauvegarde impossible sur cet environnement (ex: Vercel):', e);
            // On continue sans erreur 500, le vote sera effectif dans la réponse mais pas persistant
        }

        return NextResponse.json({ success: true, votes: votesData[recipeId] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
