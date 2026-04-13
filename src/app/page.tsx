'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header/Header';
import RecipeCarousel from '../components/RecipeCarousel/RecipeCarousel';
import RecipeGrid from '../components/RecipeGrid/RecipeGrid';
import dynamic from 'next/dynamic';
const MagicFilterBar = dynamic(() => import('../components/MagicFilterBar/MagicFilterBar'), { ssr: false });
import { useRouter } from 'next/navigation';
import { mockRecipes } from '../data/mockData';
import { decodeHtml } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{tag: string, group: string}[]>([]);
    const activeTags = useMemo(() => activeFilters.map(f => f.tag), [activeFilters]);
    const [touchStart, setTouchStart] = useState<number>(0);
    const [touchEnd, setTouchEnd] = useState<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTagSelect = (tag: string, groupId?: string) => {
        if (!groupId) {
            const lowerTag = tag.toLowerCase();
            const categoriesIds = ['aperitifs', 'entrees', 'plats', 'vegetarien', 'desserts', 'patisserie', 'restaurant', 'apéro', 'entrée'];
            const countriesIds = ['france', 'italie', 'espagne', 'grece', 'liban', 'usa', 'mexique', 'orient', 'asie', 'afrique'];
            
            if (categoriesIds.some(c => lowerTag.includes(c))) groupId = 'categories';
            else if (countriesIds.some(c => lowerTag.includes(c))) groupId = 'countries';
            else groupId = 'trends'; 
        }

        setActiveFilters(prev => {
            const existing = prev.find(f => f.tag === tag);
            if (existing) {
                return prev.filter(f => f.tag !== tag);
            }
            const filtered = prev.filter(f => f.group !== groupId);
            return [...filtered, { tag, group: groupId }];
        });
    };

    const handleCarouselTitleClick = (title: string) => {
        // Strip emojis but KEEP accents (very important for French labels mapping)
        const cleanTitle = title.replace(/[^\w\sàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/g, '').toLowerCase().trim();
        
        const mapping: Record<string, string> = {
            'thématiques du moment': 'thématiques',
            'thématiques': 'thématiques',
            'les nouveautés': 'nouveautés',
            'spécial pâques': 'pâques',
            'paques': 'pâques',
            'pâques': 'pâques',
            'pâques est là': 'pâques',
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
            'noël': 'Noël',
            'voilà l\'été': 'voila-lete',
            'c\'est l\'hiver': 'cest-lhiver',
            'astuces': 'Astuces',
            'les glaces': 'glaces',
            'rafraîchissements': 'boissons'
        };

        const tag = mapping[cleanTitle] || cleanTitle;
        handleTagSelect(tag);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart < 100 && (touchEnd - touchStart) > 100) {
            if (activeTags.length > 0) {
                clearAllFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
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

                if (tagLower === 'pâques' || tagLower === 'paques') {
                    return recipeTags.some(t => t.toLowerCase() === 'pâques' || t.toLowerCase() === 'paques' || t.toLowerCase() === 'agneau') || 
                           recipe.title.toLowerCase().includes('agneau') || recipe.title.toLowerCase().includes('pâques');
                }

                // Thématiques saisonnières
                if (tagLower === 'voila-lete') {
                    const summerKeywords = ['été', 'ete', 'voilà', 'voila-lete', 'salade', 'bbq', 'barbecue', 'grillade', 'plancha'];
                    return (recipe.category as string) === 'voila-lete' || 
                           recipeTags.some(t => summerKeywords.some(k => t.toLowerCase().includes(k))) ||
                           summerKeywords.some(k => recipe.title.toLowerCase().includes(k));
                }
                if (tagLower === 'cest-lhiver') {
                    const winterKeywords = ['hiver', "c'est l'hiver", 'cest-lhiver', 'soupe', 'velouté', 'gratin', 'four', 'réconfortant', 'familial', 'pot-au-feu', 'tartiflette', 'raclette'];
                    return (recipe.category as string) === 'cest-lhiver' || 
                           recipeTags.some(t => winterKeywords.some(k => t.toLowerCase().includes(k))) ||
                           winterKeywords.some(k => recipe.title.toLowerCase().includes(k));
                }

                if (tagLower === 'simplissime') {
                    return recipeTags.includes('simplissime') || recipeCat === 'simplissime';
                }

                if (tagLower === 'italie' || tagLower === 'dolce vita') {
                    return recipeTags.includes('italie') || recipeTags.includes('italy') || 
                           recipeTags.includes('dolce vita') || recipeCat === 'italie';
                }

                if (tagLower === 'glaces') {
                    return recipeTags.some(t => t.includes('glace') || t.includes('sorbet')) || 
                           recipe.title.toLowerCase().includes('glace') || recipe.title.toLowerCase().includes('sorbet') ||
                           recipeCat === 'glaces';
                }

                if (tagLower === 'boissons') {
                    return recipeTags.some(t => t.includes('boisson') || t.includes('cocktail') || t.includes('jus')) || 
                           recipe.title.toLowerCase().includes('boisson') || recipe.title.toLowerCase().includes('cocktail') ||
                           recipeCat === 'boissons';
                }

                if (tagLower === 'thématiques' || tagLower === 'thématique') {
                    const themedKeywords = ['glace', 'sorbet', 'boisson', 'cocktail', 'pâques', 'paques', 'noël', 'noel', 'agneau', 'chocolat'];
                    const themedCats = ['glaces', 'boissons', 'pâques', 'noël', 'simplissime', 'italie'];
                    return recipeTags.some(t => themedKeywords.includes(t.toLowerCase())) || 
                           themedCats.includes(recipeCat) ||
                           themedKeywords.some(kw => recipe.title.toLowerCase().includes(kw));
                }

                if (tagLower === 'desserts' || tagLower === 'patisserie') {
                    return recipeCat === 'desserts' || recipeCat === 'patisserie' || 
                           recipeTags.some(t => t.toLowerCase().includes('dessert') || t.toLowerCase().includes('pâtis') || t.toLowerCase().includes('patis'));
                }

                if (tagLower === 'nouveautés' || tagLower === 'nouveauté') {
                    const sorted = [...mockRecipes].sort((a, b) => parseInt(b.id) - parseInt(a.id));
                    const latestIds = sorted.slice(0, 20).map(r => r.id);
                    return latestIds.includes(recipe.id);
                }

                return recipeCat === tagLower || 
                       recipeTags.some(t => t.includes(tagLower)) ||
                       (tagLower === 'aperitifs' && (recipeCat === 'apéro' || recipeCat === 'aperitif' || recipeCat === 'aperitifs')) ||
                       (tagLower === 'entrees' && (recipeCat === 'entrée' || recipeCat === 'entrees'));
            });
        });
    }, [activeTags]);

    const activeFiltersLabel = useMemo(() => {
        if (activeTags.length === 0) return "Les Recettes Magiques";
        return activeTags.map(t => {
            const low = t.toLowerCase();
            if (low === 'thématiques' || low === 'thématique') return 'THÉMATIQUES';
            if (low === 'nouveautés' || low === 'nouveauté') return 'NOUVEAUTÉS';
            if (low === 'simplissime') return 'SIMPLISSIME';
            return t.charAt(0).toUpperCase() + t.slice(1).replace('pâques', 'Pâques').replace('paques', 'Paques');
        }).join(" + ");
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

            const isEntree = (title.includes('salade') || title.includes('soupe') || title.includes('velouté') ||
                           (title.includes('œuf') && !title.includes('bœuf')) || title.includes('entrée') || tags.includes('entrée') ||
                           cat.includes('entrees') || cat.includes('entrée') || title.includes('carpaccio')) && !title.includes('apéro');

            const isDessertRaw = (title.includes('gâteau') || title.includes('chocolat') || title.includes('sucre') || 
                               title.includes('cookies') || title.includes('tiramisu') || title.includes('crêpe') ||
                               cat.includes('dessert') || cat.includes('patisserie')) && !isSavory;

            const isIceCream = (title.includes('glace') || title.includes('sorbet') || tags.includes('glace') || tags.includes('sorbet')) && 
                               !isSavory && !title.includes('glaçage') && !title.includes('gâteau');
            
            const isBeverage = (title.includes('boisson') || title.includes('cocktail') || title.includes('jus') || 
                              title.includes('alcool') || title.includes('vin') || title.includes('bière') ||
                              tags.includes('boisson') || tags.includes('cocktail') || tags.includes('jus')) && !isSavory;

            const isDessert = isDessertRaw && !isIceCream;

            let finalCat = recipe.category || 'Autres';

            if (isIceCream) finalCat = 'glaces';
            else if (isBeverage) finalCat = 'boissons';
            else if (isDessert) finalCat = 'desserts';
            else if (isPlat) finalCat = 'plats';
            else if (isApero) finalCat = 'aperitifs';
            else if (isEntree) finalCat = 'entrees';
            else if (cat === 'simplissime') finalCat = 'simplissime';
            else if (cat === 'italie') finalCat = 'restaurant';
            else if (cat === 'restaurant') finalCat = 'restaurant';
            else if (cat === 'patisserie') finalCat = 'patisserie';
            else if (cat === 'vegetarien') finalCat = 'vegetarien';

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

    const categories = ['aperitifs', 'entrees', 'plats', 'desserts', 'patisserie', 'restaurant', 'vegetarien'];
    const categoryLabels: Record<string, string> = {
        'aperitifs': 'Apéro Gourmand',
        'entrees': 'Entrées Fraîches',
        'plats': 'Plats de Chef',
        'desserts': 'Douceurs Sucrées',
        'glaces': 'Les Glaces',
        'boissons': 'Rafraîchissements',
        'simplissime': 'Simplissime',
        'patisserie': 'Atelier Pâtisserie',
        'restaurant': 'Comme au Resto',
        'vegetarien': 'Green & Healthy',
        'Autres': 'Le Reste du Monde'
    };

    const thematicThemes = [
        {
            id: 'easter-2024',
            title: 'Pâques est là',
            description: 'Un délicieux plat d\'agneau Pascal.',
            image: 'images/themes/paques.jpg',
            category: 'plats',
            tags: ['Pâques'],
            isFavorite: false,
            difficulty: 'moyen',
            prepTime: 15,
            cookTime: 45,
            servings: 4,
            ingredients: [],
            steps: []
        },
        {
            id: 'xmas-2024',
            title: 'C\'est Noël',
            description: 'La magie des fêtes dans votre assiette.',
            image: 'images/themes/noel.jpg',
            category: 'plats',
            tags: ['Noël'],
            isFavorite: false,
            difficulty: 'moyen',
            prepTime: 30,
            cookTime: 60,
            servings: 6,
            ingredients: [],
            steps: []
        },
        {
            id: 'theme-glaces',
            title: 'Les Glaces',
            description: 'Une sélection de sorbets et glaces artisanales.',
            image: 'images/themes/glaces.jpg',
            category: 'desserts',
            tags: ['glaces'],
            isFavorite: false,
            difficulty: 'facile',
            prepTime: 10,
            cookTime: 0,
            servings: 4,
            ingredients: [],
            steps: []
        },
        {
            id: 'theme-refresh',
            title: 'Rafraîchissements',
            description: 'Des boissons fraîches pour tous les goûts.',
            image: 'images/themes/rafraichissements.jpg',
            category: 'boissons',
            tags: ['boissons'],
            isFavorite: false,
            difficulty: 'facile',
            prepTime: 5,
            cookTime: 0,
            servings: 2,
            ingredients: [],
            steps: []
        },
        {
            id: 'theme-simplissime',
            title: 'Simplissime',
            description: 'Mini poivrons farcis à la grecque.',
            image: 'images/themes/simplissime.jpg',
            category: 'aperitifs',
            tags: ['simplissime'],
            isFavorite: false,
            difficulty: 'facile',
            prepTime: 10,
            cookTime: 15,
            servings: 4,
            ingredients: [],
            steps: []
        },
        {
            id: 'theme-dolce-vita',
            title: 'La Dolce Vita',
            description: 'Boulettes de viandes ultra gourmandes.',
            image: 'images/themes/dolce-vita.jpg',
            category: 'plats',
            tags: ['italie'],
            isFavorite: false,
            difficulty: 'moyen',
            prepTime: 20,
            cookTime: 20,
            servings: 4,
            ingredients: [],
            steps: []
        },
        {
            id: 'voila-lete',
            title: "Voilà l'Été ☀️",
            description: 'Les meilleures recettes estivales.',
            image: 'images/themes/voila-lete.jpg',
            category: 'plats',
            tags: ['voila-lete'],
            isFavorite: false,
            difficulty: 'facile',
            prepTime: 15,
            cookTime: 0,
            servings: 6,
            ingredients: [],
            steps: []
        },
        {
            id: 'cest-lhiver',
            title: "C'est l'Hiver ❄️",
            description: 'Recettes chaleureuses pour les jours froids.',
            image: 'images/themes/cest-lhiver.jpg',
            category: 'plats',
            tags: ['cest-lhiver'],
            isFavorite: false,
            difficulty: 'moyen',
            prepTime: 20,
            cookTime: 40,
            servings: 4,
            ingredients: [],
            steps: []
        },
        {
            id: 'theme-astuces',
            title: "Astuces 💡",
            description: 'Les petits secrets qui changent tout.',
            image: 'images/themes/astuces.jpg',
            category: 'autres',
            tags: ['Astuces'],
            isFavorite: false,
            difficulty: 'facile',
            prepTime: 5,
            cookTime: 0,
            servings: 1,
            ingredients: [],
            steps: []
        }
    ];

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

            <main 
                className={styles.main}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
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
                                {activeTags.includes('thématiques') ? (
                                    <RecipeGrid
                                        recipes={thematicThemes as any}
                                        onRecipeClick={(recipe) => handleCarouselTitleClick(recipe.title)}
                                    />
                                ) : (
                                    <RecipeGrid
                                        recipes={filteredRecipes}
                                    />
                                )}
                            </div>
                        )}
                        {activeTags.length === 0 && (
                            <>
                                <RecipeCarousel
                                    recipes={thematicThemes as any}
                                    title="Thématiques du Moment"
                                    size="large"
                                    onTitleClick={handleCarouselTitleClick}
                                    onCardClick={(recipe) => handleCarouselTitleClick(recipe.title)}
                                />

                                <RecipeCarousel
                                    recipes={newRecipes}
                                    title="Les Nouveautés"
                                    size="small"
                                    onTitleClick={handleCarouselTitleClick}
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
