'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
    recipeId: string;
    initialFavorite?: boolean;
    imageUrl?: string;
    className?: string;
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#ff3b30" : "none"} stroke={filled ? "#ff3b30" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

export default function FavoriteButton({ recipeId, initialFavorite = false, imageUrl, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(recipeId));
    }, [recipeId]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isFavorite;
        setIsFavorite(newState);

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (newState) {
            if (!favorites.includes(recipeId)) favorites.push(recipeId);
        } else {
            const index = favorites.indexOf(recipeId);
            if (index > -1) favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));

        if (newState && imageUrl) {
            fetch(imageUrl, { mode: 'no-cors' }).catch(() => { });
        }

        // Vibrate for feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(newState ? [15, 30, 15] : [10]);
        }

        // Emit events for global updates
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('magic-favorite-change'));
    };

    return (
        <motion.div
            className={`${className || ''} ${isFavorite ? 'active-favorite' : ''}`}
            onClick={toggleFavorite}
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            role="button"
            tabIndex={0}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <HeartIcon filled={isFavorite} />
        </motion.div>
    );
}
