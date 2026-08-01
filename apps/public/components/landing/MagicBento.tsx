"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

export interface MagicBentoCardData {
  color: string;
  title: string;
  description: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const defaultCardData: MagicBentoCardData[] = [
  {
    color: '#120F17',
    title: 'Analytics',
    description: 'Track user behavior',
    label: 'Insights'
  },
  {
    color: '#120F17',
    title: 'Dashboard',
    description: 'Centralized data view',
    label: 'Overview'
  },
  {
    color: '#120F17',
    title: 'Collaboration',
    description: 'Work together seamlessly',
    label: 'Teamwork'
  },
  {
    color: '#120F17',
    title: 'Automation',
    description: 'Streamline workflows',
    label: 'Efficiency'
  },
  {
    color: '#120F17',
    title: 'Integration',
    description: 'Connect favorite tools',
    label: 'Connectivity'
  },
  {
    color: '#120F17',
    title: 'Security',
    description: 'Enterprise-grade protection',
    label: 'Protection'
  }
];


const useCardInteractions = ({
  cardRef,
  enableTilt,
  enableMagnetism,
  clickEffect,
  glowColor,
  disableAnimations,
  onMouseEnterCallback,
  onMouseLeaveCallback,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  glowColor: string;
  disableAnimations: boolean;
  onMouseEnterCallback?: () => void;
  onMouseLeaveCallback?: () => void;
}) => {
  const enterRef = useRef(onMouseEnterCallback);
  const leaveRef = useRef(onMouseLeaveCallback);

  useEffect(() => {
    enterRef.current = onMouseEnterCallback;
    leaveRef.current = onMouseLeaveCallback;
  }, [onMouseEnterCallback, onMouseLeaveCallback]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;
    
    let ctx = gsap.context(() => {}, element);
    
    const setRotateX = gsap.quickTo(element, "rotateX", { duration: 0.1, ease: 'power2.out' });
    const setRotateY = gsap.quickTo(element, "rotateY", { duration: 0.1, ease: 'power2.out' });
    const setX = gsap.quickTo(element, "x", { duration: 0.3, ease: 'power2.out' });
    const setY = gsap.quickTo(element, "y", { duration: 0.3, ease: 'power2.out' });

    const handleMouseEnter = () => {
      enterRef.current?.();
      if (enableTilt) {
        setRotateX(5);
        setRotateY(5);
      }
    };

    const handleMouseLeave = () => {
      leaveRef.current?.();
      if (enableTilt) {
        setRotateX(0);
        setRotateY(0);
      }
      if (enableMagnetism) {
        setX(0);
        setY(0);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        setRotateX(((y - centerY) / centerY) * -10);
        setRotateY(((x - centerX) / centerX) * 10);
      }
      if (enableMagnetism) {
        setX((x - centerX) * 0.05);
        setY((y - centerY) * 0.05);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        pointer-events: none;
        left: ${x - 10}px;
        top: ${y - 10}px;
        transform: scale(0);
        z-index: 50;
      `;
      element.appendChild(ripple);
      
      ctx.add(() => {
        gsap.fromTo(ripple, 
          { scale: 0, opacity: 1 }, 
          { 
            scale: 15, 
            opacity: 0, 
            duration: 0.6, 
            ease: 'power2.out', 
            onComplete: () => ripple.remove() 
          }
        );
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      ctx.revert();
    };
  }, [cardRef, enableTilt, enableMagnetism, clickEffect, glowColor, disableAnimations]);
};


const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

interface ParticleCardProps {
  children?: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  layout?: boolean;
  layoutId?: string;
  isExpanded?: boolean;
  onMouseEnter?: () => void;
}

const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  layout = false,
  layoutId,
  isExpanded = true,
  onMouseEnter
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const particlesInitialized = useRef(false);

  useCardInteractions({
    cardRef,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    disableAnimations,
    onMouseEnterCallback: () => {
      isHoveredRef.current = true;
      onMouseEnter?.();
      animateParticles();
    },
    onMouseLeaveCallback: () => {
      isHoveredRef.current = false;
      clearAllParticles();
    }
  });

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    const newParticles = Array.from({ length: particleCount }, () => {
      const el = createParticleElement(Math.random() * width, Math.random() * height, glowColor);
      gsap.set(el, { scale: 0, opacity: 0 }); // Hide initially
      cardRef.current?.appendChild(el);
      return el;
    });
    
    particlesRef.current = newParticles;
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    particlesRef.current.forEach(particle => {
      gsap.killTweensOf(particle);
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)'
      });
    });
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    const { width, height } = cardRef.current.getBoundingClientRect();

    particlesRef.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        // Reset to random position inside card
        gsap.set(particle, {
          x: 0,
          y: 0,
          left: Math.random() * width,
          top: Math.random() * height
        });

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    return () => {
      clearAllParticles();
      particlesRef.current.forEach(p => p.remove());
    };
  }, [clearAllParticles]);

  


  if (layout) {
    return (
      <motion.div
        ref={cardRef as any}
        layout={true}
        layoutId={layoutId}
        className={`${className} particle-container`}
        style={{ ...style, position: 'relative', overflow: 'hidden' }}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
};

interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      mix-blend-mode: screen;
      will-change: transform, opacity;
    `;
    
    gsap.set(spotlight, { xPercent: -50, yPercent: -50 });
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;
    
    const setX = gsap.quickTo(spotlight, "x", { duration: 0.1, ease: "power2.out" });
    const setY = gsap.quickTo(spotlight, "y", { duration: 0.1, ease: "power2.out" });
    const setOpacity = gsap.quickTo(spotlight, "opacity", { duration: 0.2, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      isInsideSection.current = !!mouseInside;
      const cards = gridRef.current.querySelectorAll('.magic-bento-card') as NodeListOf<HTMLElement>;

      if (!mouseInside) {
        setOpacity(0);
        cards.forEach(card => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      setX(e.clientX);
      setY(e.clientY);

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      setOpacity(targetOpacity);
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

interface BentoCardGridProps {
  children?: React.ReactNode;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

const BentoCardGrid: React.FC<BentoCardGridProps> = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface MagicBentoProps {
  cardData?: MagicBentoCardData[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}


interface InteractiveCardProps {
  card: MagicBentoCardData;
  index: number;
  isExpanded: boolean;
  onMouseEnter: () => void;
  baseClassName: string;
  customStyle: React.CSSProperties;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  glowColor: string;
  disableAnimations: boolean;
  isLight: boolean;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  card,
  index,
  isExpanded,
  onMouseEnter,
  baseClassName,
  customStyle,
  enableTilt,
  enableMagnetism,
  clickEffect,
  glowColor,
  disableAnimations,
  isLight
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useCardInteractions({
    cardRef,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    disableAnimations,
    onMouseEnterCallback: onMouseEnter
  });

  
          return (
            <InteractiveCard
              key={index}
              card={card}
              index={index}
              isExpanded={isExpanded}
              onMouseEnter={onMouseEnter}
              baseClassName={baseClassName}
              customStyle={customStyle}
              enableTilt={enableTilt}
              enableMagnetism={enableMagnetism}
              clickEffect={clickEffect}
              glowColor={glowColor}
              disableAnimations={disableAnimations}
              isLight={isLight}
            />
          );

};


const MagicBento: React.FC<MagicBentoProps> = ({
  cardData = defaultCardData,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const isExpanded = index === expandedIndex;
          const isLight = card.color === '#ffffff' || card.color === '#fff' || card.color.toLowerCase() === 'white';
          const sizeClassName = isExpanded ? 'magic-bento-card--expanded' : 'magic-bento-card--collapsed';
          const baseClassName = `magic-bento-card ${sizeClassName} ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${isLight ? 'magic-bento-card--light' : ''}`;
          
          const customStyle = {
            backgroundColor: card.color,
            '--glow-color': glowColor
          } as React.CSSProperties;

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                layout={true}
                layoutId={`bento-card-${index}`}
                isExpanded={isExpanded}
                onMouseEnter={() => setExpandedIndex(index)}
                className={baseClassName}
                style={customStyle}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                <motion.div layout="position" className="magic-bento-card__header flex items-center justify-between w-full">
                  <div className="magic-bento-card__label">{card.label}</div>
                  {card.icon && <card.icon size={18} className={isLight ? "text-slate-800/60 group-hover:text-slate-900 transition-colors duration-300" : "text-white/60 group-hover:text-white transition-colors duration-300"} />}
                </motion.div>
                <motion.div layout="position" className="magic-bento-card__content">
                  <h2 className="magic-bento-card__title">{card.title}</h2>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="magic-bento-card__description"
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </ParticleCard>
            );
          }

          
          return (
            <InteractiveCard
              key={index}
              card={card}
              index={index}
              isExpanded={isExpanded}
              onMouseEnter={() => setExpandedIndex(index)}
              baseClassName={baseClassName}
              customStyle={customStyle}
              enableTilt={enableTilt}
              enableMagnetism={enableMagnetism}
              clickEffect={clickEffect}
              glowColor={glowColor}
              disableAnimations={shouldDisableAnimations}
              isLight={isLight}
            />
          );

        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
