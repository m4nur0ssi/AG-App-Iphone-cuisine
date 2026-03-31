'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '@/types';
import Portal from '@/components/Portal';
import styles from './RecipeSheet.module.css';
import RecipeDetails from '@/components/RecipeDetails/RecipeDetails';

interface RecipeSheetProps {
    recipe: Recipe;
    isOpen: boolean;
    onClose: () => void;
}

export default function RecipeSheet({ recipe, isOpen, onClose }: RecipeSheetProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (isOpen && recipe) {
            localStorage.setItem('magic-last-viewed', JSON.stringify({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image
            }));
            window.dispatchEvent(new Event('recipeViewed'));
        }
    }, [isOpen, recipe]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Stocker le scroll avant le lock
            scrollYRef.current = window.scrollY;
            document.body.style.top = `-${scrollYRef.current}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100vw'; 
            document.body.style.overflow = 'hidden';
        }

        // Cleanup function to restore scroll on unmount
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            
            // Re-scroller au bon endroit uniquement si on vient d'un état ouvert
            if (isOpen) {
                window.scrollTo(0, scrollYRef.current);
            }
        };
    }, [isOpen]);

    const handleAnimationComplete = () => {
        if (!isOpen) {
            setShouldRender(false);
        }
    };

    if (!recipe || !shouldRender) return null;

    return (
        <Portal>
            <AnimatePresence onExitComplete={handleAnimationComplete}>
                {isOpen && (
                    <div className={styles.container}>
                        {/* Backdrop sombre interactif */}
                        <motion.div 
                            className={styles.backdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />

                        {/* La "Feuille" (Sheet) iOS 26 */}
                        <motion.div
                            className={styles.sheet}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '105%' }} // Légèrement plus pour cacher l'ombre lors de la sortie
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.06}
                            onDragEnd={(_, info) => {
                                // Seuil de vitesse plus bas pour que ce soit instantané
                                if (info.offset.y > 100 || info.velocity.y > 350) {
                                    onClose();
                                }
                            }}
                            transition={{ 
                                type: 'spring', 
                                damping: 38, 
                                stiffness: 450,
                                mass: 0.6
                            }}
                        >
                            {/* Handle visuel de swipe */}
                            <div className={styles.dragHandle} />

                            <div className={styles.scrollArea}>
                                <button className={styles.closeBtn} onClick={onClose}>✕</button>
                                <RecipeDetails recipe={recipe} isModal={true} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
