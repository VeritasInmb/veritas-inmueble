
import React, { useMemo } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  color?: string;
  userId?: string; // Used for deterministic fallback
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, color, userId, className = "w-10 h-10" }) => {
  
  // Helper: Generates a deterministic color based on a string seed (userId or name)
  // Uses HSL to ensure aesthetic consistency (Sat 70%, Light 50%)
  const deterministicColor = useMemo(() => {
    const seed = userId || name || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }, [userId, name]);

  // 1. Show Image if available
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name} 
        className={`${className} rounded-full object-cover shadow-sm border border-slate-100 bg-white`} 
      />
    );
  }

  // 2. Determine Style vs Class logic
  // Case A: Legacy Color (Tailwind class like 'bg-red-500')
  const isLegacyColor = color?.startsWith('bg-');
  // Case B: New System (Hex/HSL) or Fallback
  const finalStyleColor = isLegacyColor ? undefined : (color || deterministicColor);
  
  // 3. Get Initials
  const initials = name 
    ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'US';

  return (
    <div 
      className={`${className} ${isLegacyColor ? color : ''} rounded-full flex items-center justify-center text-white font-bold shadow-sm border border-white/10 select-none overflow-hidden`}
      style={!isLegacyColor ? { backgroundColor: finalStyleColor } : undefined}
    >
      <span style={{ fontSize: '40%', textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>{initials}</span>
    </div>
  );
};
