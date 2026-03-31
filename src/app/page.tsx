'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header/Header';
import RecipeCarousel from '../components/RecipeCarousel/RecipeCarousel';
import dynamic from 'next/dynamic';
const MagicFilterBar = dynamic(() => import('../components/MagicFilterBar/MagicFilterBar'), { ssr: false });
import { mockRecipes } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [activeTags, setActiveTags] = useState<string[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTagSelect = (tag: string) => {
        setActiveTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const clearAllFilters = () => {
        setActiveTags([]);
    };

    const filteredRecipes = useMemo(() => {
        if (activeTags.length === 0) return mockRecipes;

        return mockRecipes.filter(recipe => {
            const recipeTags = (recipe.tags || []).map(t => t.toLowerCase());
            const recipeCat = (recipe.category || '').toLowerCase();

            return activeTags.every(currentTag => {
                const tagLower = currentTag.toLowerCase();

                if (tagLower === 'vegetarien') {
                    return recipeTags.some(t => t.includes('végé') || t.includes('vege') || t.includes('vegetarien')) || recipeCat === 'vegetarien';
                }

                const countryList = ['france', 'italie', 'espagne', 'grece', 'liban', 'usa', 'mexique', 'orient', 'maroc', 'japon', 'asie', 'afrique'];
                if (countryList.includes(tagLower)) {
                    return recipeTags.some(t => t.toLowerCase() === tagLower);
                }

                return recipeCat === tagLower || recipeTags.some(t => t.includes(tagLower));
            });
        });
    }, [activeTags]);

    const activeFiltersLabel = useMemo(() => {
        if (activeTags.length === 0) return "Les Recettes Magiques";
        return activeTags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ");
    }, [activeTags]);

    const categorizedRecipes = useMemo(() => {
        const groups: Record<string, typeof filteredRecipes> = {};
        filteredRecipes.forEach(recipe => {
            const cat = recipe.category || 'Autres';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(recipe);
        });
        return groups;
    }, [filteredRecipes]);

    const newRecipes = useMemo(() => {
        // Tri par ID décroissant (plus récentes)
        return [...mockRecipes]
            .sort((a, b) => parseInt(b.id) - parseInt(a.id))
            .slice(0, 12);
    }, []);

    const categories = ['aperitifs', 'entrees', 'plats', 'desserts', 'patisserie', 'restaurant', 'vegetarien'];
    const categoryLabels: Record<string, string> = {
        'aperitifs': 'Apéro Gourmand',
        'entrees': 'Entrées Fraîches',
        'plats': 'Plats de Chef',
        'desserts': 'Douceurs Sucrées',
        'patisserie': 'Atelier Pâtisserie',
        'restaurant': 'Comme au Resto',
        'vegetarien': 'Green & Healthy',
        'Autres': 'Le Reste du Monde'
    };

    return (
        <div className={styles.page}>
            <div className={styles.stickyHeaderMenu}>
                <Header 
                    title={activeFiltersLabel} 
                    large={!scrolled} 
                    onClear={clearAllFilters}
                    showClear={activeTags.length > 0}
                />
                <MagicFilterBar
                    activeTags={activeTags}
                    onSelect={handleTagSelect}
                    isHome={true}
                />
            </div>

            <main className={styles.main}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTags.join('-')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {activeTags.length > 0 && (
                            <div className={styles.resultsWrapper}>
                                <RecipeCarousel 
                                    recipes={filteredRecipes} 
                                    title="" 
                                    size="small"
                                />
                            </div>
                        )}
                        {activeTags.length === 0 && (
                            <>
                                <RecipeCarousel 
                                    recipes={[
                                        {
                                            id: 'easter-2024',
                                            title: 'Pâques est là',
                                            description: 'Un délicieux plat d\'agneau Pascal.',
                                            image: '/images/themes/easter.png',
                                            category: 'plats',
                                            tags: ['Agneau'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'xmas-2024',
                                            title: 'C\'est Noël',
                                            description: 'La magie des fêtes dans votre assiette.',
                                            image: '/images/themes/noel.png',
                                            category: 'plats',
                                            tags: ['Noël'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-simplissime',
                                            title: 'Simplissime',
                                            description: 'Mini poivrons farcis à la grecque.',
                                            image: '/images/themes/simplissime.png',
                                            category: 'aperitifs',
                                            tags: ['Simple', 'Grece'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-dolce-vita',
                                            title: 'La dolce vita',
                                            description: 'Boulettes de viandes ultra gourmandes.',
                                            image: '/images/themes/dolcevita.png',
                                            category: 'plats',
                                            tags: ['Italie'],
                                            isFavorite: false
                                        }
                                    ] as any} 
                                    title="Thématiques du Moment" 
                                    size="large"
                                />

                                <RecipeCarousel 
                                    recipes={newRecipes} 
                                    title="Les Nouveautés" 
                                    size="small"
                                />

                                <div className={styles.sectionsContainer}>
                                    {categories.map(catKey => {
                                        const recipes = categorizedRecipes[catKey];
                                        if (!recipes || recipes.length === 0) return null;

                                        return (
                                            <RecipeCarousel 
                                                key={catKey}
                                                recipes={recipes} 
                                                title={categoryLabels[catKey] || catKey} 
                                                size="small"
                                            />
                                        );
                                    })}

                                    {categorizedRecipes['Autres']?.length > 0 && (
                                        <RecipeCarousel 
                                            recipes={categorizedRecipes['Autres']} 
                                            title="Le Reste du Monde" 
                                            size="small"
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {filteredRecipes.length === 0 && (
                            <div className={styles.noRecipes}>Aucune recette correspondante 🥣</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

        </div>
    );
}
