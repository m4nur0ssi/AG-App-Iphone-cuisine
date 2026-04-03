'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header/Header';
import RecipeCarousel from '../components/RecipeCarousel/RecipeCarousel';
import RecipeGrid from '../components/RecipeGrid/RecipeGrid';
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
                return []; // Unselect
            } else {
                return [tag]; // Mutual exclusivity as requested
            }
        });
    };

    const handleCarouselTitleClick = (title: string) => {
        // Find corresponding tag
        const cleanTitle = title.replace(/[^\w\s]/gi, '').trim().toLowerCase();
        
        // Exact mappings based on labels
        const mapping: Record<string, string> = {
            'spécial pâques': 'pâques',
            'paques': 'pâques',
            'pâques': 'pâques',
            'simplissime': 'simplissime',
            'apéro gourmand': 'aperitifs',
            'entrées fraîches': 'entrees',
            'plats de chef': 'plats',
            'douceurs sucrées': 'desserts',
            'atelier pâtisserie': 'patisserie',
            'comme au resto': 'restaurant',
            'green healthy': 'vegetarien',
            'la dolce vita': 'italie',
            'c\'est noël': 'Noël',
            'les glaces': 'glaces',
            'rafraîchissements': 'boissons'
        };

        const tag = mapping[cleanTitle] || cleanTitle;
        handleTagSelect(tag);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearAllFilters = () => {
        setActiveTags([]);
    };

    const filteredRecipes = useMemo(() => {
        if (activeTags.length === 0) return mockRecipes;

        return mockRecipes.filter(recipe => {
            const recipeTags = (recipe.tags || []).map(t => t.toLowerCase());
            const recipeCat = (recipe.category || '').toLowerCase();

            return activeTags.some(currentTag => {
                const tagLower = currentTag.toLowerCase();

                if (tagLower === 'vegetarien') {
                    return recipeTags.some(t => t.includes('végé') || t.includes('vege') || t.includes('vegetarien')) || recipeCat === 'vegetarien';
                }

                if (tagLower === 'pâques' || tagLower === 'paques') {
                    return recipeTags.some(t => t.toLowerCase() === 'pâques' || t.toLowerCase() === 'paques' || t.toLowerCase() === 'agneau');
                }

                if (tagLower === 'simplissime') {
                    return recipeTags.includes('simplissime');
                }

                if (tagLower === 'glaces') {
                    return recipeTags.some(t => t.includes('glace') || t.includes('sorbet')) || 
                           recipe.title.toLowerCase().includes('glace') || recipe.title.toLowerCase().includes('sorbet');
                }

                if (tagLower === 'boissons') {
                    return recipeTags.some(t => t.includes('boisson') || t.includes('cocktail') || t.includes('jus')) || 
                           recipe.title.toLowerCase().includes('boisson') || recipe.title.toLowerCase().includes('cocktail');
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
        return activeTags.map(t => t.charAt(0).toUpperCase() + t.slice(1).replace('pâques', 'Pâques').replace('paques', 'Paques')).join(" + ");
    }, [activeTags]);

    const categorizedRecipes = useMemo(() => {
        const groups: Record<string, typeof mockRecipes> = {};
        
        mockRecipes.forEach(recipe => {
            const title = (recipe.title || '').toLowerCase();
            const tags = (recipe.tags || []).map(t => t.toLowerCase());
            const cat = (recipe.category || '').toLowerCase();
            
            const isSavory = title.includes('poulet') || title.includes('viande') || title.includes('gratin') || 
                           title.includes('pâtes') || title.includes('pizza') || title.includes('salade') ||
                           title.includes('agneau') || title.includes('poisson') || title.includes('riz') ||
                           title.includes('burger') || title.includes('soupe') || title.includes('quiche') ||
                           title.includes('croquetas') || title.includes('apéro') || title.includes('tapas') ||
                           title.includes('légume') || title.includes('fromage') || title.includes('patate') ||
                           title.includes('pomme de terre') || title.includes('oeuf') || title.includes('œuf') ||
                           title.includes('crevette') || title.includes('saumon') || title.includes('thon') ||
                           title.includes('pesto') || title.includes('tomate') || title.includes('bagel') ||
                           title.includes('bruschetta') || title.includes('casatiello') || title.includes('focaccia') ||
                           title.includes('bread') || title.includes('pain') || title.includes('olive');

            const isPlat = (title.includes('poulet') || title.includes('agneau') || title.includes('gratin') || 
                          title.includes('burger') || title.includes('viande') || title.includes('pâtes') ||
                          title.includes('riz') || title.includes('rôti') || title.includes('confit') ||
                          tags.includes('plat') || cat.includes('plat') || cat.includes('plats')) && !title.includes('apéro');
            
            const isApero = title.includes('croquetas') || title.includes('apéro') || title.includes('tapas') || 
                          title.includes('cocktail') || tags.includes('aperitif') || tags.includes('apéro') ||
                          cat.includes('aperitifs') || cat.includes('apéro') || title.includes('houmous');

            const isEntree = title.includes('salade') || title.includes('soupe') || title.includes('velouté') ||
                           title.includes('œuf') || title.includes('entrée') || tags.includes('entrée') ||
                           cat.includes('entrees') || cat.includes('entrée') || title.includes('carpaccio');

            const isDessertRaw = (title.includes('gâteau') || title.includes('chocolat') || title.includes('sucre') || 
                               title.includes('cookies') || title.includes('tiramisu') || title.includes('crêpe') ||
                               cat.includes('dessert') || cat.includes('patisserie')) && !isSavory;

            const isIceCream = (title.includes('glace') || title.includes('sorbet') || tags.includes('glace') || tags.includes('sorbet')) && !isSavory;
            const isBeverage = (title.includes('boisson') || title.includes('cocktail') || title.includes('jus') || 
                              tags.includes('boisson') || tags.includes('cocktail') || tags.includes('jus')) && !isSavory;

            const isDessert = isDessertRaw && !isIceCream;

            let finalCat = recipe.category || 'Autres';

            if (isIceCream) finalCat = 'glaces';
            else if (isBeverage) finalCat = 'boissons';
            else if (isDessert) finalCat = 'desserts';
            else if (isPlat) finalCat = 'plats';
            else if (isApero) finalCat = 'aperitifs';
            else if (isEntree) finalCat = 'entrees';

            if (finalCat === 'patisserie' && isSavory) finalCat = 'plats';

            if (!groups[finalCat]) groups[finalCat] = [];
            groups[finalCat].push(recipe);
        });
        return groups;
    }, [filteredRecipes]);

    const newRecipes = useMemo(() => {
        return [...mockRecipes]
            .sort((a, b) => parseInt(b.id) - parseInt(a.id))
            .slice(0, 12);
    }, []);

    const categories = ['aperitifs', 'entrees', 'plats', 'desserts', 'glaces', 'boissons', 'patisserie', 'restaurant', 'vegetarien'];
    const categoryLabels: Record<string, string> = {
        'aperitifs': '🍸 Apéro Gourmand',
        'entrees': '🥗 Entrées Fraîches',
        'plats': '🍛 Plats de Chef',
        'desserts': '🍰 Douceurs Sucrées',
        'glaces': '🍦 Les Glaces',
        'boissons': '🍹 Rafraîchissements',
        'patisserie': '🥐 Atelier Pâtisserie',
        'restaurant': '📍 Comme au Resto',
        'vegetarien': '🥗 Green & Healthy',
        'Autres': '🥣 Le Reste du Monde'
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
                                <RecipeGrid
                                    recipes={filteredRecipes}
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
                                            image: '/images/themes/paques.jpg',
                                            category: 'plats',
                                            tags: ['Pâques'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'xmas-2024',
                                            title: 'C\'est Noël',
                                            description: 'La magie des fêtes dans votre assiette.',
                                            image: '/images/themes/noel.jpg',
                                            category: 'plats',
                                            tags: ['Noël'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-glaces',
                                            title: 'Les Glaces',
                                            description: 'Une sélection de sorbets et glaces artisanales.',
                                            image: '/images/themes/glaces.png',
                                            category: 'desserts',
                                            tags: ['glace'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-refresh',
                                            title: 'Rafraîchissements',
                                            description: 'Des boissons fraîches pour tous les goûts.',
                                            image: '/images/themes/rafraichissements.png',
                                            category: 'aperitifs',
                                            tags: ['boisson'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-simplissime',
                                            title: 'Simplissime',
                                            description: 'Mini poivrons farcis à la grecque.',
                                            image: '/images/themes/simplissime.jpg',
                                            category: 'aperitifs',
                                            tags: ['Simple', 'Grece', 'simplissime'],
                                            isFavorite: false
                                        },
                                        {
                                            id: 'theme-dolce-vita',
                                            title: 'La Dolce Vita',
                                            description: 'Boulettes de viandes ultra gourmandes.',
                                            image: '/images/themes/dolce-vita.jpg',
                                            category: 'plats',
                                            tags: ['Italie'],
                                            isFavorite: false
                                        }
                                    ] as any}
                                    title="Thématiques du Moment"
                                    size="large"
                                    onTitleClick={handleCarouselTitleClick}
                                    onCardClick={(recipe) => handleCarouselTitleClick(recipe.title)}
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
                                                onTitleClick={handleCarouselTitleClick}
                                            />
                                        );
                                    })}

                                    {categorizedRecipes['Autres']?.length > 0 && (
                                        <RecipeCarousel
                                            recipes={categorizedRecipes['Autres']}
                                            title="Le Reste du Monde"
                                            size="small"
                                            onTitleClick={handleCarouselTitleClick}
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
