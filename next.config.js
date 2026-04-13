/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimisé pour Vercel — API routes actives (votes, sync, image-proxy, wordpress-sync)
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '109.221.250.122',
            },
            {
                protocol: 'https',
                hostname: 'cdn.pixabay.com',
            },
            {
                protocol: 'https',
                hostname: 'pixabay.com',
            },
            {
                protocol: 'https',
                hostname: 'www.tiktok.com',
            }
        ],
    },
    productionBrowserSourceMaps: false,
    // NOTE: output:'export' supprimé — il désactivait toutes les API routes (votes, sync, image-proxy)
}

module.exports = nextConfig
