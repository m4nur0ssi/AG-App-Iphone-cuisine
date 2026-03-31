'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VoteButton.module.css';

interface VoteButtonProps {
    recipeId: string;
    initialVotes?: number;
    className?: string;
    hideCount?: boolean;
}

const FlameIcon = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#ff3b30" : "none"} stroke={active ? "#ff3b30" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 2.5.5 4.5 2.5 4.5 5.5a3 3 0 0 1-6 0c0-1 .5-2 1-3-.5 1-1 2-1 3Z" />
        <path d="M15.81 10.31a6.48 6.48 0 0 1 1.69 4.19 5.5 5.5 0 1 1-11 0c0-3.98 3.17-7.22 7.12-7.48.33-.02.66-.02.99 0 .2.01.4.03.6.06.8.11 1.55.38 2.22.78.33.2.6.45.81.74a.16.16 0 0 1-.24.21Z" />
    </svg>
);

export default function VoteButton({ recipeId, initialVotes = 0, className, hideCount = false }: VoteButtonProps) {
    const [votes, setVotes] = useState(initialVotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const votedRecipes = JSON.parse(localStorage.getItem('voted_recipes') || '[]');
        setHasVoted(votedRecipes.includes(recipeId));

        fetch(`/api/votes?recipeId=${recipeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.votes !== undefined) setVotes(data.votes);
            })
            .catch(() => {});
    }, [recipeId]);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setHasVoted(true);
        setVotes(prev => prev + 1);
        
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800);

        let votedRecipes = JSON.parse(localStorage.getItem('voted_recipes') || '[]');
        if (!votedRecipes.includes(recipeId)) votedRecipes.push(recipeId);
        localStorage.setItem('voted_recipes', JSON.stringify(votedRecipes));

        try {
            await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId, action: 'add' })
            });
        } catch (err) {}
    };

    const hasAnyVotes = votes > 0;

    return (
        <div 
            className={`${className || ''}`}
            onClick={handleVote}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
            <motion.div 
                animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <FlameIcon active={hasVoted} />
            </motion.div>
            
            <AnimatePresence>
                {hasAnyVotes && !hideCount && (
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ fontSize: '15px', fontWeight: '900', color: '#ff3b30', textShadow: '0 0 12px rgba(255, 59, 48, 0.4)' }}
                    >
                        {votes}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
