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
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isPressed) return;
    setIsPressed(true);
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  return (
    <Link 
      href={href} 
      className={`hero-black-pill-btn ${isPressed ? 'is-pressed' : ''}`} 
      id={id}
      onClick={handleClick}
    >
      <span className="hero-black-pill-text">{text}</span>
    </Link>
  );
}
