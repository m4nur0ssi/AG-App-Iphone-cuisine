import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Outfit, Dancing_Script } from 'next/font/google'
import { TimerProvider } from '@/components/Timer/TimerContext'
import './globals.css'

const SplashScreen = dynamic(() => import('@/components/SplashScreen/SplashScreen'), { ssr: false })
const BottomNav = dynamic(() => import('@/components/BottomNav/BottomNav'), { ssr: false })

const outfit = Outfit({ 
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

const dancingScript = Dancing_Script({ 
    subsets: ['latin'],
    variable: '--font-dancing',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Les Recettes Magiques - Cuisine Enchantée',
    description: 'Découvrez des recettes magiques et délicieuses pour enchanter vos papilles',
    keywords: ['recettes', 'cuisine', 'magie', 'gastronomie'],
    manifest: '/manifest.json',
    icons: [
        { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
    ],
    robots: {
        index: false,
        follow: false,
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className={`${outfit.variable} ${dancingScript.variable}`} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var isIPhone = /iPhone/i.test(navigator.userAgent);
                                    var hasSeenSplash = sessionStorage.getItem('hasSeenMagicSplash-v7');
                                    if (!hasSeenSplash) {
                                        document.documentElement.classList.add('is-splashing');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body>
                <TimerProvider>
                    <SplashScreen />
                    <div className="main-content-wrapper">
                        {children}
                    </div>
                    <BottomNav />
                </TimerProvider>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    )
}
