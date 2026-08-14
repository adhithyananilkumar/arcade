'use client';

import React from 'react';

export interface BadgeGraphicProps {
  type: string;
  className?: string;
}

export function getBadgeForCourse(identifier?: string): { type: string; title: string; badgeName: string } {
  if (!identifier) {
    return { type: 'crystal', title: 'UI/UX Product Design Badge', badgeName: 'Certified UI/UX Specialist' };
  }

  const lower = identifier.toLowerCase();

  if (lower.includes('react') || lower.includes('sword')) {
    return { type: 'sword-crown', title: 'React Fundamentals Badge', badgeName: 'Certified React Developer' };
  }
  if (lower.includes('next') || lower.includes('potion')) {
    return { type: 'potion', title: 'Advanced Next.js Badge', badgeName: 'Certified Next.js Specialist' };
  }
  if (lower.includes('typescript') || lower.includes('ts') || lower.includes('mountain')) {
    return { type: 'mountain', title: 'TypeScript Masterclass Badge', badgeName: 'Certified TypeScript Engineer' };
  }
  if (lower.includes('system') || lower.includes('architecture') || lower.includes('flower')) {
    return { type: 'flower', title: 'System Architecture Badge', badgeName: 'Certified System Architect' };
  }
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('skull')) {
    return { type: 'skull-arrows', title: 'Cloud DevOps Badge', badgeName: 'Certified DevOps Engineer' };
  }
  if (lower.includes('stack') || lower.includes('full') || lower.includes('star')) {
    return { type: 'star', title: 'Full Stack Master Badge', badgeName: 'Certified Full-Stack Developer' };
  }
  if (lower.includes('backend') || lower.includes('shield')) {
    return { type: 'shield-book', title: 'Backend Specialist Badge', badgeName: 'Certified Backend Specialist' };
  }
  if (lower.includes('performance') || lower.includes('lightning') || lower.includes('speed')) {
    return { type: 'lightning', title: 'Performance Guru Badge', badgeName: 'Certified Optimization Guru' };
  }
  if (lower.includes('algo') || lower.includes('data-structure') || lower.includes('science') || lower.includes('intro-to-prog')) {
    return { type: 'atom-science', title: 'Algorithms & Data Structures Badge', badgeName: 'Certified Computer Scientist' };
  }
  if (lower.includes('security') || lower.includes('cyber') || lower.includes('flame') || lower.includes('fire')) {
    return { type: 'fire-flame', title: 'Web Security Pro Badge', badgeName: 'Certified Security Specialist' };
  }
  if (lower.includes('database') || lower.includes('sql') || lower.includes('code') || lower.includes('relational')) {
    return { type: 'code-brackets', title: 'Database Architect Badge', badgeName: 'Certified Database Engineer' };
  }
  if (lower.includes('mobile') || lower.includes('app') || lower.includes('compass')) {
    return { type: 'compass-navigation', title: 'Mobile App Engineer Badge', badgeName: 'Certified Mobile Developer' };
  }
  if (lower.includes('ai') || lower.includes('machine') || lower.includes('chip') || lower.includes('cpu')) {
    return { type: 'cpu-chip', title: 'AI / ML Specialist Badge', badgeName: 'Certified AI Engineer' };
  }
  if (lower.includes('open') || lower.includes('target') || lower.includes('champ')) {
    return { type: 'target-bullseye', title: 'Open Source Champion Badge', badgeName: 'Certified Open Source Champion' };
  }

  // Default for UI / UX or any other design course
  return { type: 'crystal', title: 'UI/UX Product Design Badge', badgeName: 'Certified UI/UX Specialist' };
}

export function BadgeGraphic({ type, className = '' }: BadgeGraphicProps) {
  // Shape Paths for elongated vertical hexagon (viewBox 0 0 100 130)
  const outerHex = "50,8 92,30 92,100 50,122 8,100 8,30";
  const innerHex = "50,17 84,35 84,95 50,113 16,95 16,35";
  const innerShadow = "50,17 84,35 84,95 50,113";

  return (
    <svg viewBox="0 0 100 130" className={`w-full h-full drop-shadow-lg filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.3)] overflow-visible ${className}`}>
      {/* 1. Sword and Crown */}
      {type === 'sword-crown' && (
        <g>
          <polygon points={outerHex} fill="#b8860b" />
          <polygon points={innerHex} fill="#0a2a43" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 50,25 L 50,105 M 25,50 L 75,80 M 25,80 L 75,50" stroke="#4682b4" strokeWidth="2" opacity="0.4" />
          <path d="M 25,70 L 35,80 L 50,65 L 65,80 L 75,70 L 70,90 L 30,90 Z" fill="#daa520" />
          <polygon points="50,35 58,55 50,95 42,55" fill="#a9c2d9" />
          <rect x="40" y="90" width="20" height="5" fill="#4682b4" />
          <rect x="47" y="95" width="6" height="10" fill="#2c3e50" />
        </g>
      )}

      {/* 2. Potion */}
      {type === 'potion' && (
        <g>
          <polygon points={outerHex} fill="#2980b9" />
          <polygon points={innerHex} fill="#0d1f2d" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 30,75 C 30,95 70,95 70,75 C 70,65 60,60 60,50 L 60,40 L 40,40 L 40,50 C 40,60 30,65 30,75 Z" fill="#81ecec" />
          <path d="M 32,75 C 45,80 55,70 68,75 C 65,90 35,90 32,75 Z" fill="#00cec9" opacity="0.6" />
          <rect x="47" y="90" width="6" height="15" fill="#81ecec" />
          <rect x="42.5" y="94.5" width="15" height="6" fill="#81ecec" />
          <rect x="42" y="35" width="16" height="8" fill="#4a69bd" />
        </g>
      )}

      {/* 3. Mountain Peak */}
      {type === 'mountain' && (
        <g>
          <polygon points={outerHex} fill="#b2bec3" />
          <polygon points={innerHex} fill="#2d3436" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 35,50 L 42,60 L 50,45 L 58,60 L 65,50 L 60,65 L 40,65 Z" fill="#f1c40f" />
          <polygon points="15,87 40,55 60,75 70,65 85,87" fill="#74b9ff" />
          <polygon points="40,55 32,64 43,66 48,61" fill="#dfe6e9" />
          <polygon points="70,65 64,72 73,74" fill="#dfe6e9" />
          <polygon points="15,87 85,87 50,105" fill="#0984e3" />
        </g>
      )}

      {/* 4. Flower/Leaf */}
      {type === 'flower' && (
        <g>
          <polygon points={outerHex} fill="#00b894" />
          <polygon points={innerHex} fill="#004d40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 50,35 C 65,50 65,60 50,70 C 35,60 35,50 50,35 Z" fill="#55efc4" />
          <path d="M 50,70 C 65,60 75,70 70,85 C 60,85 55,75 50,70 Z" fill="#55efc4" />
          <path d="M 50,70 C 35,60 25,70 30,85 C 40,85 45,75 50,70 Z" fill="#55efc4" />
          <circle cx="50" cy="70" r="5" fill="#ffeaa7" />
          <rect x="47" y="90" width="6" height="14" fill="#55efc4" />
          <rect x="43" y="94" width="14" height="6" fill="#55efc4" />
        </g>
      )}

      {/* 5. Skull and Arrows */}
      {type === 'skull-arrows' && (
        <g>
          <polygon points={outerHex} fill="#e1b12c" />
          <polygon points={innerHex} fill="#2f3640" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <line x1="25" y1="50" x2="75" y2="90" stroke="#e84118" strokeWidth="4" />
          <polygon points="70,93 78,85 78,93" fill="#e84118" />
          <line x1="75" y1="50" x2="25" y2="90" stroke="#e84118" strokeWidth="4" />
          <polygon points="30,93 22,85 22,93" fill="#e84118" />
          <path d="M 35,60 C 35,45 65,45 65,60 L 65,70 L 60,80 L 40,80 L 35,70 Z" fill="#dcdde1" />
          <circle cx="43" cy="65" r="4" fill="#2f3640" />
          <circle cx="57" cy="65" r="4" fill="#2f3640" />
          <polygon points="50,70 48,74 52,74" fill="#2f3640" />
          <line x1="45" y1="80" x2="45" y2="75" stroke="#2f3640" strokeWidth="2" />
          <line x1="50" y1="80" x2="50" y2="75" stroke="#2f3640" strokeWidth="2" />
          <line x1="55" y1="80" x2="55" y2="75" stroke="#2f3640" strokeWidth="2" />
        </g>
      )}

      {/* 6. Star */}
      {type === 'star' && (
        <g>
          <polygon points={outerHex} fill="#8e44ad" />
          <polygon points={innerHex} fill="#2c3e50" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <polygon points="50,40 55,55 70,55 58,65 62,80 50,72 38,80 42,65 30,55 45,55" fill="#f1c40f" />
          <polygon points="50,40 55,55 50,72 38,80 42,65 30,55 45,55" fill="#f39c12" opacity="0.5" />
        </g>
      )}

      {/* 7. Shield-Book */}
      {type === 'shield-book' && (
        <g>
          <polygon points={outerHex} fill="#c0392b" />
          <polygon points={innerHex} fill="#641e16" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 35,55 L 50,60 L 65,55 L 65,75 L 50,80 L 35,75 Z" fill="#ecf0f1" />
          <path d="M 35,55 L 50,60 L 50,80 L 35,75 Z" fill="#bdc3c7" />
          <polygon points="45,50 55,50 55,75 50,70 45,75" fill="#e74c3c" />
        </g>
      )}

      {/* 8. Lightning */}
      {type === 'lightning' && (
        <g>
          <polygon points={outerHex} fill="#f39c12" />
          <polygon points={innerHex} fill="#7e5109" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <polygon points="55,35 35,65 50,65 45,95 65,60 50,60" fill="#f1c40f" />
          <polygon points="55,35 50,65 45,95 65,60 50,60" fill="#f39c12" opacity="0.5" />
        </g>
      )}

      {/* 9. Crystal */}
      {type === 'crystal' && (
        <g>
          <polygon points={outerHex} fill="#e84393" />
          <polygon points={innerHex} fill="#6c5ce7" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <polygon points="50,40 65,55 50,85 35,55" fill="#a29bfe" />
          <polygon points="50,40 65,55 50,85" fill="#dfe6e9" opacity="0.4" />
          <polygon points="50,40 35,55 50,85" fill="#636e72" opacity="0.2" />
          <polygon points="45,35 55,35 60,45 40,45" fill="#74b9ff" />
          <polygon points="45,35 55,35 50,40" fill="#0984e3" />
        </g>
      )}

      {/* 10. Atom Science */}
      {type === 'atom-science' && (
        <g>
          <polygon points={outerHex} fill="#00cec9" />
          <polygon points={innerHex} fill="#051923" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <ellipse cx="50" cy="65" rx="25" ry="10" fill="none" stroke="#81ecec" strokeWidth="2.5" transform="rotate(-30 50 65)" />
          <ellipse cx="50" cy="65" rx="25" ry="10" fill="none" stroke="#81ecec" strokeWidth="2.5" transform="rotate(30 50 65)" />
          <circle cx="50" cy="65" r="7" fill="#74b9ff" />
          <circle cx="50" cy="65" r="4" fill="#ffffff" />
        </g>
      )}

      {/* 11. Fire Flame */}
      {type === 'fire-flame' && (
        <g>
          <polygon points={outerHex} fill="#ff7675" />
          <polygon points={innerHex} fill="#4a0e17" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 50,35 C 40,55 30,65 30,78 C 30,90 40,95 50,95 C 60,95 70,90 70,78 C 70,65 60,55 50,35 Z" fill="#e17055" />
          <path d="M 50,50 C 43,62 36,70 36,80 C 36,88 42,91 50,91 C 58,91 64,88 64,80 C 64,70 57,62 50,50 Z" fill="#fdcb6e" />
          <path d="M 50,65 C 46,72 42,76 42,82 C 42,86 45,88 50,88 C 58,88 58,86 58,82 C 58,76 54,72 50,65 Z" fill="#ffffff" />
        </g>
      )}

      {/* 12. Code Brackets */}
      {type === 'code-brackets' && (
        <g>
          <polygon points={outerHex} fill="#30336b" />
          <polygon points={innerHex} fill="#130f40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <path d="M 38,45 L 28,55 L 28,62 L 35,65 L 28,68 L 28,75 L 38,85" fill="none" stroke="#f1c40f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 62,45 L 72,55 L 72,62 L 65,65 L 72,68 L 72,75 L 62,85" fill="none" stroke="#f1c40f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="54" y1="45" x2="46" y2="85" stroke="#48dbfb" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {/* 13. Compass Navigation */}
      {type === 'compass-navigation' && (
        <g>
          <polygon points={outerHex} fill="#d35400" />
          <polygon points={innerHex} fill="#3d1e03" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <circle cx="50" cy="65" r="28" fill="none" stroke="#f39c12" strokeWidth="2.5" />
          <polygon points="50,40 55,65 50,65" fill="#e74c3c" />
          <polygon points="50,40 45,65 50,65" fill="#c0392b" />
          <polygon points="50,90 55,65 50,65" fill="#ecf0f1" />
          <polygon points="50,90 45,65 50,65" fill="#bdc3c7" />
          <circle cx="50" cy="65" r="4" fill="#f1c40f" />
        </g>
      )}

      {/* 14. CPU Chip */}
      {type === 'cpu-chip' && (
        <g>
          <polygon points={outerHex} fill="#0984e3" />
          <polygon points={innerHex} fill="#001427" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <rect x="35" y="50" width="30" height="30" rx="4" fill="#00cec9" stroke="#74b9ff" strokeWidth="2" />
          <rect x="42" y="57" width="16" height="16" rx="2" fill="#001427" />
          <line x1="40" y1="42" x2="40" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="50" y1="42" x2="50" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="60" y1="42" x2="60" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="40" y1="80" x2="40" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="50" y1="80" x2="50" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="60" y1="80" x2="60" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="55" x2="35" y2="55" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="65" x2="35" y2="65" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="75" x2="35" y2="75" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="55" x2="73" y2="55" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="65" x2="73" y2="65" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="75" x2="73" y2="75" stroke="#00cec9" strokeWidth="2.5" />
        </g>
      )}

      {/* 15. Target Bullseye */}
      {type === 'target-bullseye' && (
        <g>
          <polygon points={outerHex} fill="#6c5ce7" />
          <polygon points={innerHex} fill="#111111" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          <circle cx="50" cy="65" r="26" fill="none" stroke="#ff7675" strokeWidth="3" />
          <circle cx="50" cy="65" r="17" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="50" cy="65" r="8" fill="#d63031" />
          <line x1="20" y1="65" x2="80" y2="65" stroke="#fdcb6e" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50" y1="35" x2="50" y2="95" stroke="#fdcb6e" strokeWidth="2" strokeDasharray="3 3" />
        </g>
      )}
    </svg>
  );
}

export default BadgeGraphic;
