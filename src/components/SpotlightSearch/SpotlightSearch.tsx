'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mockRecipes } from '@/data/mockData';
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
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const normalizedQuery = normalizeText(query);

    const filteredRecipes = query.trim().length > 1
        ? mockRecipes.filter(r =>
            normalizeText(r.title).includes(normalizedQuery) ||
            r.tags?.some((t: string) => normalizeText(t).includes(normalizedQuery))
        )
        : [];

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

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
                        placeholder="Cherche une recette"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button className={styles.closeBtn} onClick={onClose}>Esc</button>
                </div>

                <div className={styles.results}>
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className={styles.resultItem}
                                onClick={() => handleSelect(recipe)}
                            >
                                <img src={recipe.image} alt="" className={styles.thumb} />
                                <div className={styles.resultInfo}>
                                    <div className={styles.resultTitle}>{recipe.title}</div>
                                    <div className={styles.resultMeta}>{recipe.category} • {recipe.difficulty}</div>
                                </div>
                            </div>
                        ))
                    ) : query.length > 1 ? (
                        <div className={styles.noResult}>Aucun sort ne correspond à cette recherche... ✨</div>
                    ) : (
                        <div className={styles.placeholderText}>Tapez au moins 2 caractères pour commencer la magie</div>
                    )}
                </div>
            </div>
        </div>
    );
}
