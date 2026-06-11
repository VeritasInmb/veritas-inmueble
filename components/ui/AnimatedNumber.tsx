
import React, { useState, useEffect, useRef } from 'react';

export const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => { 
        const observer = new IntersectionObserver(([entry]) => { 
            if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } 
        }, { threshold: 0.1 }); 
        if (ref.current) observer.observe(ref.current); 
        return () => { if (ref.current) observer.unobserve(ref.current); }; 
    }, []);
    useEffect(() => {
        if (!isInView || value === 0) return;
        const end = value;
        if (count === end) return;
        const duration = 1200;
        let startTime: number | null = null;
        let animationFrameId: number;
        const frame = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const currentStartTime = startTime ?? timestamp;
            const elapsed = timestamp - currentStartTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(frame);
            } else {
                setCount(end);
            }
        };
        animationFrameId = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value, isInView]);
    return <span ref={ref}>{count.toLocaleString('es-MX')}</span>;
};
