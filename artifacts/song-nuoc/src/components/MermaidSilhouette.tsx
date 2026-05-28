import { motion } from "framer-motion";

interface MermaidProps {
  id: string;
  direction: "left" | "right";
  duration: number;
  yOffset: number;
  top: string;
  opacity: number;
}

function MermaidSVG({ flip }: { flip: boolean }) {
  return (
    <svg
      width="120"
      height="200"
      viewBox="0 0 120 200"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* Flowing hair */}
      <motion.path
        d="M55 15 C40 10 30 25 35 45 C30 55 25 60 30 70"
        stroke="rgba(120,220,255,0.7)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        animate={{ d: [
          "M55 15 C40 10 30 25 35 45 C30 55 25 60 30 70",
          "M55 15 C42 8 32 22 38 42 C32 53 28 58 32 68",
          "M55 15 C40 10 30 25 35 45 C30 55 25 60 30 70",
        ]}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M60 12 C70 8 78 18 76 35 C78 48 82 55 78 65"
        stroke="rgba(100,200,240,0.6)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={{ d: [
          "M60 12 C70 8 78 18 76 35 C78 48 82 55 78 65",
          "M60 12 C72 6 80 16 79 33 C80 46 84 53 80 63",
          "M60 12 C70 8 78 18 76 35 C78 48 82 55 78 65",
        ]}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Head */}
      <circle cx="60" cy="22" r="14" fill="rgba(140,210,240,0.5)" />

      {/* Torso */}
      <path
        d="M50 36 C45 50 44 65 46 80 L74 80 C76 65 75 50 70 36 Z"
        fill="rgba(100,190,220,0.45)"
      />

      {/* Arms flowing */}
      <motion.path
        d="M48 50 C38 48 28 55 22 68"
        stroke="rgba(120,210,240,0.55)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={{ d: [
          "M48 50 C38 48 28 55 22 68",
          "M48 50 C36 45 27 50 20 62",
          "M48 50 C38 48 28 55 22 68",
        ]}}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M72 50 C82 48 92 55 98 68"
        stroke="rgba(120,210,240,0.55)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={{ d: [
          "M72 50 C82 48 92 55 98 68",
          "M72 50 C84 45 93 50 100 62",
          "M72 50 C82 48 92 55 98 68",
        ]}}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Tail body */}
      <path
        d="M46 80 C42 110 40 140 44 165 L76 165 C80 140 78 110 74 80 Z"
        fill="rgba(0,160,140,0.45)"
      />

      {/* Tail gradient scale pattern */}
      <path
        d="M46 80 C42 110 40 140 44 165 L76 165 C80 140 78 110 74 80 Z"
        fill="url(#tailGrad)"
        opacity={0.3}
      />

      {/* Fin - animated wave */}
      <motion.path
        d="M44 165 C35 175 28 185 38 195 C48 190 56 182 60 175 C64 182 72 190 82 195 C92 185 85 175 76 165 Z"
        fill="rgba(0,200,160,0.5)"
        animate={{
          d: [
            "M44 165 C35 175 28 185 38 195 C48 190 56 182 60 175 C64 182 72 190 82 195 C92 185 85 175 76 165 Z",
            "M44 165 C32 172 26 182 36 194 C46 188 55 179 60 171 C65 179 74 188 84 194 C94 182 88 172 76 165 Z",
            "M44 165 C35 175 28 185 38 195 C48 190 56 182 60 175 C64 182 72 190 82 195 C92 185 85 175 76 165 Z",
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glow sparkles */}
      {[
        { x: 55, y: 18, r: 2 }, { x: 42, y: 55, r: 1.5 },
        { x: 78, y: 70, r: 2 }, { x: 50, y: 130, r: 1.5 },
        { x: 70, y: 150, r: 1 }, { x: 60, y: 175, r: 2 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="rgba(200,255,255,0.9)"
          animate={{ opacity: [0.2, 1, 0.2], r: [s.r, s.r * 1.8, s.r] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <defs>
        <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,200,180,0.6)" />
          <stop offset="100%" stopColor="rgba(0,120,180,0.3)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MermaidSilhouette({ id, direction, duration, yOffset, top, opacity }: MermaidProps) {
  const isRtl = direction === "right";

  return (
    <motion.div
      key={id}
      className="absolute pointer-events-none"
      style={{
        top,
        filter: "drop-shadow(0 0 18px rgba(0,200,220,0.7)) drop-shadow(0 0 40px rgba(0,150,200,0.4))",
        opacity,
      }}
      animate={{
        x: isRtl
          ? ["110vw", "-20vw"]
          : ["-20vw", "110vw"],
        y: [0, -yOffset, yOffset / 2, -yOffset / 2, 0],
        rotate: isRtl
          ? [0, -5, 2, -3, 0]
          : [0, 5, -2, 3, 0],
      }}
      transition={{
        x: { duration, repeat: Infinity, ease: "easeInOut" },
        y: { duration: duration * 0.6, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: duration * 0.4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <MermaidSVG flip={isRtl} />
    </motion.div>
  );
}
