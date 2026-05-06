'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { Recipe } from '@/types';
import RecipeCardiOS26 from '@/components/RecipeCard/RecipeCardiOS26';
import styles from './RecipeCarousel.module.css';

interface RecipeCarouselProps {
    recipes: Recipe[];
    title?: string;
    size?: 'large' | 'small';
    onTitleClick?: (title: string) => void;
    onCardClick?: (recipe: Recipe) => void;
}

export default function RecipeCarousel({ recipes, title = "Nouvelles Recettes ✨", size = 'large', onTitleClick, onCardClick }: RecipeCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // On limite à 15 recettes + 1 carte "Voir Tout" à la fin
    const limitedRecipes = useMemo(() => recipes.slice(0, 15), [recipes]);
    const category = limitedRecipes[0]?.category || 'all';

    const getCategoryGradient = (cat: string) => {
        // Normaliser proprement sans casser les accents
        const clean = cat.trim().toLowerCase();
        
        if (clean.includes('apéritif') || clean.includes('aperitif') || clean.includes('apéro')) return 'linear-gradient(135deg, #FF7E5F, #feb47b)';
        if (clean.includes('entrée') || clean.includes('entree')) return 'linear-gradient(135deg, #76B852, #8DC26F)';
        if (clean.includes('plat')) return 'linear-gradient(135deg, #8E2DE2, #4A00E0)';
        if (clean.includes('accompagnement')) return 'linear-gradient(135deg, #00C853, #69F0AE)';
        if (clean.includes('dessert')) return 'linear-gradient(135deg, #F80759, #BC4E9C)';
        if (clean.includes('pâtisserie') || clean.includes('patisserie')) return 'linear-gradient(135deg, #FFB347, #FF7B00)';
        if (clean.includes('thématique') || clean.includes('nouveauté')) return 'linear-gradient(135deg, #4facfe, #00f2fe)';
        if (clean.includes('pâques')) return 'linear-gradient(135deg, #F59E0B, #FFCC33)';
        
        return 'linear-gradient(135deg, #111111, #333333)';
    };

    const cardGradient = getCategoryGradient(title);

    return (
        <section className={`${styles.section} ${size === 'small' ? styles.compactSection : ''}`}>
            <div className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.track}>
                    {/* Première carte : Le Titre de la Thématique */}
                    <CategoryTitleCard 
                        title={title} 
                        gradient={cardGradient} 
                        size={size} 
                        onClick={() => onTitleClick?.(title)}
                    />

                    {limitedRecipes.map((recipe, index) => (
                        <CarouselItem 
                            key={recipe.id} 
                            recipe={recipe} 
                            index={index} 
                            containerRef={containerRef}
                            size={size}
                            parentTitle={title}
                            onCardClick={onCardClick}
                            allRecipes={limitedRecipes}
                        />
                    ))}

                    {/* Carte finale "Voir Tout" */}
                    {recipes.length > 15 && (
                         <ViewAllItem 
                            category={category}
                            containerRef={containerRef}
                            size={size}
                         />
                    )}
                </div>
            </div>
            
            {/* Visual Depth Hack (Glass Reflection) */}
            <div className={styles.glassFloor} />
        </section>
    );
}

function CategoryTitleCard({ title, gradient, size, onClick }: { title: string, gradient: string, size: 'large' | 'small', onClick?: () => void }) {
    const cleanTitle = title.trim().toUpperCase();
    const isLongTitle = cleanTitle.length > 12;

    // Mapping for images and colors
    const getCategoryData = (t: string) => {
        const c = t.toLowerCase();
        
        // Catégories de base
        if (c.includes('apéritif') || c.includes('aperitif') || c.includes('apéro')) return { image: '/images/categories/aperitif.jpg', color: '#10b981' };
        if (c.includes('entrée') || c.includes('entree')) return { image: '/images/categories/entree.jpg', color: '#3b82f6' };
        if (c.includes('plat')) return { image: '/images/categories/plats.jpg', color: '#f43f5e' };
        if (c.includes('dessert') || c.includes('douceur')) return { image: '/images/categories/desserts.jpg', color: '#d946ef' };
        if (c.includes('pâtisserie') || c.includes('patisserie')) return { image: '/images/categories/patisserie.jpg', color: '#f59e0b' };
        if (c.includes('restaurant') || c.includes('resto')) return { image: '/images/categories/patisserie.jpg', color: '#8b5cf6' };
        
        // Thématiques spécifiques
        if (c.includes('thématiques') || t.includes('Thématiques')) return { image: '/images/themes/simplissime.jpg', color: '#4f46e5' };
        if (c.includes('nouveautés') || c.includes('nouveauté')) return { image: '/images/themes/astuces.jpg', color: '#3b82f6' };
        if (c.includes('accompagnement')) return { image: '/images/themes/vegetarien.png', color: '#10b981' };
        
        if (c.includes('healthy') || c.includes('sain')) return { image: '/images/categories/entree.jpg', color: '#22c55e' };
        if (c.includes('airfryer')) return { image: '/images/categories/plats.jpg', color: '#f97316' };
        if (c.includes('barbecue') || c.includes('bbq')) return { image: '/images/categories/plats.jpg', color: '#b91c1c' };
        if (c.includes('pas cher')) return { image: '/images/categories/aperitif.jpg', color: '#eab308' };
        if (c.includes('express') || c.includes('rapide')) return { image: '/images/categories/entree.jpg', color: '#3b82f6' };
        if (c.includes('famille')) return { image: '/images/categories/plats.jpg', color: '#ec4899' };
        if (c.includes('pâques')) return { image: '/images/categories/desserts.jpg', color: '#F59E0B' };
        if (c.includes('noël')) return { image: '/images/categories/plats.jpg', color: '#10b981' };

        return { image: '/images/categories/patisserie.jpg', color: '#f59e0b' }; // fallback
    };

    const { image, color } = getCategoryData(title);

    return (
        <div className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}>
                <div 
                    className={`${styles.titleCard} ${size === 'small' ? styles.titleCardSmall : ''} ${onClick ? styles.clickable : ''} ${!title.toLowerCase().includes('thématiques') ? styles.withOffset : ''}`}
                    onClick={onClick}
                    style={{ '--category-color': color } as React.CSSProperties}
                >
                <div className={styles.fullBleedIcon}>
                    {image ? (
                        <img src={image} alt={title} className={styles.mainTitleIcon} />
                    ) : (
                        <div className={styles.categoryIconFallback}>🍳</div>
                    )}
                </div>

                <div className={styles.floatingBanner}>
                    <h2 className={`${styles.categoryMainTitle} ${isLongTitle ? styles.longTitle : ''}`}>
                        {cleanTitle}
                    </h2>
                    <div className={styles.titleSeparator} />
                </div>
            </div>
        </div>
    );
}

function CarouselItem({ recipe, index, containerRef, size, parentTitle, onCardClick, allRecipes }: { recipe: Recipe, index: number, containerRef: React.RefObject<HTMLDivElement>, size: 'large' | 'small', parentTitle?: string, onCardClick?: (recipe: Recipe) => void, allRecipes: Recipe[] }) {
    const itemRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ target: itemRef, container: containerRef, offset: ["start end", "end start"] });
    const opacity = 1;

    // Mapping parent title to specific gradient for recipe titles
    const getRecipeGradient = (pTitle: string) => {
        const clean = pTitle.replace(/[^\w\s]/gi, '').trim().toLowerCase();
        switch (clean) {
            case 'thématiques du moment': 
            case 'les thématiques du moment': return 'linear-gradient(90deg, #10b981, #3b82f6)'; // Blue-green
            case 'les nouveautés': return 'linear-gradient(90deg, #10b981, #3b82f6)';
            case 'nouveautés spéciales pâques': 
            case 'spécial pâques': return 'linear-gradient(90deg, #F59E0B, #FFCC33)';
            case 'coups de cœur simplissimes': return 'linear-gradient(90deg, #4facfe, #00f2fe)';
            case 'apéro gourmand': return 'linear-gradient(90deg, #F59E0B, #EA580C)';
            case 'entrées fraîches': return 'linear-gradient(90deg, #10B981, #059669)';
            case 'plats de chef': return 'linear-gradient(90deg, #3B82F6, #4F46E5)';
            case 'douceurs sucrées': return 'linear-gradient(90deg, #EC4899, #9333EA)';
            default: return undefined;
        }
    };

    const customGradient = parentTitle ? getRecipeGradient(parentTitle) : undefined;

    return (
        <motion.div
            ref={itemRef}
            className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}
            style={{ opacity }}
        >
            <RecipeCardiOS26 
                recipe={recipe} 
                size={size} 
                customGradient={customGradient} 
                customOnClick={onCardClick ? () => onCardClick(recipe) : undefined}
                allRecipes={allRecipes}
                recipeIndex={index}
            />
        </motion.div>
    );
}

function ViewAllItem({ category, containerRef, size }: { category: string, containerRef: React.RefObject<HTMLDivElement>, size: 'large' | 'small' }) {
    const itemRef = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            ref={itemRef}
            className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}
        >
            <Link 
                href={`/category/${category}`}
                className={styles.viewAllCard}
            >
                <div className={styles.viewAllContent}>
                    <h3 className={styles.viewAllText}>VOIR TOUT</h3>
                    <div className={styles.viewAllGlass} />
                </div>
            </Link>
        </motion.div>
    );
}
