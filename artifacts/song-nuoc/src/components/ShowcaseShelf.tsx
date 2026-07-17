import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Shelf, Artwork } from "@/hooks/useShelvesStore";

interface ShowcaseShelfProps {
  shelves: Shelf[];
  search: string;
  onSearchChange: (v: string) => void;
  onLike: (shelfId: string, artId: string) => void;
}

/* ─── Row patterns ────────────────────────────────────────────── */
const ROW_PATTERNS = [[7, 5], [4, 8], [5, 3, 4], [6, 6], [8, 4], [3, 5, 4]];

function groupIntoRows(artworks: Artwork[]) {
  const rows: { artworks: Artwork[]; weights: number[] }[] = [];
  let i = 0, pi = 0;
  while (i < artworks.length) {
    const pattern = ROW_PATTERNS[pi % ROW_PATTERNS.length];
    const chunk = artworks.slice(i, i + pattern.length);
    if (!chunk.length) break;
    rows.push({ artworks: chunk, weights: pattern.slice(0, chunk.length) });
    i += chunk.length;
    pi++;
  }
  return rows;
}

/* ─── Search bar ──────────────────────────────────────────────── */
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.9 }}
      className="relative mb-8"
    >
      <div
        className="absolute left-4 top-1/2 pointer-events-none select-none"
        style={{ transform: "translateY(-50%)", color: "rgba(197,168,255,0.4)", fontSize: "14px", zIndex: 2 }}
      >
        ✦
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="tìm tác phẩm, kệ..."
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "10px",
          padding: "11px 20px 11px 38px",
          color: "rgba(240,244,255,0.92)",
          fontSize: "0.85rem",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          letterSpacing: "0.04em",
          outline: "none",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(78,205,196,0.5)";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(78,205,196,0.15), 0 2px 12px rgba(0,0,0,0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
        }}
        aria-label="Tìm kiếm"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2"
            style={{
              transform: "translateY(-50%)",
              color: "rgba(197,168,255,0.5)",
              fontSize: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              touchAction: "manipulation",
            }}
            aria-label="Xóa tìm kiếm"
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Neon accents ────────────────────────────────────────────── */
const NEON = [
  { glow: "rgba(78,205,196,", border: "rgba(78,205,196," },
  { glow: "rgba(197,168,255,", border: "rgba(197,168,255," },
  { glow: "rgba(120,200,255,", border: "rgba(120,200,255," },
  { glow: "rgba(160,240,220,", border: "rgba(160,240,220," },
];

/* ─── Artwork card ────────────────────────────────────────────── */
interface ArtworkCellProps {
  artwork: Artwork;
  weight: number;
  accent: typeof NEON[0];
  onLike: () => void;
  isLast: boolean;
}

function ArtworkCell({ artwork, weight, accent, onLike, isLast }: ArtworkCellProps) {
  const [liking, setLiking] = useState(false);
  const [burst, setBurst] = useState<{ id: number; angle: number; color: string; dist: number; size: number }[]>([]);

  let hostname = "";
  try { hostname = new URL(artwork.link).hostname; } catch { hostname = artwork.link; }

  const isValidUrl = (() => {
    try { new URL(artwork.link); return true; } catch { return false; }
  })();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    const colors = [
      "rgba(78,205,196,0.95)", "rgba(197,168,255,0.95)",
      "rgba(255,160,200,0.9)", "rgba(240,244,255,0.9)",
      "rgba(120,220,255,0.9)", "rgba(160,255,220,0.9)",
      "rgba(230,180,255,0.9)", "rgba(100,200,255,0.9)",
    ];
    setBurst(Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i * 45 * Math.PI) / 180,
      color: colors[i],
      dist: 20 + Math.random() * 14,
      size: 2.5 + Math.random() * 3,
    })));
    setTimeout(() => { setBurst([]); setLiking(false); }, 750);
    onLike();
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isValidUrl) {
      e.preventDefault();
      toast.error("Link không hợp lệ");
    }
  };

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        flex: weight,
        minHeight: 130,
        borderRight: isLast ? "none" : "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to top, ${accent.glow}0.15) 0%, transparent 70%)`,
          zIndex: 1,
        }}
      />
      {/* Bottom shelf glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${accent.border}0.8) 50%, transparent)`,
          boxShadow: `0 0 10px ${accent.glow}0.5)`,
          zIndex: 2,
        }}
      />

      <a
        href={isValidUrl ? artwork.link : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="block h-full p-4 sm:p-5"
        style={{ zIndex: 3, position: "relative", cursor: isValidUrl ? "pointer" : "default" }}
      >
        <h3
          className="leading-snug mb-1.5"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
            color: "rgba(255,255,255,0.97)",
            textShadow: `0 0 18px ${accent.glow}0.45), 0 1px 4px rgba(0,0,0,0.5)`,
            letterSpacing: "0.015em",
            wordBreak: "break-word",
          }}
        >
          {artwork.title}
        </h3>

        {artwork.description && (
          <p
            className="mb-3 leading-relaxed"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(0.76rem, 1.1vw, 0.86rem)",
              color: "rgba(197,168,255,0.65)",
              lineHeight: 1.55,
              wordBreak: "break-word",
            }}
          >
            {artwork.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div
              className="rounded-full shrink-0"
              style={{ width: 3, height: 3, background: accent.border + "0.65)", boxShadow: `0 0 4px ${accent.glow}0.5)` }}
            />
            <span
              className="truncate"
              style={{
                color: "rgba(150,190,210,0.33)",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                letterSpacing: "0.03em",
                fontSize: "0.68rem",
              }}
            >
              {isValidUrl ? hostname : "link không hợp lệ"}
            </span>
          </div>

          {/* Like */}
          <div className="relative shrink-0">
            <AnimatePresence>
              {burst.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: p.size, height: p.size,
                    background: p.color,
                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    left: "50%", top: "50%",
                    translateX: "-50%", translateY: "-50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, opacity: 0, scale: 0 }}
                  exit={{}}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
            <motion.button
              onClick={handleLike}
              className="flex items-center gap-1.5 relative z-10 py-1 px-1"
              style={{
                color: artwork.likes > 0 ? "rgba(255,155,195,0.95)" : "rgba(197,168,255,0.5)",
                background: "none", border: "none", cursor: "pointer",
                touchAction: "manipulation",
              }}
              animate={liking ? { scale: [1, 1.6, 0.85, 1.25, 1], rotate: [0, -10, 10, -4, 0] } : {}}
              whileTap={{ scale: 0.78 }}
              transition={{ duration: 0.55 }}
              disabled={liking}
              aria-label="Thích"
            >
              <span style={{ fontSize: "13px", lineHeight: 1, filter: artwork.likes > 0 ? "drop-shadow(0 0 5px rgba(255,130,175,0.8))" : "none" }}>
                {artwork.likes > 0 ? "♥" : "♡"}
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontSize: "0.8rem" }}>
                {artwork.likes}
              </span>
            </motion.button>
          </div>
        </div>
      </a>
    </div>
  );
}

/* ─── Shelf section ───────────────────────────────────────────── */
interface ShelfSectionProps {
  shelf: Shelf;
  shelfIndex: number;
  onLike: (artId: string) => void;
  highlightIds?: Set<string>;
}

function ShelfSection({ shelf, shelfIndex, onLike, highlightIds }: ShelfSectionProps) {
  const visible = highlightIds
    ? shelf.artworks.filter((a) => highlightIds.has(a.id))
    : shelf.artworks;

  if (!visible.length) return null;

  const rows = groupIntoRows(visible);
  let counter = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shelfIndex * 0.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-8"
    >
      {/* Shelf name header */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="rounded-full"
          style={{
            width: 5, height: 5,
            background: NEON[shelfIndex % NEON.length].border + "0.8)",
            boxShadow: `0 0 8px ${NEON[shelfIndex % NEON.length].glow}0.6)`,
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: shelfIndex * 0.3 }}
        />
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            letterSpacing: "0.14em",
            color: "rgba(197,168,255,0.65)",
            textTransform: "uppercase",
          }}
        >
          {shelf.shelfName}
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(to right, rgba(197,168,255,0.15), transparent)" }}
        />
      </div>

      {/* Artwork rows */}
      <div
        className="overflow-hidden"
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "10px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        {rows.map((row, ri) => {
          const base = counter;
          counter += row.artworks.length;
          return (
            <div
              key={ri}
              className="relative flex"
              style={{
                borderBottom: ri < rows.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
              }}
            >
              {/* Shelf glow stripe */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "2px",
                  background: `linear-gradient(to right, transparent 5%, ${NEON[(shelfIndex) % NEON.length].border}0.2) 30%, ${NEON[(shelfIndex) % NEON.length].border}0.35) 50%, ${NEON[(shelfIndex) % NEON.length].border}0.2) 70%, transparent 95%)`,
                  zIndex: 5,
                }}
              />
              {row.artworks.map((art, ci) => (
                <ArtworkCell
                  key={art.id}
                  artwork={art}
                  weight={row.weights[ci] ?? 1}
                  accent={NEON[(base + ci) % NEON.length]}
                  onLike={() => onLike(art.id)}
                  isLast={ci === row.artworks.length - 1}
                />
              ))}
              {/* Fill empty slots */}
              {row.weights.slice(row.artworks.length).map((w, i) => (
                <div key={`e${i}`} style={{ flex: w, minHeight: 130 }} />
              ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function SkeletonShelf() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-full" style={{ width: 5, height: 5, background: "rgba(197,168,255,0.2)" }} />
        <div className="h-3 rounded-sm" style={{ width: 120, background: "rgba(197,168,255,0.1)" }} />
      </div>
      {[0].map((ri) => (
        <div key={ri} className="flex" style={{
          width: "100%",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "10px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}>
          {[7, 5].map((w, ci) => (
            <motion.div
              key={ci}
              style={{ flex: w, minHeight: 130, padding: "22px 18px 18px", borderRight: ci === 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, delay: ci * 0.3 }}
            >
              <div style={{ height: 18, borderRadius: 4, background: "rgba(197,168,255,0.1)", width: "65%", marginBottom: 10 }} />
              <div style={{ height: 12, borderRadius: 4, background: "rgba(78,205,196,0.07)", width: "80%", marginBottom: 8 }} />
              <div style={{ height: 12, borderRadius: 4, background: "rgba(78,205,196,0.05)", width: "45%" }} />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export function ShowcaseShelf({ shelves, search, onSearchChange, onLike }: ShowcaseShelfProps) {
  const q = search.trim().toLowerCase();

  // Build a set of artwork IDs that match the search
  const matchIds = useMemo<Set<string> | null>(() => {
    if (!q) return null;
    const ids = new Set<string>();
    for (const shelf of shelves) {
      const shelfMatch = shelf.shelfName.toLowerCase().includes(q);
      for (const art of shelf.artworks) {
        if (
          shelfMatch ||
          art.title.toLowerCase().includes(q) ||
          art.description.toLowerCase().includes(q) ||
          art.link.toLowerCase().includes(q)
        ) {
          ids.add(art.id);
        }
      }
    }
    return ids;
  }, [shelves, q]);

  const visibleShelves = useMemo(() => {
    if (!matchIds) return shelves.filter((s) => s.artworks.length > 0);
    return shelves.filter((s) => s.artworks.some((a) => matchIds.has(a.id)));
  }, [shelves, matchIds]);

  // Skeleton on very first mount if loading (not needed since localStorage is sync)
  const isEmpty = shelves.every((s) => s.artworks.length === 0) && shelves.length === 0;

  return (
    <>
      <SearchBar value={search} onChange={onSearchChange} />

      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <motion.div
            className="flex justify-center gap-2 mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: i === 2 ? 7 : 4, height: i === 2 ? 7 : 4,
                  background: i % 2 === 0 ? "rgba(78,205,196,0.45)" : "rgba(197,168,255,0.45)",
                  boxShadow: i === 2 ? "0 0 10px rgba(197,168,255,0.5)" : "none",
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontSize: "1.3rem",
            color: "rgba(240,244,255,0.38)", fontStyle: "italic", lineHeight: 1.7,
          }}>
            Kệ đang trống...
            <br />
            <span style={{ fontSize: "0.92rem", color: "rgba(197,168,255,0.28)" }}>
              biển chờ đón những tác phẩm đầu tiên
            </span>
          </p>
        </motion.div>
      )}

      {!isEmpty && visibleShelves.length === 0 && q && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontStyle: "italic",
            fontSize: "1.05rem", color: "rgba(197,168,255,0.4)", lineHeight: 1.7,
          }}>
            Không tìm thấy tác phẩm nào...
            <br />
            <span style={{ fontSize: "0.82rem", color: "rgba(197,168,255,0.25)" }}>thử từ khác nhé</span>
          </p>
        </motion.div>
      )}

      {visibleShelves.map((shelf, i) => (
        <ShelfSection
          key={shelf.id}
          shelf={shelf}
          shelfIndex={i}
          onLike={(artId) => onLike(shelf.id, artId)}
          highlightIds={matchIds ?? undefined}
        />
      ))}

      {/* Shelves with no artworks (only show if not searching) */}
      {!q && shelves.filter((s) => s.artworks.length === 0).map((shelf, i) => (
        <motion.div
          key={shelf.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (visibleShelves.length + i) * 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full" style={{ width: 4, height: 4, background: "rgba(197,168,255,0.2)" }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300, fontStyle: "italic",
              fontSize: "0.88rem", letterSpacing: "0.14em",
              color: "rgba(197,168,255,0.3)", textTransform: "uppercase",
            }}>
              {shelf.shelfName}
            </h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(197,168,255,0.1), transparent)" }} />
          </div>
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: 80,
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic", fontWeight: 500,
              fontSize: "0.8rem", color: "rgba(197,168,255,0.45)",
              letterSpacing: "0.08em",
            }}>
              kệ trống
            </p>
          </div>
        </motion.div>
      ))}
    </>
  );
}
