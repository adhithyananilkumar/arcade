'use client';

import React, { useRef, useEffect, useState, useMemo, CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  onLetterAnimationComplete?: () => void;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag: Tag = 'p',
  onLetterAnimationComplete,
  style = {}
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
  }, []);

  const elements = useMemo(() => {
    if (!text) return [];

    if (splitType === 'words') {
      return text.split(/(\s+)/).map((part, index) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) {
          return (
            <span key={`space-${index}`} className="split-whitespace inline">
              {part.replace(/ /g, '\u00A0')}
            </span>
          );
        }
        return (
          <span
            key={`word-${index}`}
            className="split-word inline-block will-change-[transform,opacity]"
          >
            {part}
          </span>
        );
      });
    }

    if (splitType === 'lines') {
      return text.split('\n').map((line, index) => (
        <span
          key={`line-${index}`}
          className="split-line block will-change-[transform,opacity]"
        >
          {line || '\u00A0'}
        </span>
      ));
    }

    // Default 'chars' or 'words, chars'
    return text.split(/(\s+)/).map((word, wIndex) => {
      if (!word) return null;
      if (/^\s+$/.test(word)) {
        return (
          <span key={`space-${wIndex}`} className="split-whitespace inline">
            {word.replace(/ /g, '\u00A0')}
          </span>
        );
      }
      return (
        <span key={`w-${wIndex}`} className="split-word inline-block whitespace-nowrap">
          {Array.from(word).map((char, cIndex) => (
            <span
              key={`c-${wIndex}-${cIndex}`}
              className="split-char inline-block will-change-[transform,opacity]"
              style={{
                color: 'inherit',
                background: 'inherit',
                WebkitBackgroundClip: 'inherit',
                WebkitTextFillColor: 'inherit',
              }}
            >
              {char}
            </span>
          ))}
        </span>
      );
    });
  }, [text, splitType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = rootRef.current;
    if (!root || !text || !fontsLoaded) return;
    if (animationCompletedRef.current) return;

    const targets = root.querySelectorAll(
      splitType === 'words'
        ? '.split-word'
        : splitType === 'lines'
          ? '.split-line'
          : '.split-char'
    );

    if (!targets.length) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const activeDuration = reduceMotion ? Math.min(duration, 0.2) : duration;
    const activeStagger = reduceMotion ? 0 : delay / 1000;

    gsap.set(targets, {
      ...from,
      force3D: true
    });

    const play = () => {
      gsap.to(targets, {
        ...to,
        duration: activeDuration,
        ease: reduceMotion ? 'power1.out' : ease,
        stagger: activeStagger,
        onComplete: () => {
          animationCompletedRef.current = true;
          onCompleteRef.current?.();
        },
        willChange: 'transform, opacity',
        force3D: true
      });
    };

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0
        ? ''
        : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const trigger = ScrollTrigger.create({
      trigger: root,
      start,
      once: true,
      onEnter: play
    });

    return () => {
      trigger.kill();
      gsap.killTweensOf(targets);
    };
  }, [text, delay, duration, ease, splitType, from, to, threshold, rootMargin, fontsLoaded]);

  const rootStyle: CSSProperties = {
    textAlign,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    ...style
  };

  const Component = Tag as any;

  return (
    <Component
      ref={rootRef}
      className={`split-parent ${className}`.trim()}
      style={rootStyle}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="split-visual inline">
        {elements}
      </span>
    </Component>
  );
};

export default SplitText;
