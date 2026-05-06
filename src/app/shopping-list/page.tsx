'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import Header from '@/components/Header/Header';
import styles from './shopping-list.module.css';

interface ListData {
    [key: string]: {
        title: string;
        image?: string;
        ingredients: { name: string; checked: boolean }[];
    }
}

export default function ShoppingListPage() {
    const [shoppingList, setShoppingList] = useState<ListData>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const data = JSON.parse(window.localStorage.getItem('magic-shopping-list') || '{}');
        setShoppingList(data);
    }, []);

    const saveAndSync = (newData: ListData) => {
        window.localStorage.setItem('magic-shopping-list', JSON.stringify(newData));
        setShoppingList(newData);
        window.dispatchEvent(new Event('shoppingListUpdated'));
    };

    const clearList = () => {
        if (confirm('Voulez-vous vider toute la liste de courses ?')) {
            window.localStorage.removeItem('magic-shopping-list');
            setShoppingList({});
            window.dispatchEvent(new Event('shoppingListUpdated'));
        }
    };

    const removeRecipe = (id: string) => {
        const newData = { ...shoppingList };
        delete newData[id];
        saveAndSync(newData);
    };

    const toggleCheck = (recipeId: string, ingIdx: number) => {
        const newData = { ...shoppingList };
        const recipe = newData[recipeId];
        if (recipe && recipe.ingredients[ingIdx]) {
            let ing = recipe.ingredients[ingIdx];
            
            if (typeof ing === 'string') {
                recipe.ingredients[ingIdx] = { name: ing, checked: true };
            } else {
                ing.checked = !ing.checked;
            }
            
            saveAndSync(newData);
            
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    };

    if (!mounted) return null;

    const recipesCount = Object.keys(shoppingList).length;

    return (
        <div className={styles.page}>
            <Header title="Ma liste" showBack={true} />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.mainTitle}>Courses</h1>
                        <p className={styles.count}>{recipesCount} recette{recipesCount > 1 ? 's' : ''}</p>
                    </div>
                    {recipesCount > 0 && (
                        <button onClick={clearList} className={styles.clearBtn}>
                            Tout vider
                        </button>
                    )}
                </div>

                {recipesCount === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2 className={styles.emptyTitle}>Panier vide</h2>
                        <p className={styles.emptySubtitle}>
                            Ajoutez des ingrédients depuis une recette en cliquant sur le bouton d&apos;ajout au panier.
                        </p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {Object.entries(shoppingList).map(([id, data]) => (
                            <SwipeableRecipe 
                                key={id} 
                                id={id} 
                                data={data} 
                                removeRecipe={removeRecipe} 
                                toggleCheck={toggleCheck} 
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function SwipeableRecipe({ id, data, removeRecipe, toggleCheck }: { id: string, data: any, removeRecipe: (id: string) => void, toggleCheck: (id: string, idx: number) => void }) {
    const controls = useAnimation();
    
    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        // Si on a glissé de plus de 100px ou avec un swipe rapide vers la gauche
        if (offset < -100 || velocity < -500) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.25, ease: "easeOut" } });
            removeRecipe(id);
        } else {
            // Rebondit à 0
            controls.start({ x: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.5 } });
        }
    };

    return (
        <div className={styles.swipeContainer}>
            <div className={styles.deleteBackground} onClick={() => removeRecipe(id)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Supprimer</span>
            </div>
            
            <motion.div
                className={styles.recipeGroup}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 1, right: 0 }} 
                onDragEnd={handleDragEnd}
                animate={controls}
                whileDrag={{ scale: 0.98, boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}
                style={{ position: 'relative', zIndex: 2, background: 'var(--color-bg-tertiary)' }}
            >
                {data.image && (
                    <div className={styles.recipeImageWrapper}>
                        <img src={data.image} alt={data.title} className={styles.recipeImage} />
                    </div>
                )}
                <div className={styles.recipeHeader}>
                    <h3 className={styles.recipeTitle}>{data.title}</h3>
                </div>
                <div className={styles.ingredients}>
                    {data.ingredients.map((ing: any, idx: number) => {
                        const isObject = typeof ing === 'object' && ing !== null;
                        const name = isObject ? ing.name : (ing as string);
                        const checked = isObject ? ing.checked : false;

                        return (
                            <div 
                                key={idx} 
                                className={`${styles.ingItem} ${checked ? styles.checked : ''}`}
                                onClick={() => toggleCheck(id, idx)}
                            >
                                <div className={styles.checkboxContainer}>
                                    <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <label className={styles.label}>{name.replace('- ', '')}</label>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
