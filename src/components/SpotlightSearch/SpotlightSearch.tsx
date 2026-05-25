'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mockRecipes } from '@/data/mockData';
import { decodeHtml } from '@/lib/utils';
import styles from './SpotlightSearch.module.css';

export default function SpotlightSearch({
    isOpen,
    onClose,
    onRecipeSelect
}: {
    isOpen: boolean;
    onClose: () => void;
    onRecipeSelect?: (recipe: any) => void;
}) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const normalizedQuery = normalizeText(query);

    const filteredRecipes = query.trim().length > 1
        ? mockRecipes.filter(r =>
            normalizeText(r.title).includes(normalizedQuery) ||
            r.tags?.some((t: string) => normalizeText(t).includes(normalizedQuery))
        )
        : [];

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSelect = (recipe: any) => {
        if (onRecipeSelect) {
            onRecipeSelect(recipe);
        } else {
            router.push(`/recipe/${recipe.id}`);
        }
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.searchContainer}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        placeholder="Cherche une recette…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.results}>
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className={styles.resultItem}
                                onClick={() => handleSelect(recipe)}
                            >
                                {recipe.image && <img src={recipe.image} alt="" className={styles.thumb} />}
                                <div className={styles.resultInfo}>
                                    <div className={styles.resultTitle}>{decodeHtml(recipe.title)}</div>
                                    <div className={styles.resultMeta}>{recipe.category} • {recipe.difficulty}</div>
                                </div>
                            </div>
                        ))
                    ) : query.length > 1 ? (
                        <div className={styles.noResult}>Aucune recette trouvée ✨</div>
                    ) : (
                        <div className={styles.placeholderText}>Tape au moins 2 caractères pour rechercher</div>
                    )}
                </div>
            </div>
        </div>
    );
}
