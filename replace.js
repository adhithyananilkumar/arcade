const fs = require('fs');
const filePath = 'C:/Users/user/Documents/work/jubliee/arcade/arcade/app/(public)/about/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const startStr = 'export default function AboutPage() {';
const endStr = 'function AJCESection() {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end bounds.");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

const newAboutPage = `export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.5 });

  const navOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1]);
  const imageScale = useTransform(smoothProgress, [0, 0.4, 0.85, 1], [1, 1.4, 1.1, 1]);
  const imageOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);
  const imageY = useTransform(smoothProgress, [0, 1], ["0%", "10%"]);

  const p1Opacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const p1Y = useTransform(smoothProgress, [0.1, 0.15], [0, -50]);

  const p2Opacity = useTransform(smoothProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const p2Y = useTransform(smoothProgress, [0.15, 0.2, 0.35, 0.4], [50, 0, 0, -50]);

  const p3Opacity = useTransform(smoothProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const p3Y = useTransform(smoothProgress, [0.4, 0.45, 0.6, 0.65], [50, 0, 0, -50]);

  const p4Opacity = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const p4Y = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [50, 0, 0, -50]);

  const p5Opacity = useTransform(smoothProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const p5Y = useTransform(smoothProgress, [0.85, 0.9, 1], [50, 0, 0]);

  return (
    <div className="bg-[#050505] text-white/90 font-sans selection:bg-[#0050FF]/30">
      <motion.nav 
        style={{ opacity: navOpacity }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-[#0A0A0C]/70 backdrop-blur-md border-b border-white/5"
      >
        <div className="text-xl font-bold tracking-tight text-white">WH-1000XM6</div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="#overview" className="hover:text-white transition-colors">Overview</Link>
          <Link href="#tech" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#nc" className="hover:text-white transition-colors">Noise Cancelling</Link>
          <Link href="#specs" className="hover:text-white transition-colors">Specs</Link>
        </div>
        <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          Experience WH-1000XM6
        </button>
      </motion.nav>

      <div ref={containerRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,21,1)_0%,rgba(5,5,5,1)_100%)] -z-20" />
          <motion.div 
            className="absolute inset-0 -z-10 flex flex-col justify-center items-center opacity-80"
            style={{ 
              scale: imageScale, 
              opacity: imageOpacity,
              y: imageY,
              filter: 'invert(1) hue-rotate(180deg) contrast(1.2)' 
            }}
          >
             <div 
               className="w-full h-full max-w-[1200px] max-h-[800px]"
               style={{
                 backgroundImage: "url('/ink-dome-bg.png')",
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
               }}
             />
          </motion.div>

          <motion.div 
            style={{ opacity: p1Opacity, y: p1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">Sony WH-1000XM6</h1>
            <p className="text-2xl md:text-3xl text-white/80 font-medium tracking-tight mb-4">Silence, perfected.</p>
            <p className="text-lg text-white/50 max-w-lg">Flagship wireless noise cancelling, re-engineered for a world that never stops.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: p2Opacity, y: p2Y }}
            className="absolute inset-0 flex flex-col items-start justify-center px-12 md:px-32 pointer-events-none"
          >
            <div className="max-w-md">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Precision-engineered for silence.</h2>
              <p className="text-lg text-white/60">Custom 40mm drivers and sealed acoustic chambers work in perfect harmony to deliver uncompromising audio fidelity while blocking the outside world. Designed for all-day comfort with memory foam ear cushions.</p>
            </div>
          </motion.div>

          <motion.div 
            style={{ opacity: p3Opacity, y: p3Y }}
            className="absolute inset-0 flex flex-col items-end justify-center px-12 md:px-32 pointer-events-none text-right"
          >
            <div className="max-w-md ml-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#0050FF] to-[#00D6FF]">Adaptive noise cancelling, redefined.</h2>
              <ul className="text-lg text-white/60 space-y-3 text-right">
                <li>Multi-microphone array listens in every direction.</li>
                <li>Real-time noise analysis adapts to your environment.</li>
                <li>Your music stays pure—planes, trains, and crowds fade away.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            style={{ opacity: p4Opacity, y: p4Y }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-6 pointer-events-none text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Immersive, lifelike sound.</h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">High-performance drivers with premium magnetic coils deliver a breathtakingly detailed soundstage. Our next-gen AI upscaling restores clarity and presence to compressed audio formats instantly.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: p5Opacity, y: p5Y }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">Hear everything.<br/>Feel nothing else.</h2>
            <p className="text-xl text-white/60 mb-10">WH-1000XM6. Designed for focus, crafted for comfort.</p>
            <div className="flex items-center gap-6 pointer-events-auto">
              <button className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-white/90 transition-colors">
                Experience WH-1000XM6
              </button>
              <Link href="#specs" className="text-white/60 hover:text-white border-b border-transparent hover:border-white transition-all font-medium">
                See full specs
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-white text-slate-900 rounded-t-[40px] relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
`;

fs.writeFileSync(filePath, before + newAboutPage + after);
console.log('Update successful');
