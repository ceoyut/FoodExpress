import React from 'react';
import { motion } from 'motion/react';

interface EmptyCartIllustrationProps {
  className?: string;
}

export const EmptyCartIllustration: React.FC<EmptyCartIllustrationProps> = ({ className = 'w-48 h-40' }) => {
  return (
    <motion.div 
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative mx-auto flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 240 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Subtle warm backdrop gradients */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#f0fdf4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Paper bag body gradient */}
          <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>

          {/* Bag rim gradient */}
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Soft Circular Backdrop */}
        <circle cx="120" cy="105" r="85" fill="url(#bgGlow)" />

        {/* Floor Shadow */}
        <ellipse cx="120" cy="172" rx="60" ry="8" fill="#e2e8f0" opacity="0.8" />

        {/* Floating culinary stars & sparkles */}
        {/* Sparkle 1 (Top Right) */}
        <path
          d="M 175 42 Q 175 48 181 48 Q 175 48 175 54 Q 175 48 169 48 Q 175 48 175 42 Z"
          fill="#10b981"
          opacity="0.9"
        />
        {/* Sparkle 2 (Top Left) */}
        <path
          d="M 64 62 Q 64 67 69 67 Q 64 67 64 72 Q 64 67 59 67 Q 64 67 64 62 Z"
          fill="#f59e0b"
          opacity="0.85"
        />
        {/* Sparkle 3 (Bottom Right) */}
        <path
          d="M 188 120 Q 188 123 191 123 Q 188 123 188 126 Q 188 123 185 123 Q 188 123 188 120 Z"
          fill="#059669"
          opacity="0.75"
        />

        {/* Floating Cute Dumpling / Dim Sum (Left) */}
        <g transform="translate(42, 90) rotate(-12)" filter="url(#softShadow)">
          <ellipse cx="18" cy="15" rx="16" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Pleats */}
          <path d="M 8 10 Q 18 4 28 10" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 12 12 Q 18 8 24 12" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Dim Sum Smiling Eyes */}
          <circle cx="14" cy="16" r="1.2" fill="#475569" />
          <circle cx="22" cy="16" r="1.2" fill="#475569" />
          <path d="M 16 19 Q 18 21 20 19" stroke="#475569" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Tiny blush */}
          <circle cx="11" cy="17" r="1.5" fill="#fda4af" opacity="0.7" />
          <circle cx="25" cy="17" r="1.5" fill="#fda4af" opacity="0.7" />
        </g>

        {/* Floating Cute Bubble Tea / Drink (Right) */}
        <g transform="translate(172, 85) rotate(14)" filter="url(#softShadow)">
          {/* Cup */}
          <path d="M 6 12 L 8 36 Q 15 40 22 36 L 24 12 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Liquid */}
          <path d="M 7.5 18 L 8.5 35 Q 15 38.5 21.5 35 L 22.5 18 Z" fill="#fed7aa" />
          {/* Straw */}
          <line x1="15" y1="2" x2="15" y2="12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tapioca Pearls */}
          <circle cx="11" cy="32" r="1.8" fill="#78350f" />
          <circle cx="15" cy="34" r="1.8" fill="#78350f" />
          <circle cx="19" cy="32" r="1.8" fill="#78350f" />
        </g>

        {/* Main Cute Delivery Bag Character */}
        <g filter="url(#softShadow)">
          {/* Bag Handles */}
          <path
            d="M 98 75 C 98 48, 142 48, 142 75"
            stroke="#c2410c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* Bag Main Body */}
          <path
            d="M 76 75 L 164 75 L 156 165 C 155.5 168, 153 170, 150 170 L 90 170 C 87 170, 84.5 168, 84 165 Z"
            fill="url(#bagGradient)"
            stroke="#ea580c"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Fold Lines on Bag */}
          <path d="M 85 75 L 91 168" stroke="#f97316" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 2" />
          <path d="M 155 75 L 149 168" stroke="#ea580c" strokeWidth="1.5" opacity="0.5" />

          {/* Bag Top Rim / Fold */}
          <path
            d="M 72 75 L 168 75 L 166 84 L 74 84 Z"
            fill="#ffedd5"
            stroke="#ea580c"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* App Logo Stamp on Bag (Emerald Badge with Fork/Spoon) */}
          <rect x="105" y="94" width="30" height="30" rx="8" fill="#059669" />
          {/* Fork & Spoon white silhouette */}
          <path
            d="M 116 102 L 116 114 M 114 102 L 118 102 M 114 105 L 118 105"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 124 102 Q 126 105 124 108 L 124 114"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Cute Smiling Face on Character */}
          {/* Happy Left Eye (Curved Arc ^) */}
          <path
            d="M 98 136 Q 103 131 108 136"
            stroke="#431407"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Happy Right Eye (Curved Arc ^) */}
          <path
            d="M 132 136 Q 137 131 142 136"
            stroke="#431407"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Rosy Blush Cheeks */}
          <ellipse cx="96" cy="142" rx="4.5" ry="3" fill="#f43f5e" opacity="0.45" />
          <ellipse cx="144" cy="142" rx="4.5" ry="3" fill="#f43f5e" opacity="0.45" />

          {/* Sweet Open Smile */}
          <path
            d="M 114 142 Q 120 151 126 142 Z"
            fill="#b91c1c"
            stroke="#7f1d1d"
            strokeWidth="1"
          />
          {/* Little tongue inside smile */}
          <path
            d="M 117 146 Q 120 150 123 146 Z"
            fill="#fca5a5"
          />
        </g>

        {/* Small floating green herb / mint leaf */}
        <path
          d="M 62 145 C 55 142, 54 135, 62 132 C 70 135, 69 142, 62 145 Z"
          fill="#10b981"
          opacity="0.85"
        />
        <line x1="58" y1="139" x2="66" y2="137" stroke="#064e3b" strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
};
