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
}

export default function RecipeCarousel({ recipes, title = "Nouvelles Recettes ✨", size = 'large' }: RecipeCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // On limite à 15 recettes + 1 carte "Voir Tout" à la fin
    const limitedRecipes = useMemo(() => recipes.slice(0, 15), [recipes]);
    const category = limitedRecipes[0]?.category || 'all';

    const getCategoryGradient = (cat: string) => {
        // Nettoyer le titre pour le mapping (ex: "Douceur sucrée ✨" -> "douceur sucrée")
        const clean = cat.replace('✨', '').trim().toLowerCase();
        
        switch (clean) {
            case 'aperitifs': 
            case 'apéro gourmand': return 'linear-gradient(135deg, #F59E0B, #EA580C)';
            case 'entrees': 
            case 'entrées fraîches': return 'linear-gradient(135deg, #10B981, #059669)';
            case 'plats': 
            case 'plats de chef': 
            case 'plat de chef': return 'linear-gradient(135deg, #3B82F6, #4F46E5)';
            case 'desserts':
            case 'douceurs sucrées':
            case 'douceur sucrée': return 'linear-gradient(135deg, #EC4899, #9333EA)';
            case 'thématiques du moment': return 'linear-gradient(135deg, #7f0df2, #a855f7)';
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
                    />

                    {limitedRecipes.map((recipe, index) => (
                        <CarouselItem 
                            key={recipe.id} 
                            recipe={recipe} 
                            index={index} 
                            containerRef={containerRef}
                            size={size}
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

function CategoryTitleCard({ title, gradient, size }: { title: string, gradient: string, size: 'large' | 'small' }) {
    const cleanTitle = title.replace('✨', '').trim();
    const words = cleanTitle.split(' ');

    const renderArtisticTitle = () => {
        return words.map((word, i) => {
            const isConnectionWord = ['du', 'de', 'la', 'le', 'pour', 'les', 'au'].includes(word.toLowerCase());
            // Logique artistique : alterner ou forcer le script sur les mots de liaison/deuxièmes mots
            const isScript = isConnectionWord || (words.length > 1 && i === 1);
            
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
                className={`${styles.titleCard} ${size === 'small' ? styles.titleCardSmall : ''}`}
                style={{ background: gradient }}
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

function CarouselItem({ recipe, containerRef, size }: { recipe: Recipe, index: number, containerRef: React.RefObject<HTMLDivElement>, size: 'large' | 'small' }) {
    const itemRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ target: itemRef, container: containerRef, offset: ["start end", "end start"] });
    const opacity = 1;

    return (
        <motion.div
            ref={itemRef}
            className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}
            style={{ opacity }}
        >
            <RecipeCardiOS26 recipe={recipe} size={size} />
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
