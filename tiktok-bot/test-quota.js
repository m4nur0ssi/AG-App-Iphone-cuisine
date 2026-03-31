const fetch = require('node-fetch');
require('dotenv').config({ path: __dirname + '/.env' });

async function testConnectivity() {
    const model = 'gemini-flash-latest';
    const key = process.env.GEMINI_API_KEY;
    console.log(`🚀 TEST CONNECTIVITY: Model=${model}, KeyPrefix=${key ? key.substring(0, 5) : 'MISSING'}`);
    
    const prompt = "Réponds juste 'OK' si tu reçois ce message.";
    
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await r.json();
        console.log(`Status: ${r.status}`);
        if (!r.ok) {
            console.log('Error Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testConnectivity();
