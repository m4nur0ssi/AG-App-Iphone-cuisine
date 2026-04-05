'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import MagicFilterBar from '@/components/MagicFilterBar/MagicFilterBar';
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';
import ShareButton from '@/components/ShareButton/ShareButton';
import VoteButton from '@/components/VoteButton/VoteButton';
import VideoSection from '@/components/VideoSection/VideoSection';
import { Recipe } from '@/types';
import { scaleQuantity } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTimer } from '@/components/Timer/TimerContext';
import { parseDuration, stripHtml } from '@/lib/timer-utils';
import SmartText from '@/components/SmartText/SmartText';
import MagicConverter from '@/components/MagicConverter/MagicConverter';
import SplitTitle from '@/components/SplitTitle/SplitTitle';
import { getIngredientVisual } from '@/lib/ingredient-utils';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

interface RecipeClientProps {
    recipe: Recipe;
    prevId?: string | null;
    nextId?: string | null;
}

type TabId = 'ingredients' | 'steps' | 'video';

export default function RecipeClient({ recipe, prevId, nextId }: RecipeClientProps) {
    const { startTimer } = useTimer();
    const [servings, setServings] = useState(recipe.servings || 4);
    const [focusMode, setFocusMode] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Swipe navigation state
    const router = useRouter();
    const touchStart = useRef<{ x: number, y: number } | null>(null);
    const touchEnd = useRef<{ x: number, y: number } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left'|'right'|null>(null);

    // Tabs
    const availableTabs: { id: TabId; label: string; count?: number }[] = [
        { id: 'ingredients', label: 'Ingrédients', count: recipe?.ingredients?.length || 0 },
        { id: 'steps', label: 'Étapes', count: recipe?.steps?.length || 0 },
        ...(recipe?.videoHtml ? [{ id: 'video' as TabId, label: 'Vidéo' }] : []),
    ];

    // Default to 'steps' if no ingredients (restaurant), else 'ingredients'
    const defaultTab: TabId = recipe.category === 'restaurant' ? 'steps' : 'ingredients';
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [prevTab, setPrevTab] = useState<TabId | null>(null);
    const tabContentRef = useRef<HTMLDivElement>(null);

    // Dynamic Colors based on category
    const theme = useMemo(() => {
        const categories: Record<string, { accent: string; glow: string; bg: string; rgb: string }> = {
            aperitifs: { accent: '#10b981', glow: '0 0 20px rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.1)', rgb: '16, 185, 129' },
            plats: { accent: '#f43f5e', glow: '0 0 20px rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.1)', rgb: '244, 63, 94' },
            desserts: { accent: '#d946ef', glow: '0 0 20px rgba(217, 70, 239, 0.4)', bg: 'rgba(217, 70, 239, 0.1)', rgb: '217, 70, 239' },
            patisserie: { accent: '#f59e0b', glow: '0 0 20px rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)', rgb: '245, 158, 11' },
            vegetarien: { accent: '#22c55e', glow: '0 0 20px rgba(34, 197, 94, 0.4)', bg: 'rgba(34, 197, 94, 0.1)', rgb: '34, 197, 94' },
            restaurant: { accent: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)', rgb: '59, 130, 246' },
        };
        return categories[recipe.category] || categories.plats;
    }, [recipe.category]);

    // Persistence
    const [checkedSteps, setCheckedSteps] = useLocalStorage<boolean[]>(`recipe-steps-${recipe.id}`, new Array(recipe?.steps?.length || 0).fill(false));
    const [checkedIngredients, setCheckedIngredients] = useLocalStorage<boolean[]>(`recipe-ing-v2-${recipe.id}`, new Array(recipe?.ingredients?.length || 0).fill(false));

    // Reset logic
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const exitKey = `recipe-exit-${recipe.id}`;
            const lastExit = localStorage.getItem(exitKey);
            const RESET_DELAY = 5 * 60 * 60 * 1000;

            if (lastExit) {
                const timeSinceExit = Date.now() - parseInt(lastExit);
                if (timeSinceExit > RESET_DELAY) {
                    setCheckedSteps(new Array(recipe?.steps?.length || 0).fill(false));
                    setCheckedIngredients(new Array(recipe?.ingredients?.length || 0).fill(false));
                }
            }
            return () => localStorage.setItem(exitKey, Date.now().toString());
        }
    }, [recipe.id]);

    const ratio = useMemo(() => servings / (recipe.servings || 4), [servings, recipe.servings]);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        setServings(recipe.servings || 4);
        return () => clearTimeout(t);
    }, [recipe.id, recipe.servings]);

    useEffect(() => {
        if (recipe.category) {
            const event = new CustomEvent('magic-category-change', { detail: recipe.category });
            window.dispatchEvent(event);
        }
    }, [recipe.category]);

    useEffect(() => {
        let wakeLock: any = null;
        const requestWakeLock = async () => {
            try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); }
            catch (err) {}
        };
        requestWakeLock();
        return () => { if (wakeLock !== null) wakeLock.release(); };
    }, []);

    const triggerHaptic = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
    };

    const minSwipeDistance = 50;
    const maxVerticalDiff = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distanceX = touchStart.current.x - touchEnd.current.x;
        const distanceY = Math.abs(touchStart.current.y - touchEnd.current.y);
        if (distanceY > maxVerticalDiff || Math.abs(distanceX) < minSwipeDistance) return;
        if (distanceX > minSwipeDistance && nextId) {
            triggerHaptic(); setSlideDirection('left'); setIsNavigating(true);
            setTimeout(() => router.push(`/recipe/${nextId}`), 250);
        } else if (distanceX < -minSwipeDistance && prevId) {
            triggerHaptic(); setSlideDirection('right'); setIsNavigating(true);
            setTimeout(() => router.push(`/recipe/${prevId}`), 250);
        }
    };

    const switchTab = (tab: TabId) => {
        setPrevTab(activeTab);
        setActiveTab(tab);
        if (tabContentRef.current) tabContentRef.current.scrollTop = 0;
    };

    const toggleStep = (index: number) => {
        const newChecked = [...checkedSteps];
        newChecked[index] = !newChecked[index];
        setCheckedSteps(newChecked);
        triggerHaptic();
        if (newChecked[index]) {
            const minutes = parseDuration(recipe.steps[index]);
            if (minutes) startTimer(minutes, stripHtml(recipe.steps[index]).substring(0, 50));
        }
    };

    const toggleIngredient = (index: number) => {
        const newChecked = [...checkedIngredients];
        newChecked[index] = !newChecked[index];
        setCheckedIngredients(newChecked);
        triggerHaptic();
    };

    const copyIngredients = async () => {
        const selected = recipe.ingredients
            .filter((_, idx) => checkedIngredients[idx])
            .map(ing => `- ${scaleQuantity(ing.quantity || ing.name, ratio)} ${ing.quantity ? ing.name : ''}`);
        
        if (selected.length === 0) return alert('Sélectionnez des ingrédients !');
        
        const fullText = `🛒 ${recipe.title}\n\n${selected.join('\n')}`;
        await navigator.clipboard.writeText(fullText);
        
        const existing = JSON.parse(localStorage.getItem('magic-shopping-list') || '{}');
        existing[recipe.id] = { title: recipe.title, ingredients: selected.map(n => ({ name: n, checked: false })) };
        localStorage.setItem('magic-shopping-list', JSON.stringify(existing));
        window.dispatchEvent(new Event('shoppingListUpdated'));
        triggerHaptic();
    };

    const speak = (text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(stripHtml(text));
        utterance.lang = 'fr-FR';
        utterance.onstart = () => { setIsListening(false); };
        utterance.onend = () => { if (focusMode) setTimeout(startRecognition, 300); };
        window.speechSynthesis.speak(utterance);
    };

    const recognitionRef = useRef<any>(null);
    const startRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition || !focusMode) return;
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => { setIsListening(false); if (focusMode) setTimeout(startRecognition, 300); };
        recognition.onresult = (e: any) => {
            const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
            if (/suivant|prochain/.test(transcript)) handleNextStep();
            else if (/précédent|retour/.test(transcript)) handlePrevStep();
            else if (/répète/.test(transcript)) speak(recipe.steps[activeStepIndex]);
        };
        recognition.start();
        recognitionRef.current = recognition;
    }, [focusMode, activeStepIndex]);

    const handleNextStep = () => {
        if (activeStepIndex < recipe.steps.length - 1) setActiveStepIndex(activeStepIndex + 1);
        else setFocusMode(false);
    };

    const handlePrevStep = () => { if (activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1); };

    useEffect(() => {
        if (focusMode) { speak(recipe.steps[activeStepIndex]); startRecognition(); }
        return () => { window.speechSynthesis.cancel(); if (recognitionRef.current) recognitionRef.current.stop(); };
    }, [focusMode, activeStepIndex, startRecognition]);

    const progress = (checkedSteps.filter(Boolean).length / (recipe?.steps?.length || 1)) * 100;

    const countryFlags: Record<string, string> = { france: '🇫🇷', italie: '🇮🇹', espagne: '🇪🇸', grece: '🇬🇷', liban: '🇱🇧', usa: '🇺🇸', mexique: '🇲🇽', orient: '🕌', autre: '🗺️' };
    const recipeCountryTag = recipe.tags?.find(t => countryFlags[t.toLowerCase()]);
    const flag = recipeCountryTag ? countryFlags[recipeCountryTag.toLowerCase()] : null;

    return (
        <>
            {!focusMode && (
                <div className={styles.stickyHeaderMenu}>
                    <Header title={recipe.title} showBack={false} backUrl={`/category/${recipe.category}`} large={true} recipeId={recipe.id} />
                    <MagicFilterBar activeTags={recipe.tags || []} onSelect={(tag) => router.push(tag === '' ? '/' : `/?tag=${tag}`)} />
                </div>
            )}
            <div
                className={`${styles.page} ${mounted ? styles.pageVisible : ''} ${isNavigating ? (slideDirection === 'left' ? styles.slideOutLeft : styles.slideOutRight) : ''}`}
                style={{ '--dynamic-accent': theme.accent, '--dynamic-accent-glow': theme.glow, '--dynamic-accent-bg': theme.bg, '--dynamic-accent-rgb': theme.rgb } as any}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            >
                <div className={styles.heroNewLayout}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroTextColumn}>
                            <div className={styles.categoryTag} style={{ background: theme.bg, color: theme.accent } as any}>
                                <span>{recipe.category.toUpperCase()}</span>
                                {flag && <span className={styles.categoryFlag}>{flag}</span>}
                            </div>
                            <div className={styles.heroMainContent}>
                                <h1 className={styles.heroTitleElegant}><SplitTitle text={recipe.title} noAnimation={true} /></h1>
                                {recipe.description && <div className={styles.heroDescription} dangerouslySetInnerHTML={{ __html: recipe.description }} />}
                            </div>
                            {recipe.category !== 'restaurant' && recipe.steps.length > 0 && (
                                <button className={styles.heroFocusBtn} onClick={() => { setFocusMode(true); triggerHaptic(); }}>
                                    <span>Lancer la préparation</span>
                                </button>
                            )}
                        </div>
                        <div className={styles.heroImageColumn}>
                            <div className={styles.actions}>
                                <VoteButton recipeId={recipe.id} initialVotes={recipe.votes || 0} />
                                <ShareButton title={recipe.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
                                <FavoriteButton recipeId={recipe.id} initialFavorite={recipe.isFavorite} imageUrl={recipe.image} />
                            </div>
                            <div className={styles.imageCardContainer}>
                                {recipe.image ? <Image src={recipe.image} alt={recipe.title} fill className={styles.imageMain} priority /> : <div className={styles.imagePlaceholderLarge}>🍽️</div>}
                                <div className={styles.imageGlassOverlay} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.metaStrip}>
                    <div className={styles.metaItem}>
                        <span>{recipe.category === 'restaurant' ? '📍' : '👥'}</span>
                        <div>
                            <div className={styles.metaLabel}>{recipe.category === 'restaurant' ? 'Lieu' : 'Portions'}</div>
                            <div className={styles.metaValue}>{recipe.category === 'restaurant' ? (recipe.address || 'À découvrir') : servings}</div>
                        </div>
                    </div>
                    <div className={styles.metaDivider} />
                    <div className={styles.metaItem}>
                        <span>{recipe.category === 'restaurant' ? '💰' : '⭐'}</span>
                        <div>
                            <div className={styles.metaLabel}>{recipe.category === 'restaurant' ? 'Gamme' : 'Difficulté'}</div>
                            <div className={styles.metaValue}>{recipe.category === 'restaurant' ? 'Restaurant' : recipe.difficulty}</div>
                        </div>
                    </div>
                </div>

                {recipe.category === 'restaurant' && (
                    <div className={styles.practicalInfoSection}>
                        <div className={styles.addressCard}>
                            <span className={styles.metallicLabel}>ADRESSE POSTALE</span>
                            <div className={styles.addressDisplay}>
                                <div className={styles.addressIconWrap}>📍</div>
                                <div className={styles.addressValueLarge}>{recipe.address}</div>
                            </div>
                        </div>
                        {recipe.ingredients && (
                            <div className={styles.servicesGrid}>
                                {recipe.ingredients.map((s, i) => (
                                    <div key={i} className={styles.serviceCard}>✨ {s.name}</div>
                                ))}
                            </div>
                        )}
                        <div className={styles.actionButtonsGrid}>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(recipe.address || '')}`} target="_blank" className={styles.primaryActionBtn}>Google Maps</a>
                            <a href={`http://maps.apple.com/?q=${encodeURIComponent(recipe.address || '')}`} target="_blank" className={styles.primaryActionBtn}>Apple Plans</a>
                            {recipe.website && <a href={recipe.website} target="_blank" className={styles.primaryActionBtn}>Site Officiel</a>}
                        </div>
                    </div>
                )}

                {recipe.category !== 'restaurant' && (
                    <div className={styles.tabsWrapper}>
                        <div className={styles.tabsBar}>
                            {availableTabs.map(tab => (
                                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}>
                                    {tab.label} {tab.count !== undefined && <span className={styles.tabCount}>{tab.count}</span>}
                                </button>
                            ))}
                        </div>
                        <div className={styles.tabContent} ref={tabContentRef}>
                            {activeTab === 'ingredients' && (
                                <div className={styles.ingredientsList}>
                                    {recipe.ingredients.map((ing, i) => (
                                        <div key={i} className={`${styles.ingredientCard} ${checkedIngredients[i] ? styles.ingredientDone : ''}`} onClick={() => toggleIngredient(i)}>
                                            <div className={styles.ingIconWrap}>{getIngredientVisual(ing.name) || '🥗'}</div>
                                            <div className={styles.ingInfo}>
                                                <span className={styles.ingQty}>{scaleQuantity(ing.quantity || '', ratio)}</span>
                                                <span className={styles.ingName}>{ing.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className={styles.copyBtn} onClick={copyIngredients}>Ajouter au panier 🛒</button>
                                </div>
                            )}
                            {activeTab === 'steps' && (
                                <div className={styles.stepsList}>
                                    {recipe.steps.map((step, i) => (
                                        <div key={i} className={`${styles.stepCard} ${checkedSteps[i] ? styles.stepDone : ''}`} onClick={() => toggleStep(i)}>
                                            <div className={styles.stepBubble}>{checkedSteps[i] ? '✓' : i + 1}</div>
                                            <div className={styles.stepBody}><SmartText text={step} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'video' && recipe.videoHtml && <VideoSection videoHtml={recipe.videoHtml} />}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {focusMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.focusOverlay} style={{ '--dynamic-accent': theme.accent } as any}>
                        <div className={styles.focusHeader}>
                            <h2 className={styles.focusTitle}>{recipe.title}</h2>
                            <button onClick={() => setFocusMode(false)}>Quitter</button>
                        </div>
                        <div className={styles.focusContent}>
                            <div className={styles.focusStepCard}>
                                <div className={styles.focusStepNumber}>Étape {activeStepIndex + 1}</div>
                                <div className={styles.focusStepText}><SmartText text={recipe.steps[activeStepIndex]} /></div>
                            </div>
                        </div>
                        <div className={styles.focusHud}>
                            <button onClick={handlePrevStep} disabled={activeStepIndex === 0}>Précédent</button>
                            <button onClick={() => speak(recipe.steps[activeStepIndex])}>Répéter</button>
                            <button onClick={handleNextStep}>Suivant</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
