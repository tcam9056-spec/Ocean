import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onEnter: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

interface SparkleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
}

export function SplashScreen({ onEnter, audioRef }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  const sparkles = useMemo<SparkleData[]>(() => {
    const palette = [
      "rgba(78,205,196,0.9)",
      "rgba(197,168,255,0.85)",
      "rgba(240,244,255,0.85)",
      "rgba(120,200,255,0.8)",
      "rgba(160,240,220,0.8)",
    ];
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 10 + Math.random() * 85,
      size: Math.random() * 2.8 + 0.6,
      color: palette[Math.floor(Math.random() * palette.length)],
      duration: 9 + Math.random() * 14,
      delay: Math.random() * 14,
      driftX: (Math.random() - 0.5) * 50,
    }));
  }, []);

  const handleClick = () => {
    if (exiting) return;
    setExiting(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setTimeout(onEnter, 2400);
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none overflow-hidden"
          onClick={handleClick}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        >

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 40% 35%, rgba(20,50,120,0.6) 0%, transparent 55%),
                radial-gradient(ellipse at 70% 65%, rgba(70,0,130,0.5) 0%, transparent 50%),
                linear-gradient(160deg,
                  rgba(11,25,44,0.78) 0%,
                  rgba(8,18,38,0.65) 50%,
                  rgba(6,14,30,0.75) 100%
                )
              `,
            }}
          />

          {/* Floating bio-particles */}
          {sparkles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
                zIndex: 1,
              }}
              animate={{
                y: [0, -70, -150],
                x: [0, p.driftX * 0.4, p.driftX],
                opacity: [0, 0.9, 0.5, 0],
                scale: [0.3, 1, 0.6, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeOut",
                delay: p.delay,
              }}
            />
          ))}

          {/* Center content */}
          <div className="text-center px-8 max-w-lg relative" style={{ zIndex: 2 }}>

            {/* Glowing orbs */}
            <div className="flex justify-center gap-5 mb-10">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 1 ? 6 : 4,
                    height: i === 1 ? 6 : 4,
                    background: i === 1
                      ? "rgba(197,168,255,0.9)"
                      : "rgba(78,205,196,0.85)",
                    boxShadow: i === 1
                      ? "0 0 14px rgba(197,168,255,0.8), 0 0 28px rgba(197,168,255,0.4)"
                      : "0 0 10px rgba(78,205,196,0.7), 0 0 20px rgba(78,205,196,0.3)",
                  }}
                  animate={{
                    y: [0, i === 1 ? -10 : -6, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            {/* Poetic title — floating */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  fontSize: "clamp(1.55rem, 4vw, 2.4rem)",
                  lineHeight: 1.55,
                  color: "rgba(240,244,255,0.93)",
                  textShadow: `
                    0 0 30px rgba(197,168,255,0.55),
                    0 0 70px rgba(78,205,196,0.2),
                    0 2px 12px rgba(0,0,0,0.6)
                  `,
                  letterSpacing: "0.02em",
                }}
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                văn,
                <br />
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "rgba(197,168,255,0.9)",
                    textShadow: `
                      0 0 24px rgba(197,168,255,0.65),
                      0 0 60px rgba(120,80,200,0.35),
                      0 2px 8px rgba(0,0,0,0.5)
                    `,
                  }}
                >
                  lời thi ca tồi tàn của nghệ nhân thoi thóp.
                </span>
              </motion.h1>
            </motion.div>

            {/* Dot divider */}
            <motion.div
              className="flex justify-center gap-2 items-center mt-10 mb-8"
              animate={{ opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 2 ? 5 : 3,
                    height: i === 2 ? 5 : 3,
                    background: i === 2
                      ? "rgba(197,168,255,0.75)"
                      : "rgba(78,205,196,0.55)",
                    boxShadow: i === 2
                      ? "0 0 8px rgba(197,168,255,0.6)"
                      : "0 0 5px rgba(78,205,196,0.4)",
                  }}
                />
              ))}
            </motion.div>

            {/* Hint */}
            <motion.p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "0.72rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(197,168,255,0.35)",
              }}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              chạm để bước vào
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="splash-exit"
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ background: "#060d1c" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
}
