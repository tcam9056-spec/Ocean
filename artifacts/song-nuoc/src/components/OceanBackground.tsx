import { useMemo, memo } from "react";
import { motion } from "framer-motion";

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
}

function BioLuminParticles() {
  const particles = useMemo<ParticleData[]>(() => {
    const palette = [
      "rgba(78,205,196,0.9)",
      "rgba(197,168,255,0.85)",
      "rgba(240,244,255,0.8)",
      "rgba(120,200,255,0.85)",
      "rgba(160,240,220,0.8)",
    ];
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 15 + Math.random() * 78,
      size: Math.random() * 2.4 + 0.7,
      color: palette[Math.floor(Math.random() * palette.length)],
      duration: 14 + Math.random() * 18,
      delay: Math.random() * 20,
      driftX: (Math.random() - 0.5) * 55,
    }));
  }, []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 5}px ${p.color}, 0 0 ${p.size * 10}px ${p.color}`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -90, -190],
            x: [0, p.driftX * 0.4, p.driftX],
            opacity: [0, 0.85, 0.5, 0],
            scale: [0.3, 1, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
}

function FishSVG({ size, color, flip }: { size: number; color: string; flip?: boolean }) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 80 44"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined, display: "block" }}
    >
      <path
        d="M60 22 C48 10 24 6 8 14 C2 17 2 27 8 30 C24 38 48 34 60 22 Z"
        fill={color}
      />
      <path
        d="M60 22 C68 14 78 10 76 22 C78 34 68 30 60 22 Z"
        fill={color}
        opacity={0.7}
      />
      <circle cx="14" cy="20" r="2.5" fill="rgba(240,255,255,0.9)" />
      <circle cx="13" cy="19.5" r="1" fill="rgba(0,0,0,0.5)" />
    </svg>
  );
}

function JellyfishSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 60 96"
      fill="none"
      style={{ display: "block" }}
    >
      <ellipse cx="30" cy="26" rx="26" ry="22" fill={color} opacity={0.45} />
      <ellipse cx="30" cy="26" rx="20" ry="15" fill={color} opacity={0.25} />
      {[18, 24, 30, 36, 42].map((x, i) => (
        <path
          key={i}
          d={`M${x} 44 C${x - 3} 55 ${x + 3} 65 ${x - 2} 78 C${x + 1} 88 ${x - 4} 92 ${x} 96`}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.5 - i * 0.04}
        />
      ))}
    </svg>
  );
}

interface BubbleData {
  id: number;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
}

function FloatingBubbles() {
  const bubbles = useMemo<BubbleData[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      startY: 60 + Math.random() * 35,
      size: 4 + Math.random() * 14,
      duration: 10 + Math.random() * 16,
      delay: Math.random() * 22,
      driftX: (Math.random() - 0.5) * 60,
    }));
  }, []);

  return (
    <>
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: `${b.startY}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            border: "1px solid rgba(150,220,255,0.35)",
            background: "rgba(200,240,255,0.05)",
            boxShadow: `inset 0 0 ${b.size * 0.4}px rgba(255,255,255,0.25), 0 0 ${b.size * 0.6}px rgba(120,200,255,0.15)`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -(b.size * 15 + 120)],
            x: [0, b.driftX * 0.5, b.driftX],
            opacity: [0, 0.7, 0.5, 0],
            scale: [0.4, 1, 1.1, 0.8],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: b.delay,
          }}
        />
      ))}
    </>
  );
}

interface FloatingFishData {
  id: number;
  top: string;
  startX: string;
  endX: string;
  size: number;
  duration: number;
  delay: number;
  floatY: number;
  color: string;
  flip: boolean;
  opacity: number;
}

function FloatingFishLayer() {
  const fishList = useMemo<FloatingFishData[]>(() => [
    {
      id: 0, top: "22%", startX: "-10%", endX: "110%",
      size: 55, duration: 28, delay: 0, floatY: 18,
      color: "rgba(78,205,196,0.55)", flip: false, opacity: 0.7,
    },
    {
      id: 1, top: "48%", startX: "115%", endX: "-15%",
      size: 40, duration: 34, delay: 10, floatY: 12,
      color: "rgba(120,200,255,0.5)", flip: true, opacity: 0.55,
    },
    {
      id: 2, top: "68%", startX: "-12%", endX: "112%",
      size: 30, duration: 22, delay: 5, floatY: 10,
      color: "rgba(160,240,220,0.45)", flip: false, opacity: 0.5,
    },
    {
      id: 3, top: "35%", startX: "108%", endX: "-8%",
      size: 22, duration: 40, delay: 18, floatY: 8,
      color: "rgba(197,168,255,0.4)", flip: true, opacity: 0.4,
    },
    {
      id: 4, top: "78%", startX: "-8%", endX: "108%",
      size: 18, duration: 18, delay: 2, floatY: 6,
      color: "rgba(100,220,200,0.4)", flip: false, opacity: 0.45,
    },
  ], []);

  return (
    <>
      {fishList.map((f) => (
        <motion.div
          key={f.id}
          className="absolute pointer-events-none select-none"
          style={{ top: f.top, opacity: f.opacity, zIndex: 2, filter: "blur(0.3px)", willChange: "transform" }}
          animate={{
            x: [f.startX, f.endX],
            y: [0, -f.floatY, f.floatY * 0.5, -f.floatY * 0.3, 0],
          }}
          transition={{
            x: { duration: f.duration, repeat: Infinity, ease: "linear", delay: f.delay },
            y: { duration: f.duration * 0.35, repeat: Infinity, ease: "easeInOut", delay: f.delay },
          }}
        >
          <FishSVG size={f.size} color={f.color} flip={f.flip} />
        </motion.div>
      ))}
    </>
  );
}

interface FloatingJellyData {
  id: number;
  left: string;
  topStart: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  color: string;
}

function FloatingJellyfishLayer() {
  const jellies = useMemo<FloatingJellyData[]>(() => [
    {
      id: 0, left: "12%", topStart: 55, size: 52, duration: 20, delay: 0,
      driftX: 12, color: "rgba(197,168,255,0.65)",
    },
    {
      id: 1, left: "72%", topStart: 40, size: 38, duration: 26, delay: 8,
      driftX: -10, color: "rgba(120,200,255,0.6)",
    },
    {
      id: 2, left: "42%", topStart: 65, size: 28, duration: 18, delay: 4,
      driftX: 8, color: "rgba(78,205,196,0.55)",
    },
  ], []);

  return (
    <>
      {jellies.map((j) => (
        <motion.div
          key={j.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: j.left,
            top: `${j.topStart}%`,
            zIndex: 2,
            filter: `blur(1px) drop-shadow(0 0 ${j.size * 0.3}px ${j.color})`,
            willChange: "transform",
          }}
          animate={{
            y: [0, -j.size * 0.8, 0],
            x: [0, j.driftX, -j.driftX * 0.4, 0],
            rotate: [0, 4, -3, 0],
          }}
          transition={{
            duration: j.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: j.delay,
          }}
        >
          <JellyfishSVG size={j.size} color={j.color} />
        </motion.div>
      ))}
    </>
  );
}

export function OceanBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Cinematic video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <source
          src="https://cdn.coverr.co/videos/coverr-under-water-in-the-ocean-2561/1080p.mp4"
          type="video/mp4"
        />
        <source
          src="https://cdn.coverr.co/videos/coverr-deep-blue-ocean-under-water-view-1651/1080p.mp4"
          type="video/mp4"
        />
        <source
          src="https://cdn.coverr.co/videos/coverr-underwater-world-2387/1080p.mp4"
          type="video/mp4"
        />
      </video>


      {/* Primary cinematic overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 25% 15%, rgba(0,80,160,0.45) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 75%, rgba(60,0,120,0.3) 0%, transparent 50%),
            linear-gradient(180deg,
              rgba(0,70,120,0.3) 0%,
              rgba(5,20,50,0.45) 50%,
              rgba(0,40,80,0.35) 100%
            )
          `,
          zIndex: 1,
        }}
      />

      {/* SVG fish swimming */}
      <div className="absolute inset-0" style={{ zIndex: 2, overflow: "hidden" }}>
        <FloatingFishLayer />
      </div>

      {/* SVG jellyfish drifting */}
      <div className="absolute inset-0" style={{ zIndex: 2, overflow: "hidden" }}>
        <FloatingJellyfishLayer />
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0" style={{ zIndex: 2, overflow: "hidden" }}>
        <FloatingBubbles />
      </div>

      {/* Bio-luminescent particles */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <BioLuminParticles />
      </div>

      {/* Soft light shafts */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${22 + i * 18}%`,
            width: i % 2 === 0 ? "1px" : "2px",
            height: "55vh",
            background: `linear-gradient(to bottom, rgba(197,168,255,0.1) 0%, rgba(78,205,196,0.06) 55%, transparent 100%)`,
            transform: `rotate(${-5 + i * 3.5}deg)`,
            transformOrigin: "top center",
            filter: "blur(3px)",
            zIndex: 2,
            willChange: "opacity",
          }}
          animate={{ opacity: [0.12, 0.45, 0.12] }}
          transition={{
            duration: 7 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.1,
          }}
        />
      ))}

      {/* Bottom depth fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(2,8,20,0.65), transparent)",
          zIndex: 4,
        }}
      />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(2,8,20,0.35), transparent)",
          zIndex: 4,
        }}
      />
    </div>
  );
}
