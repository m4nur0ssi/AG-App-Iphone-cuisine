'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    // Read swipe config synchronously on first render, before framer-motion captures `initial`.
    // useRef with undefined sentinel = runs once per component instance (re-runs on each navigation).
    const configRef = useRef<{
        skip: boolean;
        xInitial: string | number;
        yInitial: number;
    } | undefined>(undefined);

    if (configRef.current === undefined) {
        let skip = false;
        let xInitial: string | number = 0;
        let yInitial = 12;

        if (typeof window !== 'undefined') {
            try {
                const noEntry = sessionStorage.getItem('swipe-no-entry');
                if (noEntry) {
                    // Swipe was driven by finger — old page already animated off, new page appears instantly
                    skip = true;
                    sessionStorage.removeItem('swipe-no-entry');
                    sessionStorage.removeItem('swipe-direction');
                } else {
                    const dir = sessionStorage.getItem('swipe-direction') as 'left' | 'right' | null;
                    if (dir) {
                        xInitial = dir === 'left' ? '60vw' : '-60vw';
                        yInitial = 0;
                        sessionStorage.removeItem('swipe-direction');
                    }
                }
            } catch {}
        }

        configRef.current = { skip, xInitial, yInitial };
    }

    const { skip, xInitial, yInitial } = configRef.current;

    // Swipe was finger-driven: new page appears without animation (old page already slid off)
    if (skip) {
        return (
            <div style={{ minHeight: '100vh', overflow: 'visible' }}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: xInitial, y: yInitial }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
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
