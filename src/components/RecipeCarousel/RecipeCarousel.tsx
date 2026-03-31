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
            case 'aperitifs': return 'linear-gradient(90deg, #F59E0B, #EA580C)';
            case 'entrees': return 'linear-gradient(90deg, #10B981, #059669)';
            case 'plats': 
            case 'plat de chef': return 'linear-gradient(90deg, #3B82F6, #4F46E5)';
            case 'desserts':
            case 'douceur sucrée': return 'linear-gradient(90deg, #EC4899, #9333EA)';
            default: return 'linear-gradient(90deg, #10B981, #3B82F6)';
        }
    };

    const titleGradient = getCategoryGradient(title);

    return (
        <section className={`${styles.section} ${size === 'small' ? styles.compactSection : ''}`}>
            {title && (
                <div className={styles.header}>
                    <div className={styles.titlePillWrapper}>
                        <h2 
                            className={styles.sectionTitle}
                            style={{ 
                                backgroundImage: titleGradient,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                </div>
            )}
            
            <div className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.track}>
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
    const { scrollXProgress } = useScroll({ target: itemRef, container: containerRef, offset: ["start end", "end start"] });
    const opacity = 1;

    const getCategoryGradient = (cat: string) => {
        switch (cat?.toLowerCase()) {
            case 'aperitifs': return 'linear-gradient(135deg, #F59E0B, #EA580C)';
            case 'entrees': return 'linear-gradient(135deg, #10B981, #059669)';
            case 'plats': return 'linear-gradient(135deg, #3B82F6, #4F46E5)';
            case 'desserts': return 'linear-gradient(135deg, #EC4899, #9333EA)';
            default: return 'linear-gradient(135deg, #10B981, #3B82F6)';
        }
    };

    return (
        <motion.div
            ref={itemRef}
            className={`${styles.itemWrapper} ${size === 'small' ? styles.itemSmall : styles.itemLarge}`}
            style={{ opacity }}
        >
            <Link 
                href={`/category/${category}`}
                className={styles.viewAllCard}
                style={{ background: getCategoryGradient(category) }}
            >
                <div className={styles.viewAllContent}>
                    <span className={styles.viewAllIcon}>📁</span>
                    <h3 className={styles.viewAllText}>VOIR TOUT</h3>
                    <p className={styles.viewAllSub}>{category.toUpperCase()}</p>
                </div>
                
                {/* Glass Reflection overlay */}
                <div className={styles.viewAllGlass} />
            </Link>
        </motion.div>
    );
}
