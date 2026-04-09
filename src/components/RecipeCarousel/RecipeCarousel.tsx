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
        // Nettoyer le titre pour le mapping (ex: "Douceur sucrée ✨" -> "douceur sucrée")
        const clean = cat.replace(/[^\w\s]/gi, '').trim().toLowerCase();
        
        switch (clean) {
            case 'aperitifs': 
            case 'apéritifs':
            case 'apéro gourmand': return 'linear-gradient(135deg, #F59E0B, #EA580C)';
            case 'entrees': 
            case 'entrées':
            case 'entrées fraîches': return 'linear-gradient(135deg, #10B981, #059669)';
            case 'plats': 
            case 'plats de chef': 
            case 'plat de chef': return 'linear-gradient(135deg, #3B82F6, #4F46E5)';
            case 'desserts':
            case 'pâtisserie':
            case 'douceurs sucrées':
            case 'douceur sucrée': return 'linear-gradient(135deg, #EC4899, #9333EA)';
            case 'thématiques du moment': return 'linear-gradient(135deg, #10b981, #3b82f6)';
            case 'nouveautés spéciales pâques':
            case 'spécial pâques': return 'linear-gradient(135deg, #F59E0B, #FFCC33)';
            case 'coups de cœur simplissimes': return 'linear-gradient(135deg, #4facfe, #00f2fe)';
            case 'les nouveautés': return 'linear-gradient(135deg, #10b981, #3b82f6)';
            default: return 'linear-gradient(135deg, #10B981, #3B82F6)';
        }
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
    const cleanTitle = title.trim();
    const words = cleanTitle.split(' ');

    const renderArtisticTitle = () => {
        return words.map((word, i) => {
            const isConnectionWord = ['du', 'de', 'la', 'le', 'pour', 'les', 'au', 'aux', 'en', 'et'].includes(word.toLowerCase());
            // Seuls les mots de liaison sont en cursive pour garantir que le mot principal reste en gras
            const isScript = isConnectionWord;
            
            return (
                <span 
                    key={i} 
                    className={isScript ? styles.scriptWord : styles.boldWord}
                >
                    {word}{i < words.length - 1 ? ' ' : ''}
                </span>
            );
        });
    };

    return (
        <div className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}>
            <div 
                className={`${styles.titleCard} ${size === 'small' ? styles.titleCardSmall : ''} ${onClick ? styles.clickable : ''}`}
                style={{ background: gradient }}
                onClick={onClick}
            >
                <div className={styles.titleCardContent}>
                    <h2 className={styles.categoryMainTitle}>
                        {renderArtisticTitle()}
                    </h2>
                    <div className={styles.titleCardGlass} />
                </div>
            </div>
        </div>
    );
}

function CarouselItem({ recipe, containerRef, size, parentTitle, onCardClick }: { recipe: Recipe, index: number, containerRef: React.RefObject<HTMLDivElement>, size: 'large' | 'small', parentTitle?: string, onCardClick?: (recipe: Recipe) => void }) {
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
