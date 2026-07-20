'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/shared/utils/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 100;
const DEFAULT_DISTANCE = 100;
const DEFAULT_PANEL_HEIGHT = 60;

// ─── Types ────────────────────────────────────────────────────────────────────
type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

type DockProviderProps = {
  children: React.ReactNode;
  value: DockContextType;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const DockContext = createContext<DockContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error('useDock must be used within a DockProvider');
  return context;
}

// ─── Dock ─────────────────────────────────────────────────────────────────────
// Smooth Apple-style spring physics
const APPLE_SPRING: SpringOptions = {
  mass: 0.1,
  stiffness: 220,
  damping: 17,
};

function Dock({
  children,
  className,
  spring = APPLE_SPRING,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  // Max height the outer wrapper needs to allow icons to grow upward without clipping
  const maxHeight = useMemo(
    () => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4),
    [magnification]
  );

  const heightMotion = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightMotion, spring);

  return (
    // Outer wrapper — purely for height animation so icons grow upward.
    // MUST be transparent with no overflow clip so the capsule floats cleanly.
    <motion.div
      style={{ height }}
      className="flex items-end justify-center overflow-visible bg-transparent"
    >
      {/* The actual glass capsule */}
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          // Base layout
          'mx-auto flex w-fit items-center gap-2 rounded-full px-4',
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

// ─── DockItem ─────────────────────────────────────────────────────────────────
function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - rect.x - rect.width / 2;
  });

  // The core magnification: resting=40px, peak=magnification, falls off with distance
  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn('relative inline-flex items-center justify-center', className)}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      onClick={onClick}
    >
      {Children.map(children, (child) =>
        cloneElement(
          child as React.ReactElement,
          { width, isHovered } as Record<string, unknown>
        )
      )}
    </motion.div>
  );
}

// ─── DockLabel (tooltip) ──────────────────────────────────────────────────────
function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = isHovered.on('change', (v) => setIsVisible(v === 1));
    return unsub;
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.94 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.94 }}
          transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            // Glassmorphic tooltip
            'absolute -top-8 left-1/2 w-fit whitespace-nowrap rounded-lg px-2.5 py-1',
            'bg-white/75 dark:bg-neutral-900/75 backdrop-blur-md',
            'border border-white/50 dark:border-white/[0.08]',
            'text-[11px] font-medium text-neutral-700 dark:text-neutral-200',
            'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
            className
          )}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── DockIcon ─────────────────────────────────────────────────────────────────
function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number>;

  // Icon fills 70% of its container width — balances size vs. breathing room
  const iconSize = useTransform(width, (val) => val * 0.70);

  return (
    <motion.div
      style={{ width: iconSize, height: iconSize }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
