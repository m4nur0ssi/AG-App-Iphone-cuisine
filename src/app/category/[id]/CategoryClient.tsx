'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import RecipeCard from '@/components/RecipeCard/RecipeCardV2';
import MagicFilterBar from '@/components/MagicFilterBar/MagicFilterBar';
import styles from './category.module.css';

interface CategoryClientProps {
    id: string;
    category: { name: string; icon: string };
    recipes: any[];
    categories: any;
}

export default function CategoryClient({ id, category, recipes, categories }: CategoryClientProps) {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.stickyHeaderMenu}>
                <Header showBack={true} />
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>
                    Recettes : {category.name}
                </h1>
                <span className={styles.count}>{recipes.length} recette{recipes.length > 1 ? 's' : ''}</span>
            </div>
            <main className={styles.main}>
                <div className={styles.grid}>
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>

                {recipes.length === 0 && (
                    <div className={styles.empty}>
                        <p>Aucune recette trouvée dans cette catégorie.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
