'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

    useEffect(() => {
        try {
            const dir = sessionStorage.getItem('swipe-direction') as 'left' | 'right' | null;
            if (dir) {
                setSwipeDir(dir);
                sessionStorage.removeItem('swipe-direction');
            }
        } catch {}
    }, []);

    // Swipe horizontal entre recettes : slide depuis la bonne direction
    const xInitial = swipeDir === 'left' ? '60vw' : swipeDir === 'right' ? '-60vw' : 0;
    const yInitial = swipeDir ? 0 : 15;
    const scaleInitial = swipeDir ? 1 : 0.98;

    return (
        <motion.div
            initial={{ opacity: 0, x: xInitial, y: yInitial, scale: scaleInitial }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 0, y: -15, scale: 0.98 }}
            transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
                mass: 0.7,
            }}
            style={{ minHeight: '100vh', overflow: 'visible' }}
        >
            {children}
        </motion.div>
    );
}
