'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '@/types';
import dynamic from 'next/dynamic';
import Portal from '@/components/Portal';
import styles from './RecipeCardiOS26.module.css';

const RecipeSheet = dynamic(() => import('@/components/RecipeSheet/RecipeSheet'), { ssr: false });
const FavoriteButton = dynamic(() => import('@/components/FavoriteButton/FavoriteButton'), { ssr: false });
const ShareButton = dynamic(() => import('@/components/ShareButton/ShareButton'), { ssr: false });
const VoteButton = dynamic(() => import('@/components/VoteButton/VoteButton'), { ssr: false });

interface RecipeCardiOS26Props {
    recipe: Recipe;
    onPlayToggle?: (playing: boolean) => void;
    size?: 'large' | 'small';
    isFavoritesPage?: boolean;
    hideTitle?: boolean;
    hideVideo?: boolean;
    onCloseSplash?: () => void;
    isIntroMode?: boolean;
    onSheetOpen?: () => void;
    onSheetClose?: () => void;
}

export default function RecipeCardiOS26({ 
    recipe, 
    onPlayToggle, 
    size = 'large',
    isFavoritesPage = false,
    hideTitle = false,
    hideVideo = false,
    onCloseSplash,
    isIntroMode = false,
    onSheetOpen,
    onSheetClose
}: RecipeCardiOS26Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onPlayToggle?.(isPlaying);
    }, [isPlaying, onPlayToggle]);

    const getCategoryGradient = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'aperitifs': return 'linear-gradient(90deg, #F59E0B, #EA580C)';
            case 'entrees': return 'linear-gradient(90deg, #10B981, #059669)';
            case 'plats': return 'linear-gradient(90deg, #3B82F6, #4F46E5)';
            case 'desserts': return 'linear-gradient(90deg, #EC4899, #9333EA)';
            default: return 'linear-gradient(90deg, #10B981, #3B82F6)';
        }
    };
    const titleGradient = getCategoryGradient(recipe.category);

    const videoIdMatch = recipe.videoHtml?.match(/data-video-id="(\d+)"/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const embedUrl = videoId ? `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=0&controls=1&loop=1` : null;

    const countryFlags: Record<string, string> = {
        france: '🇫🇷', italie: '🇮🇹', espagne: '🇪🇸', grece: '🇬🇷',
        liban: '🇱🇧', usa: '🇺🇸', mexique: '🇲🇽', orient: '🕌',
        maroc: '🇲🇦', japon: '🇯🇵', asie: '🥢', afrique: '🌍'
    };
    const countries = Object.keys(countryFlags);
    const recipeCountryTag = recipe.tags?.find(t => countries.includes(t.toLowerCase()));
    const flag = recipeCountryTag ? countryFlags[recipeCountryTag.toLowerCase()] : null;

    // Filter out country tags for hashtags
    const hashtags = recipe.tags?.filter(t => !countries.includes(t.toLowerCase())).slice(0, 3) || [];

    const handleOpenDetail = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSheetOpen?.();
        setIsSheetOpen(true);
    };

    const truncateTitle = (title: string, maxLen: number = 22) => {
        if (title.length <= maxLen) return title;
        
        const sub = title.substring(0, maxLen);
        const lastSpace = sub.lastIndexOf(' ');
        
        if (lastSpace === -1) return sub + '...';
        return title.substring(0, lastSpace) + '...';
    };

    return (
        <div className={styles.recipeContainer}>
            {/* 1. Floating Title Pill ABOVE the card */}
            {!hideTitle && (
                <motion.div 
                    className={styles.titlePill}
                    whileHover={{ scale: 1.05 }}
                    onClick={handleOpenDetail}
                >
                    <h3 
                        className={styles.titleText}
                        style={{ 
                            backgroundImage: titleGradient,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {truncateTitle(recipe.title)}
                    </h3>
                </motion.div>
            )}

            {/* 2. Main Visual Card */}
            <motion.div
                ref={cardRef}
                className={`${styles.card} ${size === 'small' ? styles.small : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => {
                    if (onCloseSplash) onCloseSplash();
                    onSheetOpen?.();
                    setIsSheetOpen(true);
                }}
            >
                {/* Image */}
                <div className={styles.imageWrapper}>
                    {recipe.image && (
                        <Image
                            src={recipe.image}
                            alt={recipe.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            className={styles.image}
                        />
                    )}
                </div>

                {/* Overlays */}
                
                {/* Top Left: Country Flag Round Button */}
                {flag && !isIntroMode && (
                    <div className={styles.topLeftBadge}>
                        <div className={styles.roundBadge}>
                            {flag}
                        </div>
                    </div>
                )}

                {/* Top Right: Action Pill (Share, Fav, Vote) */}
                {!isIntroMode && (
                    <div 
                        className={styles.topRightActions}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className={styles.unifiedActionWell}>
                            <div className={styles.miniAction}>
                                <ShareButton 
                                    url={`/recipe/${recipe.id}`} 
                                    title={recipe.title} 
                                    className={styles.miniAction}
                                />
                            </div>
                            <div className={styles.miniAction}>
                                <FavoriteButton 
                                    recipeId={recipe.id} 
                                    initialFavorite={recipe.isFavorite} 
                                    className={styles.miniAction}
                                />
                            </div>
                            {/* Vote Button (Flame) on the right */}
                            <div className={styles.miniAction}>
                                <VoteButton 
                                    recipeId={recipe.id} 
                                    initialVotes={recipe.votes || 0}
                                    hideCount
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Central Play Button (if has video) */}
                {embedUrl && !isPlaying && !hideVideo && !isIntroMode && (
                    <button 
                        className={styles.playCenter}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPlaying(true);
                        }}
                    >
                        <div className={styles.playCircle}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        </div>
                    </button>
                )}

                {/* In-Card Video Player */}
                {isPlaying && embedUrl && (
                    <div className={styles.videoInCard} onClick={(e) => e.stopPropagation()}>
                        <iframe 
                            src={embedUrl}
                            className={styles.iframeInCard}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        />
                        <button 
                            className={styles.closeVideoInCard}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Bottom Right: Hashtags */}
                {!isIntroMode && hashtags.length > 0 && (
                    <div className={styles.hashtagContainer}>
                        {hashtags.map((tag, i) => (
                            <div 
                                key={i} 
                                className={styles.tagBadge}
                                style={{ background: getHashTagColor(i) }}
                            >
                                #{tag.toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Recipe Sheet */}
            <RecipeSheet 
                recipe={recipe} 
                isOpen={isSheetOpen} 
                onClose={() => {
                    setIsSheetOpen(false);
                    onSheetClose?.();
                }} 
            />
        </div>
    );
}

function getHashTagColor(index: number) {
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'];
    return colors[index % colors.length];
}
