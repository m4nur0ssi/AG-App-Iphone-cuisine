'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { mockRecipes } from '@/data/mockData';
import { decodeHtml } from '@/lib/utils';
import styles from './SpotlightSearch.module.css';

const CATEGORY_CHIPS = [
    { id: 'all',        label: 'Tout',        emoji: '✨' },
    { id: 'plats',      label: 'Plats',       emoji: '🍽️' },
    { id: 'desserts',   label: 'Desserts',    emoji: '🍰' },
    { id: 'aperitifs',  label: 'Apéros',      emoji: '🥂' },
    { id: 'patisserie', label: 'Pâtisserie',  emoji: '🥐' },
    { id: 'vegetarien', label: 'Végé',        emoji: '🥗' },
    { id: 'restaurant', label: 'Restaus',     emoji: '📍' },
];

const CATEGORY_THEMES: Record<string, string> = {
    aperitifs: '#10b981',
    plats: '#f43f5e',
    desserts: '#d946ef',
    patisserie: '#f59e0b',
    vegetarien: '#22c55e',
    restaurant: '#3b82f6',
    glaces: '#06b6d4',
    boissons: '#8b5cf6',
    entrees: '#f97316',
    simplissime: '#14b8a6',
};

function normalizeText(text: string) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function SpotlightSearch({
    isOpen,
    onClose,
    onRecipeSelect,
}: {
    isOpen: boolean;
    onClose: () => void;
    onRecipeSelect?: (recipe: any) => void;
}) {
    const [query, setQuery] = useState('');
    const [activeChip, setActiveChip] = useState('all');
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load recents from localStorage
    useEffect(() => {
        if (isOpen) {
            try {
                const data = JSON.parse(localStorage.getItem('magic-recent-searches') || '[]');
                setRecentIds(data);
            } catch {}
            // Slight delay so the overlay animation starts before focusing
            setTimeout(() => inputRef.current?.focus(), 120);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const normalizedQuery = normalizeText(query.trim());

    const results = useMemo(() => {
        let pool = activeChip === 'all' ? mockRecipes : mockRecipes.filter(r => r.category === activeChip);
        if (normalizedQuery.length > 1) {
            pool = pool.filter(r =>
                normalizeText(r.title).includes(normalizedQuery) ||
                r.tags?.some((t: string) => normalizeText(t).includes(normalizedQuery)) ||
                normalizeText(r.category).includes(normalizedQuery)
            );
        }
        return pool.slice(0, 30);
    }, [normalizedQuery, activeChip]);

    const recentRecipes = useMemo(() => {
        if (query.length > 0 || activeChip !== 'all') return [];
        return recentIds
            .map(id => mockRecipes.find(r => r.id.toString() === id.toString()))
            .filter(Boolean)
            .slice(0, 5) as typeof mockRecipes;
    }, [recentIds, query, activeChip]);

    const handleSelect = (recipe: any) => {
        // Save to recent
        try {
            const newRecents = [recipe.id.toString(), ...recentIds.filter(id => id !== recipe.id.toString())].slice(0, 10);
            localStorage.setItem('magic-recent-searches', JSON.stringify(newRecents));
        } catch {}

        if (onRecipeSelect) {
            onRecipeSelect(recipe);
        } else {
            router.push(`/recipe/${recipe.id}`);
        }
        onClose();
    };

    const showRecentSection = recentRecipes.length > 0 && query.length === 0 && activeChip === 'all';
    const showResults = normalizedQuery.length > 1 || activeChip !== 'all';

    return (
        <motion.div
            className={styles.fullscreenOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.panel}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className={styles.dragHandle} />

                {/* Search Bar */}
                <div className={styles.searchBarRow}>
                    <div className={styles.searchBar}>
                        <svg className={styles.searchBarIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Rechercher une recette…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                        <AnimatePresence>
                            {query.length > 0 && (
                                <motion.button
                                    className={styles.clearBtn}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    onClick={() => setQuery('')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                    <button className={styles.cancelBtn} onClick={onClose}>Annuler</button>
                </div>

                {/* Category Chips */}
                <div className={styles.chipsRow}>
                    {CATEGORY_CHIPS.map(chip => (
                        <button
                            key={chip.id}
                            className={`${styles.chip} ${activeChip === chip.id ? styles.chipActive : ''}`}
                            onClick={() => setActiveChip(prev => prev === chip.id ? 'all' : chip.id)}
                        >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className={styles.scrollArea}>
                    {/* Recents */}
                    {showRecentSection && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span>Récemment vus</span>
                                <button className={styles.sectionAction} onClick={() => {
                                    localStorage.removeItem('magic-recent-searches');
                                    setRecentIds([]);
                                }}>Effacer</button>
                            </div>
                            <div className={styles.recentList}>
                                {recentRecipes.map(recipe => (
                                    <motion.div
                                        key={recipe.id}
                                        className={styles.recentRow}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleSelect(recipe)}
                                    >
                                        <div className={styles.recentThumbWrap}>
                                            {recipe.image
                                                ? <img src={recipe.image} alt="" className={styles.recentThumb} />
                                                : <div className={styles.recentThumbFallback}>🍽️</div>
                                            }
                                        </div>
                                        <span className={styles.recentTitle}>{decodeHtml(recipe.title)}</span>
                                        <svg className={styles.rowArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results Grid */}
                    {showResults && (
                        <div className={styles.section}>
                            {results.length > 0 ? (
                                <>
                                    {normalizedQuery.length > 1 && (
                                        <div className={styles.sectionHeader}>
                                            <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                    <div className={styles.resultsGrid}>
                                        {results.map((recipe, i) => {
                                            const accent = CATEGORY_THEMES[recipe.category] || '#f43f5e';
                                            return (
                                                <motion.div
                                                    key={recipe.id}
                                                    className={styles.resultCard}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.02, duration: 0.2 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => handleSelect(recipe)}
                                                >
                                                    <div className={styles.cardImageWrap}>
                                                        {recipe.image
                                                            ? <img src={recipe.image} alt="" className={styles.cardImage} />
                                                            : <div className={styles.cardImageFallback}>🍽️</div>
                                                        }
                                                        <div
                                                            className={styles.cardCategoryBadge}
                                                            style={{ background: accent + '22', color: accent, borderColor: accent + '44' }}
                                                        >
                                                            {recipe.category}
                                                        </div>
                                                    </div>
                                                    <div className={styles.cardBody}>
                                                        <div className={styles.cardTitle}>{decodeHtml(recipe.title)}</div>
                                                        <div className={styles.cardMeta}>
                                                            <span>{recipe.difficulty}</span>
                                                            {recipe.cookTime > 0 && <><span className={styles.dot}>·</span><span>{recipe.cookTime} min</span></>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyEmoji}>✨</div>
                                    <div className={styles.emptyTitle}>Aucune recette trouvée</div>
                                    <div className={styles.emptySubtitle}>Essaie un autre mot-clé</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Default state — no query, no category filter */}
                    {!showRecentSection && !showResults && (
                        <div className={styles.defaultState}>
                            <div className={styles.defaultEmoji}>🔮</div>
                            <div className={styles.defaultText}>Cherche par nom, ingrédient ou catégorie</div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
