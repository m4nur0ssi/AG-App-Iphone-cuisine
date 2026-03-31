'use client';

import styles from './ShareButton.module.css';

interface ShareButtonProps {
    url?: string;
    title?: string;
    className?: string;
}

const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

export default function ShareButton({ url, title, className }: ShareButtonProps) {
    const handleShare = async (e: React.MouseEvent) => {
        const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
        const finalTitle = title || (typeof document !== 'undefined' ? document.title : '');
        
        const shareData = {
            title: finalTitle,
            text: 'Découvrez cette recette magique !',
            url: finalUrl,
        };

        if (typeof navigator !== 'undefined' && navigator.share && window.isSecureContext) {
            try {
                await navigator.share(shareData);
            } catch (err) {}
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(finalUrl);
            } catch (err) {}
        }
    };

    return (
        <button className={className || ''} onClick={handleShare} aria-label="Partager" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShareIcon />
        </button>
    );
}
