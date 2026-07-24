"use client";

import React, { useEffect, useRef, useState } from "react";
import { Renderer, Camera, Transform, Sphere, Program, Mesh, Vec2, Vec3 } from "ogl";

// ─── GLSL Shaders for Liquid Glass Blob ──────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uReducedMotion;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying float vDisplacement;

  // 3D Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + D.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Organic breathing & fluid continuous morphing
    float t = uTime * 0.4;
    float n1 = snoise(pos * 1.5 + vec3(t * 0.6, t * 0.4, t * 0.2));
    float n2 = snoise(pos * 3.0 - vec3(t * 0.3, t * 0.5, t * 0.4)) * 0.4;
    float totalNoise = (n1 + n2) * (1.0 - uReducedMotion * 0.85);

    // Mouse attraction & smooth liquid stretch toward cursor
    vec3 mouseVec = normalize(vec3(uMouse.x * 1.5, uMouse.y * 1.5, 1.2));
    float dist = length(pos - mouseVec * 0.75);
    float mouseDeform = exp(-dist * 1.8) * uHover * (1.0 - uReducedMotion);

    // Displacement vector along normal & mouse direction
    float displacement = totalNoise * 0.16 + mouseDeform * 0.32;
    pos += normal * displacement + mouseVec * (mouseDeform * 0.12);

    vDisplacement = displacement;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPosition;
    vWorldPosition = pos;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor1; // Electric Blue (#2563EB)
  uniform vec3 uColor2; // Purple / Violet (#8B5CF6)
  uniform vec3 uColor3; // Cyan highlight (#38BDF8)
  uniform vec3 uColorWhite; // Pure Gloss White (#FFFFFF)
  uniform float uHover;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying float vDisplacement;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Glass Fresnel Rim Glow
    float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.8);

    // Soft Blue + Purple + Cyan Gradient mix
    float gradVal = vWorldPosition.y * 0.45 + 0.5 + vDisplacement * 0.25 + sin(uTime * 0.3) * 0.1;
    gradVal = clamp(gradVal, 0.0, 1.0);

    vec3 baseGradient = mix(uColor1, uColor2, gradVal);
    baseGradient = mix(baseGradient, uColor3, fresnel * 0.4);

    // High Gloss Specular Light Reflections (Key light & Fill light)
    vec3 light1 = normalize(vec3(1.5, 1.8, 2.2));
    vec3 half1 = normalize(light1 + viewDir);
    float spec1 = pow(max(0.0, dot(normal, half1)), 64.0);

    vec3 light2 = normalize(vec3(-1.2, -1.5, 1.5));
    vec3 half2 = normalize(light2 + viewDir);
    float spec2 = pow(max(0.0, dot(normal, half2)), 40.0);

    // Internal translucent glass glow & refraction
    float innerTranslucency = pow(max(0.0, dot(normal, viewDir)), 1.5) * 0.35;
    vec3 specularShine = uColorWhite * (spec1 * 1.5 + spec2 * 0.7);
    vec3 glowingEdge = mix(uColor3, uColorWhite, fresnel * 0.6) * fresnel * 1.8;

    // Combine glass layers into final liquid color
    vec3 finalColor = baseGradient * (0.65 + innerTranslucency) + specularShine + glowingEdge;
    float alpha = clamp(0.75 + fresnel * 0.25, 0.0, 0.96);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ─── Ambient Particles Interface ─────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  factor: number;
}

// ─── HeroBlob Component ───────────────────────────────────────────────────────

export default function HeroBlob() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0, hover: 0, targetHover: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate soft ambient particles floating freely around the liquid blob
    const colors = [
      "rgba(96, 165, 250, 0.75)",  // Soft Blue
      "rgba(168, 85, 247, 0.75)",  // Soft Purple
      "rgba(56, 189, 248, 0.75)",  // Soft Cyan
      "rgba(255, 255, 255, 0.6)",  // Soft White
    ];

    const initialParticles: Particle[] = Array.from({ length: 18 }, () => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 4 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.35 + Math.random() * 0.45,
      factor: 6 + Math.random() * 18,
    }));

    setParticles(initialParticles);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. OGL Renderer & Camera Setup
    const renderer = new Renderer({
      canvas,
      width: container.clientWidth,
      height: container.clientHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      antialias: true,
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 0, 4.2);

    const scene = new Transform();

    // 2. High Resolution 3D Sphere Geometry
    const geometry = new Sphere(gl, {
      radius: 1.15,
      widthSegments: 96,
      heightSegments: 96,
    });

    // 3. WebGL Shader Program
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vec2(0, 0) },
        uHover: { value: 0 },
        uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
        uColor1: { value: new Vec3(0.14, 0.38, 0.95) },     // Electric Blue #2563EB
        uColor2: { value: new Vec3(0.54, 0.24, 0.96) },     // Purple #8B5CF6
        uColor3: { value: new Vec3(0.22, 0.74, 0.98) },     // Cyan #38BDF8
        uColorWhite: { value: new Vec3(1.0, 1.0, 1.0) },   // White Specular #FFFFFF
      },
      transparent: true,
      cullFace: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    // 4. Handle Window/Container Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 5. Mouse Interaction Listeners
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
      mouseRef.current.targetHover = 1.0;

      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / 12,
        y: (e.clientY - rect.top - rect.height / 2) / 12,
      });
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.targetHover = 0.0;
      setMousePos({ x: 0, y: 0 });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // 6. Animation Frame Loop
    let animationFrameId: number;
    let startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Smooth inertia for liquid displacement & relaxation
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.05;
      m.currentY += (m.targetY - m.currentY) * 0.05;
      m.hover += (m.targetHover - m.hover) * 0.04;

      program.uniforms.uTime.value = elapsed;
      program.uniforms.uMouse.value.set(m.currentX, m.currentY);
      program.uniforms.uHover.value = m.hover;

      // Very soft idle breathing & subtle rotation
      mesh.rotation.y = elapsed * 0.1 + m.currentX * 0.2;
      mesh.rotation.x = Math.sin(elapsed * 0.35) * 0.06 + m.currentY * 0.2;
      mesh.position.y = Math.sin(elapsed * 0.75) * 0.04;

      renderer.render({ scene, camera });
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // 7. Cleanup & Resource Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      try {
        geometry.remove();
        program.remove();
        mesh.setParent(null);
      } catch (e) {
        // Safe check for WebGL context loss
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] xl:max-w-[560px] aspect-square flex items-center justify-center select-none bg-transparent overflow-visible pointer-events-auto"
      aria-label="Arcade interactive liquid glass logo visualization"
    >
      {/* --- Ambient Soft Radial Glow (Floating in space) --- */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-indigo-500/20 blur-3xl pointer-events-none transform scale-110 animate-pulse transition-opacity duration-1000" />

      {/* --- Concentric Orbit Rings (Floating around blob) --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="orbit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="orbit-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Outer dashed orbit ring */}
        <circle cx="250" cy="250" r="222" fill="none" stroke="url(#orbit-grad-1)" strokeWidth="1.2" strokeDasharray="6 10" className="animate-[spin_60s_linear_infinite]" />

        {/* Middle ring */}
        <circle cx="250" cy="250" r="182" fill="none" stroke="url(#orbit-grad-2)" strokeWidth="1.4" />

        {/* Inner reverse dashed ring */}
        <circle cx="250" cy="250" r="146" fill="none" stroke="rgba(59, 130, 246, 0.16)" strokeWidth="1" strokeDasharray="4 8" className="animate-[spin_40s_linear_infinite_reverse]" />
      </svg>

      {/* --- Floating Soft Glowing Particles --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-transform duration-700 ease-out"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 3.5}px ${p.color}`,
              transform: `translate(${mousePos.x * (p.factor / 10)}px, ${mousePos.y * (p.factor / 10)}px)`,
            }}
          />
        ))}
      </div>

      {/* --- 3D WebGL Liquid Glass Canvas --- */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full cursor-pointer touch-none bg-transparent"
      />

      {/* --- Perfectly Centered Arcade Wordmark ("arcade.") --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 select-none">
        <div
          className="flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          }}
        >
          <svg
            width="220"
            height="50"
            viewBox="0 0 347 77"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-44 sm:w-52 md:w-56 h-auto drop-shadow-[0_4px_20px_rgba(255,255,255,0.7)]"
            aria-label="Arcade wordmark logo"
          >
            <defs>
              <linearGradient id="arcade-blob-logo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            <path
              d="M24.576 75.36C19.904 75.36 15.712 74.208 12 71.904C8.288 69.536 5.344 66.368 3.168 62.4C1.056 58.368 4.41074e-06 53.824 4.41074e-06 48.768C4.41074e-06 43.712 1.152 39.1679 3.456 35.136C5.824 31.104 8.992 27.936 12.96 25.632C16.992 23.264 21.504 22.08 26.496 22.08C31.488 22.08 35.968 23.264 39.936 25.632C43.904 27.936 47.04 31.104 49.344 35.136C51.712 39.1679 52.896 43.712 52.896 48.768H49.152C49.152 53.824 48.064 58.368 45.888 62.4C43.776 66.368 40.864 69.536 37.152 71.904C33.44 74.208 29.248 75.36 24.576 75.36ZM26.496 66.72C29.76 66.72 32.672 65.952 35.232 64.416C37.792 62.816 39.808 60.672 41.28 57.984C42.752 55.232 43.488 52.16 43.488 48.768C43.488 45.312 42.752 42.24 41.28 39.552C39.808 36.7999 37.792 34.6559 35.232 33.12C32.672 31.5199 29.76 30.7199 26.496 30.7199C23.296 30.7199 20.384 31.5199 17.76 33.12C15.2 34.6559 13.152 36.7999 11.616 39.552C10.144 42.24 9.40801 45.312 9.40801 48.768C9.40801 52.16 10.144 55.232 11.616 57.984C13.152 60.672 15.2 62.816 17.76 64.416C20.384 65.952 23.296 66.72 26.496 66.72ZM48 75.072C46.592 75.072 45.408 74.624 44.448 73.728C43.552 72.768 43.104 71.584 43.104 70.176V55.488L44.928 45.312L52.896 48.768V70.176C52.896 71.584 52.416 72.768 51.456 73.728C50.56 74.624 49.408 75.072 48 75.072ZM68.3333 42.144C68.3333 38.304 69.2613 34.88 71.1173 31.8719C73.0373 28.8 75.5973 26.368 78.7973 24.5759C81.9973 22.7839 85.5173 21.8879 89.3573 21.8879C93.1973 21.8879 96.0453 22.5279 97.9013 23.8079C99.8213 25.024 100.557 26.496 100.109 28.224C99.9173 29.12 99.5333 29.8239 98.9573 30.3359C98.4453 30.7839 97.8373 31.0719 97.1333 31.1999C96.4293 31.3279 95.6613 31.2959 94.8293 31.104C90.7333 30.2719 87.0533 30.2079 83.7893 30.912C80.5253 31.616 77.9333 32.928 76.0133 34.848C74.1573 36.768 73.2293 39.2 73.2293 42.144H68.3333ZM68.4293 74.976C66.8933 74.976 65.7093 74.592 64.8773 73.824C64.0453 72.992 63.6293 71.776 63.6293 70.176V27.264C63.6293 25.728 64.0453 24.5439 64.8773 23.7119C65.7093 22.8799 66.8933 22.4639 68.4293 22.4639C70.0293 22.4639 71.2133 22.8799 71.9813 23.7119C72.8133 24.4799 73.2293 25.664 73.2293 27.264V70.176C73.2293 71.712 72.8133 72.896 71.9813 73.728C71.2133 74.56 70.0293 74.976 68.4293 74.976ZM126.441 75.36C121.321 75.36 116.745 74.208 112.713 71.904C108.745 69.536 105.609 66.368 103.305 62.4C101.065 58.368 99.945 53.824 99.945 48.768C99.945 43.584 101.065 38.976 103.305 34.9439C105.545 30.912 108.617 27.7759 112.521 25.5359C116.425 23.232 120.905 22.08 125.961 22.08C129.737 22.08 133.193 22.816 136.329 24.288C139.465 25.6959 142.281 27.8399 144.777 30.7199C145.673 31.7439 145.993 32.7999 145.737 33.8879C145.481 34.976 144.777 35.936 143.625 36.7679C142.729 37.408 141.737 37.632 140.649 37.4399C139.561 37.184 138.569 36.608 137.673 35.712C134.537 32.384 130.633 30.7199 125.961 30.7199C122.697 30.7199 119.817 31.488 117.321 33.024C114.825 34.4959 112.873 36.5759 111.465 39.264C110.057 41.952 109.353 45.12 109.353 48.768C109.353 52.224 110.057 55.296 111.465 57.984C112.937 60.672 114.953 62.816 117.513 64.416C120.073 65.952 123.049 66.72 126.441 66.72C128.681 66.72 130.633 66.464 132.297 65.952C134.025 65.376 135.593 64.512 137.001 63.36C138.025 62.528 139.081 62.08 140.169 62.016C141.257 61.888 142.217 62.176 143.049 62.88C144.137 63.776 144.745 64.8 144.873 65.952C145.001 67.04 144.617 68.032 143.721 68.928C139.113 73.216 133.353 75.36 126.441 75.36ZM178.337 75.36C173.665 75.36 169.473 74.208 165.761 71.904C162.049 69.536 159.105 66.368 156.929 62.4C154.817 58.368 153.761 53.824 153.761 48.768C153.761 43.712 154.913 39.1679 157.217 35.136C159.585 31.104 162.753 27.936 166.721 25.632C170.753 23.264 175.265 22.08 180.257 22.08C185.249 22.08 189.729 23.264 193.697 25.632C197.665 27.936 200.801 31.104 203.105 35.136C205.473 39.1679 206.657 43.712 206.657 48.768H202.913C202.913 53.824 201.825 58.368 199.649 62.4C197.537 66.368 194.625 69.536 190.913 71.904C187.201 74.208 183.009 75.36 178.337 75.36ZM180.257 66.72C183.521 66.72 186.433 65.952 188.993 64.416C191.553 62.816 193.569 60.672 195.041 57.984C196.513 55.232 197.249 52.16 197.249 48.768C197.249 45.312 196.513 42.24 195.041 39.552C193.569 36.7999 191.553 34.6559 188.993 33.12C186.433 31.5199 183.521 30.7199 180.257 30.7199C177.057 30.7199 174.145 31.5199 171.521 33.12C168.961 34.6559 166.913 36.7999 165.377 39.552C163.905 42.24 163.169 45.312 163.169 48.768C163.169 52.16 163.905 55.232 165.377 57.984C166.913 60.672 168.961 62.816 171.521 64.416C174.145 65.952 177.057 66.72 180.257 66.72ZM201.761 75.072C200.353 75.072 199.169 74.624 198.209 73.728C197.313 72.768 196.865 71.584 196.865 70.176V55.488L198.689 45.312L206.657 48.768V70.176C206.657 71.584 206.177 72.768 205.217 73.728C204.321 74.624 203.169 75.072 201.761 75.072ZM241.199 75.36C236.207 75.36 231.695 74.208 227.663 71.904C223.695 69.536 220.527 66.336 218.159 62.304C215.855 58.272 214.703 53.728 214.703 48.672C214.703 43.616 215.759 39.104 217.871 35.136C220.047 31.104 222.991 27.936 226.703 25.632C230.415 23.264 234.607 22.08 239.279 22.08C243.055 22.08 246.543 22.88 249.743 24.4799C252.943 26.0159 255.631 28.1279 257.807 30.816V4.89595C257.807 3.42395 258.255 2.23995 259.151 1.34395C260.111 0.44795 261.295 -4.95911e-05 262.703 -4.95911e-05C264.175 -4.95911e-05 265.359 0.44795 266.255 1.34395C267.151 2.23995 267.599 3.42395 267.599 4.89595V48.672C267.599 53.728 266.415 58.272 264.047 62.304C261.743 66.336 258.607 69.536 254.639 71.904C250.671 74.208 246.191 75.36 241.199 75.36ZM241.199 66.72C244.463 66.72 247.375 65.952 249.935 64.416C252.495 62.816 254.511 60.64 255.983 57.888C257.455 55.136 258.191 52.064 258.191 48.672C258.191 45.216 257.455 42.144 255.983 39.456C254.511 36.768 252.495 34.6559 249.935 33.12C247.375 31.5199 244.463 30.7199 241.199 30.7199C237.999 30.7199 235.087 31.5199 232.463 33.12C229.903 34.6559 227.855 36.768 226.319 39.456C224.847 42.144 224.111 45.216 224.111 48.672C224.111 52.064 224.847 55.136 226.319 57.888C227.855 60.64 229.903 62.816 232.463 64.416C235.087 65.952 237.999 66.72 241.199 66.72ZM305.722 75.36C300.41 75.36 295.674 74.24 291.514 72C287.418 69.696 284.186 66.56 281.818 62.592C279.514 58.56 278.362 53.952 278.362 48.768C278.362 43.52 279.45 38.912 281.626 34.9439C283.866 30.912 286.938 27.7759 290.842 25.5359C294.746 23.232 299.226 22.08 304.282 22.08C309.274 22.08 313.562 23.2 317.146 25.4399C320.73 27.6159 323.45 30.6559 325.306 34.5599C327.226 38.3999 328.186 42.8479 328.186 47.904C328.186 49.12 327.77 50.144 326.938 50.976C326.106 51.744 325.05 52.128 323.77 52.128H285.082V44.448H323.482L319.546 47.136C319.482 43.936 318.842 41.088 317.626 38.592C316.41 36.0319 314.682 34.0159 312.442 32.5439C310.202 31.0719 307.482 30.3359 304.282 30.3359C300.634 30.3359 297.498 31.1359 294.874 32.7359C292.314 34.3359 290.362 36.544 289.018 39.36C287.674 42.112 287.002 45.248 287.002 48.768C287.002 52.288 287.802 55.424 289.402 58.176C291.002 60.928 293.21 63.104 296.026 64.704C298.842 66.304 302.074 67.104 305.722 67.104C307.706 67.104 309.722 66.752 311.77 66.048C313.882 65.28 315.578 64.416 316.858 63.456C317.818 62.752 318.842 62.4 319.93 62.4C321.082 62.336 322.074 62.656 322.906 63.36C323.994 64.32 324.57 65.376 324.634 66.528C324.698 67.68 324.186 68.672 323.098 69.504C320.922 71.232 318.202 72.64 314.938 73.728C311.738 74.816 308.666 75.36 305.722 75.36ZM339.619 76.512C337.827 76.512 336.259 75.872 334.915 74.592C333.635 73.248 332.995 71.68 332.995 69.888C332.995 68.032 333.635 66.464 334.915 65.184C336.259 63.84 337.827 63.168 339.619 63.168C341.475 63.168 343.043 63.84 344.323 65.184C345.603 66.464 346.243 68.032 346.243 69.888C346.243 71.68 345.603 73.248 344.323 74.592C343.043 75.872 341.475 76.512 339.619 76.512Z"
              fill="url(#arcade-blob-logo-grad)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
