'use client';

import React from 'react';

interface BadgeGraphicProps {
  type: string;
  unlocked?: boolean;
  className?: string;
}

export function BadgeGraphic({ type, unlocked = true, className = "w-full h-full" }: BadgeGraphicProps) {
  const outerHex = "50,5 95,30 95,100 50,125 5,100 5,30";
  const leftBevel = "50,5 50,125 5,100 5,30";
  const innerHex = "50,15 85,35 85,95 50,115 15,95 15,35";
  const innerShadow = "50,15 85,35 85,95 50,115";

  return (
    <svg
      viewBox="0 0 100 130"
      className={`${className} drop-shadow-md transition-all duration-300 ${!unlocked ? 'grayscale opacity-50' : ''}`}
    >
      {type === 'sword-crown' && (
        <g>
          <polygon points={outerHex} fill="#b8860b" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#0a2a43" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 50,25 L 50,105 M 25,50 L 75,80 M 25,80 L 75,50" stroke="#4682b4" strokeWidth="2" opacity="0.4" />
          <path d="M 25,70 L 35,80 L 50,65 L 65,80 L 75,70 L 70,90 L 30,90 Z" fill="#daa520" />
          <polygon points="50,35 58,55 50,95 42,55" fill="#a9c2d9" />
          <rect x="40" y="90" width="20" height="5" fill="#4682b4" />
          <rect x="47" y="95" width="6" height="10" fill="#2c3e50" />
        </g>
      )}

      {type === 'potion' && (
        <g>
          <polygon points={outerHex} fill="#2980b9" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#0d1f2d" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,75 C 30,95 70,95 70,75 C 70,65 60,60 60,50 L 60,40 L 40,40 L 40,50 C 40,60 30,65 30,75 Z" fill="#81ecec" />
          <path d="M 32,75 C 45,80 55,70 68,75 C 65,90 35,90 32,75 Z" fill="#00cec9" opacity="0.7" />
          <rect x="47" y="90" width="6" height="15" fill="#81ecec" />
          <rect x="42.5" y="94.5" width="15" height="6" fill="#81ecec" />
          <rect x="42" y="35" width="16" height="8" fill="#4a69bd" />
        </g>
      )}

      {type === 'mountain' && (
        <g>
          <polygon points={outerHex} fill="#b2bec3" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#2d3436" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 35,50 L 42,60 L 50,45 L 58,60 L 65,50 L 60,65 L 40,65 Z" fill="#f1c40f" />
          <polygon points="15,87 40,55 60,75 70,65 85,87" fill="#74b9ff" />
          <polygon points="40,55 32,64 43,66 48,61" fill="#dfe6e9" />
          <polygon points="70,65 64,72 73,74" fill="#dfe6e9" />
          <polygon points="15,87 85,87 50,105" fill="#0984e3" />
        </g>
      )}

      {type === 'flower' && (
        <g>
          <polygon points={outerHex} fill="#00b894" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#004d40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <circle cx="50" cy="70" r="12" fill="#55efc4" />
          <path d="M 50,58 C 40,40 60,40 50,58 Z" fill="#81ecec" />
          <path d="M 50,82 C 40,100 60,100 50,82 Z" fill="#81ecec" />
          <path d="M 38,70 C 20,60 20,80 38,70 Z" fill="#81ecec" />
          <path d="M 62,70 C 80,60 80,80 62,70 Z" fill="#81ecec" />
        </g>
      )}

      {type === 'skull-arrows' && (
        <g>
          <polygon points={outerHex} fill="#6c5ce7" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#1e152a" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,55 L 70,85 M 70,55 L 30,85" stroke="#a29bfe" strokeWidth="4" />
          <circle cx="50" cy="65" r="14" fill="#fd79a8" />
          <circle cx="44" cy="62" r="3" fill="#1e152a" />
          <circle cx="56" cy="62" r="3" fill="#1e152a" />
          <path d="M 45,73 L 55,73" stroke="#1e152a" strokeWidth="2" />
        </g>
      )}

      {type === 'star' && (
        <g>
          <polygon points={outerHex} fill="#fdcb6e" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#2d1d00" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 50,35 L 54,48 L 68,48 L 57,56 L 61,70 L 50,61 L 39,70 L 43,56 L 32,48 L 46,48 Z" fill="#ffeaa7" />
          <circle cx="50" cy="55" r="6" fill="#e17055" />
        </g>
      )}

      {type === 'shield-book' && (
        <g>
          <polygon points={outerHex} fill="#e17055" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#2b0900" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,45 C 30,45 50,35 50,35 C 50,35 70,45 70,45 C 70,75 50,90 50,90 C 50,90 30,75 30,45 Z" fill="#fab1a0" />
          <path d="M 38,55 L 50,50 L 62,55 L 62,75 L 50,70 L 38,75 Z" fill="#d63031" />
        </g>
      )}

      {type === 'lightning' && (
        <g>
          <polygon points={outerHex} fill="#00cec9" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#002b2a" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <polygon points="55,30 35,65 50,65 45,100 65,60 50,60" fill="#74b9ff" />
        </g>
      )}
    </svg>
  );
}

export default BadgeGraphic;
