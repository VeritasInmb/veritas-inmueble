
import React from 'react';

export const EnergyFlow: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
            
            {/* Background Grid Points */}
            <div className="absolute inset-0 opacity-[0.03]" 
                style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                    backgroundSize: '24px 24px' 
                }}>
            </div>

            {/* SVG Connecting Line: S-Curve from Top-Left to Bottom-Right */}
            <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 400 600" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                        <stop offset="20%" stopColor="#ef4444" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="80%" stopColor="#10b981" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* The Path: Starts near Top Left card, goes through center, ends near Bottom Right card */}
                {/* M x,y (Top Left) C cp1x,cp1y cp2x,cp2y x,y (Bottom Right) */}
                <path 
                    d="M 80 100 C 80 250, 320 350, 320 500" 
                    fill="none" 
                    stroke="url(#energyGradient)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="8, 8"
                    className="opacity-30"
                />
                 <path 
                    d="M 80 100 C 80 250, 320 350, 320 500" 
                    fill="none" 
                    stroke="url(#energyGradient)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="energy-line-path opacity-80"
                />
            </svg>
        </div>
    );
};
