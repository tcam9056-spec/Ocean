import { motion } from "framer-motion";
import type { Shelf } from "@/hooks/useShelvesStore";

interface StatsBarProps {
  shelves: Shelf[];
}

export function StatsBar({ shelves }: StatsBarProps) {
  let totalArtworks = 0;
  let totalLikes = 0;
  for (const s of shelves) {
    totalArtworks += s.artworks.length;
    for (const a of s.artworks) totalLikes += a.likes;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1.2 }}
      className="flex items-center justify-center gap-6 sm:gap-8 py-3 px-6 sm:px-8 mx-auto mb-10 w-fit rounded-full"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 0 10px rgba(255,255,255,0.03), 0 4px 15px rgba(0,0,0,0.15)",
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="rounded-full shrink-0"
          style={{
            width: 5, height: 5,
            background: "rgba(78,205,196,0.8)",
            boxShadow: "0 0 8px rgba(78,205,196,0.6), 0 0 16px rgba(78,205,196,0.3)",
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500, fontSize: "0.7rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(197,168,255,0.9)",
          whiteSpace: "nowrap",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}>
          Tác phẩm
        </span>
        <motion.span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400, fontSize: "1rem",
            color: "rgba(240,244,255,0.7)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          data-testid="text-total-links"
        >
          {totalArtworks}
        </motion.span>
      </div>

      <div className="rounded-full shrink-0" style={{ width: 3, height: 3, background: "rgba(197,168,255,0.2)" }} />

      <div className="flex items-center gap-2">
        <motion.div
          className="rounded-full shrink-0"
          style={{
            width: 5, height: 5,
            background: "rgba(255,160,200,0.75)",
            boxShadow: "0 0 8px rgba(255,140,180,0.5), 0 0 16px rgba(255,100,160,0.25)",
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
        />
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500, fontSize: "0.7rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(197,168,255,0.9)",
          whiteSpace: "nowrap",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}>
          🪼
        </span>
        <motion.span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400, fontSize: "1rem",
            color: "rgba(240,244,255,0.7)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          data-testid="text-total-likes"
        >
          {totalLikes}
        </motion.span>
      </div>

      <div className="rounded-full shrink-0" style={{ width: 3, height: 3, background: "rgba(197,168,255,0.2)" }} />

      <div className="flex items-center gap-2">
        <motion.div
          className="rounded-full shrink-0"
          style={{
            width: 5, height: 5,
            background: "rgba(120,200,255,0.7)",
            boxShadow: "0 0 8px rgba(120,200,255,0.5)",
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
        />
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500, fontSize: "0.7rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(197,168,255,0.9)",
          whiteSpace: "nowrap",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}>
          Kệ
        </span>
        <motion.span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400, fontSize: "1rem",
            color: "rgba(240,244,255,0.7)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          {shelves.length}
        </motion.span>
      </div>
    </motion.div>
  );
}
