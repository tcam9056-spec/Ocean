import { useMemo, useState, useEffect } from "react";
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
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          padding: "11px 20px 11px 38px",
          color: "#ffffff",
          fontSize: "0.85rem",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          letterSpacing: "0.04em",
          outline: "none",
          boxShadow: "inset 0 0 10px rgba(255,255,255,0.03), 0 4px 15px rgba(0,0,0,0.15)",
          textShadow: "1px 1px 3px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.7)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(78,205,196,0.45)";
          e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(78,205,196,0.05), 0 0 0 2px rgba(78,205,196,0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(255,255,255,0.03), 0 4px 15px rgba(0,0,0,0.15)";
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
        minHeight: 130,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        boxShadow: "inset 0 0 10px rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.1)",
        padding: "16px",
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
            color: "#ffffff",
            textShadow: `1px 1px 3px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.7), 0 0 18px ${accent.glow}0.4)`,
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
              color: "rgba(220,200,255,0.95)",
              lineHeight: 1.55,
              wordBreak: "break-word",
              textShadow: "1px 1px 3px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.7)",
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
              <span style={{ fontSize: "14px", lineHeight: 1, filter: artwork.likes > 0 ? "drop-shadow(0 0 6px rgba(78,205,196,0.9))" : "none" }}>
                🪼
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
            color: "rgba(197,168,255,0.85)",
            textTransform: "uppercase",
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          {shelf.shelfName}
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(to right, rgba(197,168,255,0.15), transparent)" }}
        />
      </div>

      {/* Artwork grid */}
      <div
        className="overflow-hidden"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1px",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
        }}
      >
        {visible.map((art, idx) => (
          <ArtworkCell
            key={art.id}
            artwork={art}
            weight={1}
            accent={NEON[idx % NEON.length]}
            onLike={() => onLike(art.id)}
            isLast={true}
          />
        ))}
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
        <div key={ri} style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1px",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          overflow: "hidden",
        }}>
          {[0, 1].map((ci) => (
            <motion.div
              key={ci}
              style={{ minHeight: 130, padding: "22px 18px 18px", background: "rgba(255,255,255,0.03)" }}
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
const ITEMS_PER_PAGE = 6;

export function ShowcaseShelf({ shelves, search, onSearchChange, onLike }: ShowcaseShelfProps) {
  const [page, setPage] = useState(0);
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

  // Flatten all visible artworks with shelf reference
  const allItems = useMemo(() => {
    let idx = 0;
    const items: Array<{ artwork: Artwork; shelfId: string; accent: typeof NEON[0]; shelfName: string }> = [];
    for (const shelf of visibleShelves) {
      const arts = matchIds ? shelf.artworks.filter((a) => matchIds.has(a.id)) : shelf.artworks;
      for (const artwork of arts) {
        items.push({ artwork, shelfId: shelf.id, accent: NEON[idx % NEON.length], shelfName: shelf.shelfName });
        idx++;
      }
    }
    return items;
  }, [visibleShelves, matchIds]);

  // Reset to page 0 whenever search changes
  useEffect(() => { setPage(0); }, [search]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = allItems.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);

  const isEmpty = shelves.every((s) => s.artworks.length === 0) && shelves.length === 0;
  const noResults = !isEmpty && visibleShelves.length === 0 && !!q;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <SearchBar value={search} onChange={onSearchChange} />

      {/* Empty library */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
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
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}>
            Kệ đang trống...
            <br />
            <span style={{ fontSize: "0.92rem", color: "rgba(197,168,255,0.28)" }}>
              biển chờ đón những tác phẩm đầu tiên
            </span>
          </p>
        </motion.div>
      )}

      {/* No search results */}
      {noResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-14"
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontStyle: "italic",
            fontSize: "1.05rem", color: "rgba(197,168,255,0.4)", lineHeight: 1.7,
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}>
            Không tìm thấy tác phẩm nào...
            <br />
            <span style={{ fontSize: "0.82rem", color: "rgba(197,168,255,0.25)" }}>thử từ khác nhé</span>
          </p>
        </motion.div>
      )}

      {/* Ocean divider decoration */}
      {!isEmpty && !noResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          aria-hidden
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.6)",
            fontSize: "18px",
            marginBottom: "16px",
            marginTop: "-4px",
            textShadow: "0 0 8px rgba(255,255,255,0.4)",
            letterSpacing: "4px",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          𓆝 𓆟 𓆞 𓇼 ⋆.° 𓆉 𓆡 ⋆.˚ 𓇼
        </motion.div>
      )}

      {/* Paginated artwork grid */}
      {!isEmpty && !noResults && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "20px",
            padding: "12px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={safePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              {pageItems.map(({ artwork, shelfId, accent }) => (
                <ArtworkCell
                  key={artwork.id}
                  artwork={artwork}
                  weight={1}
                  accent={accent}
                  onLike={() => onLike(shelfId, artwork.id)}
                  isLast={true}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Pagination controls */}
      {!isEmpty && !noResults && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", paddingTop: "4px", paddingBottom: "8px" }}>
          {/* Prev */}
          <motion.button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: safePage === 0 ? "rgba(197,168,255,0.2)" : "rgba(197,168,255,0.6)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1rem", cursor: safePage === 0 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            aria-label="Trang trước"
          >‹</motion.button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i}
              onClick={() => setPage(i)}
              whileTap={{ scale: 0.88 }}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: i === safePage ? "rgba(78,205,196,0.12)" : "transparent",
                border: i === safePage
                  ? "1px solid rgba(78,205,196,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                color: i === safePage ? "rgba(78,205,196,0.95)" : "rgba(197,168,255,0.55)",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "0.85rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                transition: "all 0.2s",
              }}
              aria-label={`Trang ${i + 1}`}
              aria-current={i === safePage ? "page" : undefined}
            >
              {i + 1}
            </motion.button>
          ))}

          {/* Next */}
          <motion.button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: safePage === totalPages - 1 ? "rgba(197,168,255,0.2)" : "rgba(197,168,255,0.6)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1rem", cursor: safePage === totalPages - 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            aria-label="Trang tiếp"
          >›</motion.button>
        </div>
      )}
    </div>
  );
}
