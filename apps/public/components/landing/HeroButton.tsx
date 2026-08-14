"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './HeroButton.css';

interface HeroButtonProps {
  href: string;
  id?: string;
  text?: string;
}

export default function HeroButton({ href, id, text = "Get Started" }: HeroButtonProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAnimating) return; // Prevent double clicks
    
    setIsAnimating(true);
    
    // Allow the active animation to play for 1.2 seconds before navigating
    setTimeout(() => {
      router.push(href);
    }, 1200);
  };

  return (
    <>
      <Link 
        href={href} 
        className={`hero-hand-drawn-btn ${isAnimating ? 'is-active' : ''}`} 
        id={id}
        onClick={handleClick}
      >
        {/* Original Lightning Bolt Icon replacing the original spaceship */}
        <svg
          className="button-cosm"
          fill="#000000"
          width="128"
          height="128"
          viewBox="0 0 200 256"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M110 20 L20 140 L95 140 L70 240 L180 110 L105 110 Z"></path>
        </svg>

        {/* Original Bezier Curve replacing the squiggly line */}
        <svg
          className="highlight"
          viewBox="0 0 150 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeMiterlimit="10"
            d="M 15 55 Q 45 25 75 55 T 135 55"
          ></path>
        </svg>
        {text}
      </Link>

      <svg height="0" width="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <filter id="handDrawnNoise">
          <feTurbulence result="noise" numOctaves="8" baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale="3" in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoise2">
          <feTurbulence result="noise" numOctaves="8" baseFrequency="0.1" seed="1010" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale="3" in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset">
          <feTurbulence result="noise" numOctaves="8" baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale="6" in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset2">
          <feTurbulence result="noise" numOctaves="8" baseFrequency="0.1" seed="1010" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale="6" in2="noise" in="SourceGraphic" />
        </filter>
      </svg>
    </>
  );
}
