/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Shuffle, RotateCcw, Lightbulb, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';
import { HARDCODED_ASCII_TILES } from './rubiksFaceTiles';

/**
 * Arcade 3D Rubik's Cube
 * 
 * Features:
 * - 6 Centered Hardcoded ASCII Art Faces from ascii.txt (zero slicing drift)
 * - Manual layer-by-layer swipe twisting (play & solve like a real Rubik's cube)
 * - Free 360-degree 3D orbit rotation with kinetic momentum
 * - Top-right Undo, Hint, Scramble & Solve buttons
 * - Maximize & Minimize Fullscreen Modal View with clean white theme
 * - Vertical line zoom/size slider with circular thumb
 */

export interface StationFace {
  id: string;
  stepNumber: string;
  name: string;
  tagline: string;
  message: string;
  faceKey: keyof typeof HARDCODED_ASCII_TILES;
  tone: string;
  bgColor: string;
  textColor: string;
  normal: [number, number, number]; // [nx, ny, nz]
  targetRot: { x: number; y: number };
}

export const STATIONS: Record<string, StationFace> = {
  ARENA: {
    id: 'arena',
    stepNumber: '04',
    name: 'ARENA',
    tagline: 'First Hackathon',
    message: 'Compete in the arena, ship projects under pressure, and battle-test your code with peers.',
    faceKey: 'ARENA',
    tone: '#16A34A',
    bgColor: '#16A34A', // Front (F) -> Green
    textColor: '#FFFFFF',
    normal: [0, 0, 1], // Front (+Z)
    targetRot: { x: -14, y: 0 },
  },
  SPARK: {
    id: 'spark',
    stepNumber: '02',
    name: 'SPARK',
    tagline: 'First Course',
    message: 'Ignite your curiosity. Complete your very first course, build daily focus, and spark real momentum.',
    faceKey: 'SPARK',
    tone: '#EA580C',
    bgColor: '#EA580C', // Left (L) -> Orange
    textColor: '#FFFFFF',
    normal: [-1, 0, 0], // Left (-X)
    targetRot: { x: -14, y: 90 },
  },
  BUILD: {
    id: 'build',
    stepNumber: '03',
    name: 'BUILD',
    tagline: 'Ship a Project',
    message: 'Turn abstract knowledge into real-world software. Build end-to-end architectures and deploy to production.',
    faceKey: 'BUILD',
    tone: '#FFFFFF',
    bgColor: '#FFFFFF', // Up (U) -> White
    textColor: '#0F172A',
    normal: [0, -1, 0], // Top (-Y)
    targetRot: { x: -75, y: 0 },
  },
  CREW: {
    id: 'crew',
    stepNumber: '05',
    name: 'CREW',
    tagline: 'Join a Channel',
    message: 'No one builds alone. Join developer channels, collaborate with team members, and get peer feedback.',
    faceKey: 'CREW',
    tone: '#DC2626',
    bgColor: '#DC2626', // Right (R) -> Red
    textColor: '#FFFFFF',
    normal: [1, 0, 0], // Right (+X)
    targetRot: { x: -14, y: -90 },
  },
  START: {
    id: 'start',
    stepNumber: '01',
    name: 'START',
    tagline: 'Begin Journey',
    message: 'Every master was once a beginner. Take your first step into coding and begin your developer quest.',
    faceKey: 'START',
    tone: '#EAB308',
    bgColor: '#EAB308', // Down (D) -> Yellow
    textColor: '#1E293B',
    normal: [0, 1, 0], // Bottom (+Y)
    targetRot: { x: 75, y: 0 },
  },
  ORBIT: {
    id: 'orbit',
    stepNumber: '06',
    name: 'ORBIT',
    tagline: 'Mentor Others',
    message: 'Reach escape velocity. Guide the next generation of builders, share knowledge, and lead the community.',
    faceKey: 'ORBIT',
    tone: '#2563EB',
    bgColor: '#2563EB', // Back (B) -> Blue
    textColor: '#FFFFFF',
    normal: [0, 0, -1], // Back (-Z)
    targetRot: { x: -14, y: 180 },
  },
};

type Axis = 'x' | 'y' | 'z';

export type Mat3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

const I3: Mat3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function multMat3(A: Mat3, B: Mat3): Mat3 {
  const C: Mat3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      C[r][c] = A[r][0] * B[0][c] + A[r][1] * B[1][c] + A[r][2] * B[2][c];
    }
  }
  return C;
}

function multVec3(A: Mat3, [x, y, z]: [number, number, number]): [number, number, number] {
  return [
    A[0][0] * x + A[0][1] * y + A[0][2] * z,
    A[1][0] * x + A[1][1] * y + A[1][2] * z,
    A[2][0] * x + A[2][1] * y + A[2][2] * z,
  ];
}

const ROT_MATRICES: Record<Axis, (dir: 1 | -1) => Mat3> = {
  x: (d) => [
    [1, 0, 0],
    [0, 0, -d],
    [0, d, 0],
  ],
  y: (d) => [
    [0, 0, d],
    [0, 1, 0],
    [-d, 0, 0],
  ],
  z: (d) => [
    [0, -d, 0],
    [d, 0, 0],
    [0, 0, 1],
  ],
};

export interface CubieState {
  id: number;
  ox: number;
  oy: number;
  oz: number;
  x: number;
  y: number;
  z: number;
  mat: Mat3;
}

const CUBIE_SIZE = 72; // px
const CUBIE_GAP = 5;   // px
const STEP = CUBIE_SIZE + CUBIE_GAP; // 77px

function createInitialCubies(): CubieState[] {
  const cubies: CubieState[] = [];
  let id = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          id: id++,
          ox: x,
          oy: y,
          oz: z,
          x,
          y,
          z,
          mat: I3,
        });
      }
    }
  }
  return cubies;
}

function checkIsSolved(cubies: CubieState[]): boolean {
  return cubies.every(
    (c) =>
      c.x === c.ox &&
      c.y === c.oy &&
      c.z === c.oz &&
      c.mat[0][0] === 1 &&
      c.mat[1][1] === 1 &&
      c.mat[2][2] === 1 &&
      c.mat[0][1] === 0 &&
      c.mat[0][2] === 0 &&
      c.mat[1][0] === 0 &&
      c.mat[1][2] === 0 &&
      c.mat[2][0] === 0 &&
      c.mat[2][1] === 0
  );
}

function applyMoveToCubies(
  cubies: CubieState[],
  axis: Axis,
  layer: number,
  direction: 1 | -1
): CubieState[] {
  const R = ROT_MATRICES[axis](direction);

  return cubies.map((c) => {
    if (c[axis] !== layer) return c;

    const [newX, newY, newZ] = multVec3(R, [c.x, c.y, c.z]);
    const newMat = multMat3(R, c.mat);

    return {
      ...c,
      x: Math.round(newX),
      y: Math.round(newY),
      z: Math.round(newZ),
      mat: newMat,
    };
  });
}


/**
 * Calculates which face is facing forward toward the camera (dot product with +Z).
 */
function getMostVisibleFace(rotX: number, rotY: number): StationFace {
  const radX = (rotX * Math.PI) / 180;
  const radY = (rotY * Math.PI) / 180;

  let bestFace: StationFace = STATIONS.ARENA;
  let bestDot = -999;

  for (const st of Object.values(STATIONS)) {
    const [nx, ny, nz] = st.normal;

    // Apply rotateY(rotY)
    const y1 = ny;
    const z1 = -nx * Math.sin(radY) + nz * Math.cos(radY);

    // Apply rotateX(rotX)
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    if (z2 > bestDot) {
      bestDot = z2;
      bestFace = st;
    }
  }

  return bestFace;
}

const RUBIKS_STORAGE_KEY = 'arcade-rubiks-cube-session-state';

interface SavedRubiksState {
  cubies: CubieState[];
  rotX: number;
  rotY: number;
  solveStatus: 'scrambled' | 'solving' | 'solved';
  moveHistory: { axis: Axis; layer: number; dir: 1 | -1 }[];
}

export function RubiksCube3D({
  onActiveFaceChange,
  onSolveStatusChange,
}: {
  onActiveFaceChange?: (station: StationFace) => void;
  onSolveStatusChange?: (status: 'scrambled' | 'solving' | 'solved', secondsRemaining: number) => void;
}) {
  const [cubies, setCubies] = useState<CubieState[]>(createInitialCubies);
  const [isTwisting, setIsTwisting] = useState(false);
  const [activeSlice, setActiveSlice] = useState<{ axis: Axis; layer: number; angle: number } | null>(null);
  const [solveStatus, setSolveStatus] = useState<'scrambled' | 'solving' | 'solved'>('solved');
  const [moveCount, setMoveCount] = useState(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [scale, setScale] = useState(1.0);

  const MIN_SCALE = 0.55;
  const MAX_SCALE = 1.65;

  // 3D rotation angles (unconstrained 360-degree freedom in all axes)
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(38);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const animFrameRef = useRef<number | null>(null);
  const lastEmittedFaceId = useRef<string>('');
  const moveHistoryRef = useRef<{ axis: Axis; layer: number; dir: 1 | -1 }[]>([]);
  const isHydratedRef = useRef(false);

  const isSolved = solveStatus === 'solved' || checkIsSolved(cubies);

  // Escape key to exit maximized mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  // Lock body scroll when maximized
  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  // Restore session state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RUBIKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedRubiksState;
        if (Array.isArray(parsed.cubies) && parsed.cubies.length === 27) {
          setCubies(parsed.cubies);
          if (typeof parsed.rotX === 'number') setRotX(parsed.rotX);
          if (typeof parsed.rotY === 'number') setRotY(parsed.rotY);
          if (parsed.solveStatus === 'scrambled' || parsed.solveStatus === 'solved') {
            setSolveStatus(parsed.solveStatus);
          }
          if (Array.isArray(parsed.moveHistory)) {
            moveHistoryRef.current = parsed.moveHistory;
            setMoveCount(parsed.moveHistory.length);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Persist session state on every change
  useEffect(() => {
    if (!isHydratedRef.current || typeof window === 'undefined') return;
    try {
      const payload: SavedRubiksState = {
        cubies,
        rotX,
        rotY,
        solveStatus: solveStatus === 'solving' ? 'scrambled' : solveStatus,
        moveHistory: moveHistoryRef.current,
      };
      localStorage.setItem(RUBIKS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [cubies, rotX, rotY, solveStatus]);

  // Track touch/drag start for differentiating slice turn vs 3D orbit
  const dragInfoRef = useRef<{
    startX: number;
    startY: number;
    cubieX: number;
    cubieY: number;
    cubieZ: number;
    faceNormal: [number, number, number] | null;
    face: keyof typeof STATIONS | null;
    mode: 'idle' | 'pending' | 'orbit' | 'slice_turned';
  }>({
    startX: 0,
    startY: 0,
    cubieX: 0,
    cubieY: 0,
    cubieZ: 0,
    faceNormal: null,
    face: null,
    mode: 'idle',
  });

  // Notify parent of solve status
  useEffect(() => {
    onSolveStatusChange?.(solveStatus, 0);
  }, [solveStatus, onSolveStatusChange]);

  // Notify parent of active face when rotation changes
  useEffect(() => {
    const visibleFace = getMostVisibleFace(rotX, rotY);
    if (visibleFace.id !== lastEmittedFaceId.current) {
      lastEmittedFaceId.current = visibleFace.id;
      onActiveFaceChange?.(visibleFace);
    }
  }, [rotX, rotY, onActiveFaceChange]);

  // 90-degree slice twist animation
  const twistSlice = useCallback(
    (axis: Axis, layer: number, direction: 1 | -1 = 1, speedMs = 300) => {
      return new Promise<void>((resolve) => {
        setIsTwisting(true);
        const angle = direction * 90;
        setActiveSlice({ axis, layer, angle });

        setTimeout(() => {
          setCubies((prev) => {
            const next = applyMoveToCubies(prev, axis, layer, direction);
            if (checkIsSolved(next)) {
              setSolveStatus('solved');
            } else {
              setSolveStatus('scrambled');
            }
            return next;
          });
          setActiveSlice(null);
          setIsTwisting(false);
          resolve();
        }, speedMs);
      });
    },
    []
  );

  // Undo last action
  const handleUndo = useCallback(async () => {
    if (isTwisting || solveStatus === 'solving' || moveHistoryRef.current.length === 0) return;
    const lastMove = moveHistoryRef.current.pop();
    if (!lastMove) return;
    setMoveCount(moveHistoryRef.current.length);
    await twistSlice(lastMove.axis, lastMove.layer, (lastMove.dir * -1) as 1 | -1, 180);
  }, [isTwisting, solveStatus, twistSlice]);

  // Hint action (performs or displays the next solution step)
  const handleHint = useCallback(async () => {
    if (isTwisting || solveStatus === 'solving' || isSolved) return;
    if (moveHistoryRef.current.length > 0) {
      const nextMove = moveHistoryRef.current.pop();
      if (!nextMove) return;
      setMoveCount(moveHistoryRef.current.length);
      const axisName = nextMove.axis.toUpperCase();
      const layerName = nextMove.layer === 1 ? 'Outer' : nextMove.layer === 0 ? 'Middle' : 'Inner';
      setHintMessage(`Step: Reversing ${layerName} ${axisName}-layer`);
      await twistSlice(nextMove.axis, nextMove.layer, (nextMove.dir * -1) as 1 | -1, 240);
      setTimeout(() => setHintMessage(null), 3000);
    } else {
      setHintMessage('Align center faces to match outer colors');
      setTimeout(() => setHintMessage(null), 3000);
    }
  }, [isTwisting, solveStatus, isSolved, twistSlice]);

  // Scramble action
  const handleScramble = useCallback(async () => {
    if (isTwisting || solveStatus === 'solving') return;
    setSolveStatus('scrambled');
    setHintMessage(null);
    const axes: Axis[] = ['x', 'y', 'z'];
    const layers = [-1, 0, 1];
    const scrambleCount = 6;
    const moves: { axis: Axis; layer: number; dir: 1 | -1 }[] = [];

    for (let i = 0; i < scrambleCount; i++) {
      const axis = axes[Math.floor(Math.random() * axes.length)];
      const layer = layers[Math.floor(Math.random() * layers.length)];
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      moves.push({ axis, layer, dir });
    }

    for (const m of moves) {
      await twistSlice(m.axis, m.layer, m.dir, 150);
      moveHistoryRef.current.push(m);
      setMoveCount(moveHistoryRef.current.length);
    }
  }, [isTwisting, solveStatus, twistSlice]);

  // Solve action
  const handleSolve = useCallback(async () => {
    if (isTwisting || solveStatus === 'solving' || isSolved) return;
    setSolveStatus('solving');
    setHintMessage(null);

    if (moveHistoryRef.current.length > 0) {
      const movesToReverse = [...moveHistoryRef.current].reverse();
      moveHistoryRef.current = [];
      setMoveCount(0);
      for (const m of movesToReverse) {
        await twistSlice(m.axis, m.layer, (m.dir * -1) as 1 | -1, 140);
      }
    }

    setCubies(createInitialCubies());
    setSolveStatus('solved');
    moveHistoryRef.current = [];
    setMoveCount(0);
  }, [isTwisting, solveStatus, isSolved, twistSlice]);

  // Pointer drag handling: manual slice twist on cubie swipe OR 3D orbit on background / right-click
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTwisting || solveStatus === 'solving') return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    velocityRef.current = { vx: 0, vy: 0 };
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    const isRightClick = e.button === 2;
    const isModifierOrbit = e.shiftKey || e.altKey;

    const targetEl = e.target as HTMLElement;
    const faceEl = (!isRightClick && !isModifierOrbit) ? (targetEl.closest('[data-cubie-face]') as HTMLElement | null) : null;

    if (faceEl) {
      const cx = Number(faceEl.getAttribute('data-cx') ?? 0);
      const cy = Number(faceEl.getAttribute('data-cy') ?? 0);
      const cz = Number(faceEl.getAttribute('data-cz') ?? 0);
      const nx = Number(faceEl.getAttribute('data-nx') ?? 0);
      const ny = Number(faceEl.getAttribute('data-ny') ?? 0);
      const nz = Number(faceEl.getAttribute('data-nz') ?? 1);
      const face = faceEl.getAttribute('data-face') as keyof typeof STATIONS;

      dragInfoRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        cubieX: cx,
        cubieY: cy,
        cubieZ: cz,
        faceNormal: [nx, ny, nz],
        face,
        mode: 'pending',
      };
    } else {
      dragInfoRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        cubieX: 0,
        cubieY: 0,
        cubieZ: 0,
        faceNormal: null,
        face: null,
        mode: 'orbit',
      };
      isDraggingRef.current = true;
      setIsDragging(true);
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

/**
 * Dynamically projects screen-space 2D drag (screenDx, screenDy) onto the cube's 3D axes
 * given the current 3D viewing angles (rotX, rotY) and touched face normal.
 * This guarantees intuitive layer rotation at ANY arbitrary 3D camera angle!
 */
function getCameraAwareMove(
  cx: number,
  cy: number,
  cz: number,
  faceNormal: [number, number, number],
  rotX: number,
  rotY: number,
  screenDx: number,
  screenDy: number
): { axis: Axis; layer: number; dir: 1 | -1 } | null {
  const radX = (rotX * Math.PI) / 180;
  const radY = (rotY * Math.PI) / 180;

  // Project a 3D tangent vector to 2D screen coordinates
  const projectToScreen = (vx: number, vy: number, vz: number) => {
    // 1. rotateY(rotY)
    const x1 = vx * Math.cos(radY) + vz * Math.sin(radY);
    const y1 = vy;
    const z1 = -vx * Math.sin(radY) + vz * Math.cos(radY);
    // 2. rotateX(rotX)
    const sx = x1;
    const sy = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    return { sx, sy };
  };

  const [nx, ny, nz] = faceNormal;
  const axes: Axis[] = ['x', 'y', 'z'];
  let bestDot = -Infinity;
  let bestMove: { axis: Axis; layer: number; dir: 1 | -1 } | null = null;

  for (const axis of axes) {
    const layer = axis === 'x' ? cx : axis === 'y' ? cy : cz;
    for (const dir of [1, -1] as const) {
      const ax = axis === 'x' ? 1 : 0;
      const ay = axis === 'y' ? 1 : 0;
      const az = axis === 'z' ? 1 : 0;

      // Tangent vector on the face = dir * (Axis × Normal)
      const tx = dir * (ay * nz - az * ny);
      const ty = dir * (az * nx - ax * nz);
      const tz = dir * (ax * ny - ay * nx);

      if (Math.hypot(tx, ty, tz) < 0.1) continue;

      const { sx, sy } = projectToScreen(tx, ty, tz);
      const dot = sx * screenDx + sy * screenDy;

      if (dot > bestDot) {
        bestDot = dot;
        bestMove = { axis, layer, dir };
      }
    }
  }

  return bestMove;
}

  const handlePointerMove = (e: React.PointerEvent) => {
    const currentDrag = dragInfoRef.current;
    if (currentDrag.mode === 'idle') return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    const totalDx = e.clientX - currentDrag.startX;
    const totalDy = e.clientY - currentDrag.startY;
    const totalDist = Math.hypot(totalDx, totalDy);

    // 1. Drag started on a cubie face: turns layers if dragged along face tangent
    if (currentDrag.mode === 'pending') {
      if (totalDist > 14 && !isTwisting && currentDrag.face && currentDrag.faceNormal) {
        const { cubieX, cubieY, cubieZ, faceNormal } = currentDrag;

        const move = getCameraAwareMove(
          cubieX,
          cubieY,
          cubieZ,
          faceNormal,
          rotX,
          rotY,
          totalDx,
          totalDy
        );

        if (move) {
          currentDrag.mode = 'slice_turned';
          twistSlice(move.axis, move.layer, move.dir).then(() => {
            moveHistoryRef.current.push(move);
            setMoveCount(moveHistoryRef.current.length);
          });
          return;
        } else {
          // If not aligned with a slice tangent, seamlessly orbit the 3D scene pivot
          currentDrag.mode = 'orbit';
          isDraggingRef.current = true;
          setIsDragging(true);
        }
      }
      return;
    }

    // 2. 3D orbit rotation with kinetic velocity tracking
    if (currentDrag.mode === 'orbit') {
      isDraggingRef.current = true;
      velocityRef.current = {
        vx: dx * 0.7,
        vy: dy * 0.7,
      };
      setRotY((prev) => (prev + dx * 0.75) % 360);
      setRotX((prev) => (prev - dy * 0.75) % 360);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const prevMode = dragInfoRef.current.mode;
    dragInfoRef.current.mode = 'idle';
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    if (prevMode === 'orbit') {
      // Inertial gliding momentum
      let { vx, vy } = velocityRef.current;
      const glide = () => {
        vx *= 0.92;
        vy *= 0.92;

        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
          setRotY((prev) => (prev + vx) % 360);
          setRotX((prev) => (prev - vy) % 360);
          animFrameRef.current = requestAnimationFrame(glide);
        } else {
          animFrameRef.current = null;
        }
      };
      if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
        animFrameRef.current = requestAnimationFrame(glide);
      }
    }
  };

  const halfSize = CUBIE_SIZE / 2;

  /**
   * Renders the hardcoded, centered 3x3 slice of ASCII for the given face and (u, v) tile.
   */
  const renderAsciiFaceSlice = (
    stationKey: keyof typeof STATIONS,
    u: number,
    v: number
  ) => {
    const station = STATIONS[stationKey];
    const rowIndex = v + 1; // 0, 1, 2
    const colIndex = u + 1; // 0, 1, 2
    const tileText = HARDCODED_ASCII_TILES[stationKey]?.[rowIndex]?.[colIndex] ?? '';

    return (
      <div
        className="w-full h-full rounded-[4px] overflow-hidden relative shadow-inner select-none border border-white/10 flex items-center justify-center p-0.5"
        style={{ backgroundColor: station.bgColor }}
      >
        <pre
          className="font-mono text-[4.2px] leading-[4.7px] font-black select-none whitespace-pre m-0 p-0 text-left tracking-[-0.6px]"
          style={{ color: station.textColor }}
        >
          {tileText}
        </pre>
      </div>
    );
  };

  const renderCubieFace = (
    stationKey: keyof typeof STATIONS,
    u: number,
    v: number,
    transformStyle: string,
    cx: number,
    cy: number,
    cz: number,
    mat: Mat3
  ) => {
    const initNormal = STATIONS[stationKey].normal;
    const [nx, ny, nz] = multVec3(mat, initNormal);

    return (
      <div
        data-cubie-face="true"
        data-face={stationKey}
        data-cx={cx}
        data-cy={cy}
        data-cz={cz}
        data-nx={nx}
        data-ny={ny}
        data-nz={nz}
        className="absolute inset-0 rounded-[6px] border border-slate-700/50 shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),inset_0_-2px_3px_rgba(0,0,0,0.7),0_2px_4px_rgba(0,0,0,0.45)] flex items-center justify-center p-[3px] cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 55%, #020617 100%)',
          transform: transformStyle,
          backfaceVisibility: 'hidden',
        }}
      >
        {renderAsciiFaceSlice(stationKey, u, v)}
      </div>
    );
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderScaleControl = () => {
    const pct = Math.max(0, Math.min(1, (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)));
    const trackHeightPx = 150;

    const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const trackEl = e.currentTarget;
      const rect = trackEl.getBoundingClientRect();

      const computeNewScale = (clientY: number) => {
        const clampedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
        const ratio = 1 - (clampedY - rect.top) / rect.height; // 1 at top, 0 at bottom
        const s = +(MIN_SCALE + ratio * (MAX_SCALE - MIN_SCALE)).toFixed(2);
        setScale(s);
      };

      computeNewScale(e.clientY);

      const onMove = (moveEv: PointerEvent) => {
        computeNewScale(moveEv.clientY);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    return (
      <div className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-30 select-none">
        {/* Zoom In Button */}
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2)))}
          className="w-6 h-6 rounded-none bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex items-center justify-center text-xs transition-transform active:scale-90 cursor-pointer"
          title="Increase cube size (+)"
          aria-label="Increase cube size"
        >
          <Plus size={12} />
        </button>

        {/* Vertical Track Line with Circle Handle */}
        <div
          onPointerDown={handleTrackPointerDown}
          className="relative w-8 flex items-center justify-center cursor-pointer py-1 touch-none"
          style={{ height: `${trackHeightPx}px` }}
          title="Drag to adjust size"
        >
          {/* Vertical Track Line */}
          <div className="w-[2.5px] h-full bg-slate-300 dark:bg-slate-600/90 relative shadow-inner">
            {/* Active Blue Progress Fill */}
            <div
              className="absolute bottom-0 inset-x-0 bg-[#2563EB]"
              style={{ height: `${pct * 100}%` }}
            />
          </div>

          {/* Circle Thumb Handle (matching vertical slider in screenshot) */}
          <div
            className="absolute w-7 h-7 rounded-full border-[2.5px] border-slate-700 dark:border-white bg-white/90 dark:bg-slate-850 shadow-[0_2px_8px_rgba(0,0,0,0.22)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
            style={{
              bottom: `calc(${pct * 100}% - 14px)`,
            }}
          >
            {/* Inner Center Dot / Crosshair */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          </div>
        </div>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2)))}
          className="w-6 h-6 rounded-none bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex items-center justify-center text-xs transition-transform active:scale-90 cursor-pointer"
          title="Decrease cube size (-)"
          aria-label="Decrease cube size"
        >
          <Minus size={12} />
        </button>

        {/* Scale Percentage / Reset Pill */}
        <button
          type="button"
          onClick={() => setScale(1.0)}
          className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Click to reset size to 100%"
        >
          {Math.round(scale * 100)}%
        </button>
      </div>
    );
  };

  const renderCubeUI = (inModal: boolean) => {
    return (
      <div className={inModal ? "relative w-full max-w-4xl h-full flex flex-col items-center justify-between" : "relative w-full flex flex-col items-center"}>
        {/* Box Header: Title on Left, Action Buttons on Right */}
        <div
          className={
            inModal
              ? "w-full flex items-center justify-between px-5 py-3 rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl bg-white/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md"
              : "w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60"
          }
        >
          <div className="flex items-center shrink-0">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Rubik {inModal && <span className="text-slate-400 dark:text-slate-500 font-normal">· Fullscreen</span>}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Undo Button */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={isTwisting || solveStatus === 'solving' || moveCount === 0}
              className="inline-flex items-center justify-center w-8 h-8 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Undo last move"
              aria-label="Undo"
            >
              <RotateCcw size={14} className="text-slate-700 dark:text-slate-300" />
            </button>

            {/* Hint Button */}
            <button
              type="button"
              onClick={handleHint}
              disabled={isTwisting || solveStatus === 'solving' || isSolved}
              className="inline-flex items-center justify-center w-8 h-8 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-700/50 shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Get next step hint"
              aria-label="Hint"
            >
              <Lightbulb size={14} className="text-amber-500" />
            </button>

            {/* Scramble Button */}
            <button
              type="button"
              onClick={handleScramble}
              disabled={isTwisting || solveStatus === 'solving'}
              className="inline-flex items-center justify-center w-8 h-8 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Scramble the cube"
              aria-label="Scramble"
            >
              <Shuffle size={14} className="text-[#EA580C]" />
            </button>

            {/* Solve Button */}
            <button
              type="button"
              onClick={handleSolve}
              disabled={isTwisting || solveStatus === 'solving' || isSolved}
              className="inline-flex items-center justify-center w-8 h-8 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:bg-slate-400 dark:disabled:bg-slate-700 cursor-pointer"
              title={isSolved ? "Cube is already solved" : "Solve cube automatically"}
              aria-label="Solve"
            >
              <Sparkles size={14} />
            </button>

            {/* Maximize / Minimize Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-700/60 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ml-0.5"
              title={inModal ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
              aria-label={inModal ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
            >
              {inModal ? (
                <Minimize2 size={14} className="text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Maximize2 size={14} className="text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
          </div>
        </div>

        {/* 3D Scene Viewport Area (Zoom slider rendered exclusively in Fullscreen modal) */}
        <div className={`relative w-full flex items-center justify-center ${inModal ? "my-auto py-6 flex-1 min-h-[460px]" : "mt-2"}`}>
          {/* Vertical Size Slider Widget (Fullscreen Only) */}
          {inModal && renderScaleControl()}

          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            onWheel={(e) => {
              if (!inModal) return;
              e.preventDefault();
              setScale((prev) => {
                const next = +(prev - e.deltaY * 0.0015).toFixed(2);
                return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
              });
            }}
            className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            style={{
              height: inModal ? 'calc(100vh - 200px)' : '375px',
              minHeight: inModal ? '460px' : '360px',
              perspective: '1300px',
            }}
          >
            {/* Ambient Floor Glow */}
            <div
              aria-hidden
              className={`pointer-events-none absolute ${inModal ? 'bottom-2 h-20 w-96' : 'bottom-3 h-16 w-72'} rounded-full blur-2xl opacity-65`}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(99,102,241,0.25) 50%, transparent 80%)',
              }}
            />

            {/* 3D Pivot Root with Scale Transformation (Default 1.0x for normal screen, custom scale for fullscreen) */}
            <div
              style={{
                width: '0px',
                height: '0px',
                transformStyle: 'preserve-3d',
                transform: `scale(${inModal ? scale : 1.0}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {cubies.map((c) => {
                const posX = c.x * STEP;
                const posY = c.y * STEP;
                const posZ = c.z * STEP;

                let sliceTransform = '';
                const isSliceMember = activeSlice && c[activeSlice.axis] === activeSlice.layer;
                if (isSliceMember && activeSlice) {
                  if (activeSlice.axis === 'x') sliceTransform = `rotateX(${activeSlice.angle}deg)`;
                  if (activeSlice.axis === 'y') sliceTransform = `rotateY(${activeSlice.angle}deg)`;
                  if (activeSlice.axis === 'z') sliceTransform = `rotateZ(${activeSlice.angle}deg)`;
                }

                const m = c.mat;
                const matrix3dStr = `matrix3d(${m[0][0]}, ${m[1][0]}, ${m[2][0]}, 0, ${m[0][1]}, ${m[1][1]}, ${m[2][1]}, 0, ${m[0][2]}, ${m[1][2]}, ${m[2][2]}, 0, 0, 0, 0, 1)`;

                return (
                  <div
                    key={c.id}
                    style={{
                      position: 'absolute',
                      width: `${CUBIE_SIZE}px`,
                      height: `${CUBIE_SIZE}px`,
                      left: `${-halfSize}px`,
                      top: `${-halfSize}px`,
                      transformStyle: 'preserve-3d',
                      transform: `
                        ${sliceTransform}
                        translate3d(${posX}px, ${posY}px, ${posZ}px)
                        ${matrix3dStr}
                      `,
                      transition: isSliceMember ? 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                    }}
                  >
                    {/* 1. FRONT: ARENA (Z = +halfSize) */}
                    {renderCubieFace('ARENA', c.ox, c.oy, `translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}

                    {/* 2. BACK: ORBIT (Z = -halfSize) */}
                    {renderCubieFace('ORBIT', -c.ox, c.oy, `rotateY(180deg) translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}

                    {/* 3. TOP: BUILD (Y = -halfSize) */}
                    {renderCubieFace('BUILD', c.ox, c.oz, `rotateX(90deg) translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}

                    {/* 4. BOTTOM: START (Y = +halfSize) */}
                    {renderCubieFace('START', c.ox, -c.oz, `rotateX(-90deg) translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}

                    {/* 5. LEFT: SPARK (X = -halfSize) */}
                    {renderCubieFace('SPARK', c.oz, c.oy, `rotateY(-90deg) translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}

                    {/* 6. RIGHT: CREW (X = +halfSize) */}
                    {renderCubieFace('CREW', -c.oz, c.oy, `rotateY(90deg) translateZ(${halfSize}px)`, c.x, c.y, c.z, c.mat)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal-Only Footer for Hint/Status messages */}
        {inModal && hintMessage && (
          <div className="w-full flex items-center justify-center py-2 px-4 rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-lg rounded-bl-lg bg-white/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] min-h-[30px] text-xs font-mono font-medium text-slate-600 dark:text-slate-300 backdrop-blur-md">
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Lightbulb size={12} className="text-amber-500" />
              {hintMessage}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (isMaximized && mounted && typeof document !== 'undefined') {
    return (
      <>
        {/* Inline Card Placeholder */}
        <div className="relative w-full max-w-[540px] mx-auto rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8 flex items-center justify-center text-xs font-mono text-slate-500">
          Rubik (Fullscreen mode active · Press Esc or click Minimize to return)
        </div>

        {/* High-priority Portal with Clean White Theme Background (z-[99999]) */}
        {createPortal(
          <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-10 flex flex-col items-center justify-between select-none overflow-hidden animate-in fade-in duration-200">
            {renderCubeUI(true)}
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] backdrop-blur-sm select-none flex flex-col justify-between items-center">
      {/* Decorative background ambient glow matching Resume Learning */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center">
        {renderCubeUI(false)}
      </div>
    </div>
  );
}

