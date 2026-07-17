import { useMemo, useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Shelf, Artwork } from "@/hooks/useShelvesStore";

/* ─── Shared text-shadow for readability ──────────────────────── */
const TEXT_SHADOW = "1px 1px 3px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.7)";

/* ─── Neon accents ────────────────────────────────────────────── */
const NEON = [
  { glow: "rgba(78,205,196,",   border: "rgba(78,205,196,"   },
  { glow: "rgba(197,168,255,",  border: "rgba(197,168,255,"  },
  { glow: "rgba(120,200,255,",  border: "rgba(120,200,255,"  },
  { glow: "rgba(160,240,220,",  border: "rgba(160,240,220,"  },
];

/* ─── Ocean divider strip ─────────────────────────────────────── */
const OCEAN_STRIP = "༄ ⋆ ˚ ｡ ° 𓆉 𓆝 𓆟 〰 ≋ ࿐";

/* ─── SearchBar ────────────────────────────────────────────────── */
const SearchBar = memo(function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.9 }}
      className="relative"
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
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          padding: "11px 20px 11px 38px",
          color: "#ffffff",
          fontSize: "0.85rem",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          letterSpacing: "0.04em",
          outline: "none",
          textShadow: TEXT_SHADOW,
          transition: "border-color 0.3s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(78,205,196,0.45)"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
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
              background: "none", border: "none",
              cursor: "pointer", padding: "6px",
              touchAction: "manipulation",
            }}
            aria-label="Xóa tìm kiếm"
          >✕</motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* ─── Artwork card ────────────────────────────────────────────── */
interface ArtworkCellProps {
  artwork: Artwork;
  accent: typeof NEON[0];
  onLike: () => void;
}

const ArtworkCell = memo(function ArtworkCell({ artwork, accent, onLike }: ArtworkCellProps) {
  const [liking, setLiking]  = useState(false);
  const [burst, setBurst]    = useState<{ id: number; angle: number; color: string; dist: number; size: number }[]>([]);

  let hostname = "";
  try { hostname = new URL(artwork.link).hostname; } catch { hostname = artwork.link; }

  const isValidUrl = (() => { try { new URL(artwork.link); return true; } catch { return false; } })();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
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
    if (!isValidUrl) { e.preventDefault(); toast.error("Link không hợp lệ"); }
  };

  return (
    <div
      className="group relative"
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        transition: "border-color 0.3s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${accent.border}0.25)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to top, ${accent.glow}0.08) 0%, transparent 70%)`, zIndex: 0 }}
      />

      <a
        href={isValidUrl ? artwork.link : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="block p-4"
        style={{ zIndex: 1, position: "relative", cursor: isValidUrl ? "pointer" : "default" }}
      >
        <h3
          className="leading-snug mb-1.5"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
            color: "#ffffff",
            textShadow: `${TEXT_SHADOW}, 0 0 18px ${accent.glow}0.35)`,
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
              fontSize: "clamp(0.74rem, 1.1vw, 0.84rem)",
              color: "rgba(220,200,255,0.9)",
              lineHeight: 1.55,
              wordBreak: "break-word",
              textShadow: TEXT_SHADOW,
            }}
          >
            {artwork.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div
              className="rounded-full shrink-0"
              style={{ width: 3, height: 3, background: `${accent.border}0.6)`, boxShadow: `0 0 4px ${accent.glow}0.4)` }}
            />
            <span
              className="truncate"
              style={{ color: "rgba(150,190,210,0.4)", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "0.66rem", letterSpacing: "0.03em" }}
            >
              {isValidUrl ? hostname : "link không hợp lệ"}
            </span>
          </div>

          {/* Like button */}
          <div className="relative shrink-0">
            <AnimatePresence>
              {burst.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{ width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`, left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
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
              style={{ color: artwork.likes > 0 ? "rgba(255,155,195,0.95)" : "rgba(197,168,255,0.5)", background: "none", border: "none", cursor: "pointer", touchAction: "manipulation" }}
              animate={liking ? { scale: [1, 1.6, 0.85, 1.25, 1], rotate: [0, -10, 10, -4, 0] } : {}}
              whileTap={{ scale: 0.78 }}
              transition={{ duration: 0.55 }}
              disabled={liking}
              aria-label="Thích"
            >
              <span style={{ fontSize: "14px", lineHeight: 1, filter: artwork.likes > 0 ? "drop-shadow(0 0 6px rgba(78,205,196,0.9))" : "none" }}>🪼</span>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontSize: "0.8rem", textShadow: TEXT_SHADOW }}>
                {artwork.likes}
              </span>
            </motion.button>
          </div>
        </div>
      </a>
    </div>
  );
});

/* ─── Shelf Dropdown ──────────────────────────────────────────── */
interface ShelfDropdownProps {
  shelves: Shelf[];
  currentIndex: number;
  onSelect: (idx: number) => void;
  onClose: () => void;
}

function ShelfDropdown({ shelves, currentIndex, onSelect, onClose }: ShelfDropdownProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={dropRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        minWidth: 260,
        maxWidth: 340,
        width: "max-content",
        background: "transparent",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      {/* Top ocean divider */}
      <div style={{
        textAlign: "center",
        color: "rgba(255,255,255,0.75)",
        fontSize: "13px",
        letterSpacing: "2px",
        paddingBottom: "10px",
        userSelect: "none",
        textShadow: "0 0 8px rgba(255,255,255,0.6)",
        lineHeight: 1.6,
      }}>
        {OCEAN_STRIP}
      </div>

      {/* Shelf list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px" }}>
        {shelves.map((shelf, idx) => {
          const isActive = idx === currentIndex;
          const isHovered = hoveredId === shelf.id;
          return (
            <motion.button
              key={shelf.id}
              onClick={() => { onSelect(idx); onClose(); }}
              onMouseEnter={() => setHoveredId(shelf.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              {/* Active dot */}
              <motion.div
                style={{
                  width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                  background: isActive ? "rgba(78,205,196,0.9)" : `${NEON[idx % NEON.length].border}0.45)`,
                  boxShadow: isActive ? "0 0 8px rgba(78,205,196,0.7)" : "none",
                  transition: "all 0.2s",
                }}
                animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Shelf name */}
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: isActive ? 600 : 400,
                fontSize: "1rem",
                letterSpacing: "0.08em",
                color: "#ffffff",
                textShadow: "1px 1px 3px black, 0 0 12px rgba(0,0,0,0.8)",
                flex: 1,
                transition: "all 0.2s",
              }}>
                {shelf.shelfName}
              </span>

              {/* Hover icon cluster */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.8)",
                      textShadow: "0 0 8px rgba(255,255,255,0.5)",
                      letterSpacing: "1px",
                      flexShrink: 0,
                      userSelect: "none",
                    }}
                  >
                    𓆝 𓆟 ⊹ ࣪ ˖
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom ocean divider */}
      <div style={{
        textAlign: "center",
        color: "rgba(255,255,255,0.75)",
        fontSize: "13px",
        letterSpacing: "2px",
        paddingTop: "10px",
        userSelect: "none",
        textShadow: "0 0 8px rgba(255,255,255,0.6)",
        lineHeight: 1.6,
      }}>
        {OCEAN_STRIP}
      </div>
    </motion.div>
  );
}

/* ─── Main ShowcaseShelf ──────────────────────────────────────── */
interface ShowcaseShelfProps {
  shelves: Shelf[];
  search: string;
  onSearchChange: (v: string) => void;
  onLike: (shelfId: string, artId: string) => void;
}

export function ShowcaseShelf({ shelves, search, onSearchChange, onLike }: ShowcaseShelfProps) {
  const [shelfIndex, setShelfIndex] = useState(0);
  const [dropOpen, setDropOpen]     = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const q = search.trim().toLowerCase();

  /* Non-empty shelves */
  const nonEmpty = useMemo(() => shelves.filter((s) => s.artworks.length > 0), [shelves]);

  /* Clamp shelfIndex */
  const safeIdx      = Math.min(shelfIndex, Math.max(0, nonEmpty.length - 1));
  const currentShelf = nonEmpty[safeIdx] ?? null;

  /* Search mode: flatten + filter across all shelves */
  const searchResults = useMemo<Array<{ artwork: Artwork; shelfId: string; shelfName: string; accent: typeof NEON[0] }> | null>(() => {
    if (!q) return null;
    const items: Array<{ artwork: Artwork; shelfId: string; shelfName: string; accent: typeof NEON[0] }> = [];
    for (const shelf of shelves) {
      const shelfMatch = shelf.shelfName.toLowerCase().includes(q);
      for (const art of shelf.artworks) {
        if (
          shelfMatch ||
          art.title.toLowerCase().includes(q) ||
          art.description.toLowerCase().includes(q) ||
          art.link.toLowerCase().includes(q)
        ) {
          items.push({ artwork: art, shelfId: shelf.id, shelfName: shelf.shelfName, accent: NEON[items.length % NEON.length] });
        }
      }
    }
    return items;
  }, [shelves, q]);

  /* Reset shelf to 0 when search is cleared */
  useEffect(() => { if (!q) setShelfIndex(0); }, [q]);

  /* Close dropdown when search is activated */
  useEffect(() => { if (q) setDropOpen(false); }, [q]);

  const isEmpty     = shelves.length === 0;
  const noResults   = searchResults !== null && searchResults.length === 0;
  const isSearching = searchResults !== null;

  /* Current shelf artworks for normal mode */
  const shelfArtworks = useMemo(() =>
    currentShelf
      ? currentShelf.artworks.map((art, i) => ({
          artwork: art,
          shelfId: currentShelf.id,
          accent: NEON[i % NEON.length],
        }))
      : [],
    [currentShelf]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      {/* Row: search + large bubble menu button */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={onSearchChange} />
        </div>

        {/* Large Bubble Menu Button */}
        {!isEmpty && (
          <div ref={menuWrapRef} style={{ position: "relative", flexShrink: 0 }}>
            <motion.button
              onClick={() => setDropOpen((o) => !o)}
              whileTap={{ scale: 0.94 }}
              whileHover={{ boxShadow: "0 0 28px rgba(255,255,255,0.28), 0 0 10px rgba(197,168,255,0.3)" }}
              style={{
                padding: "12px 28px",
                borderRadius: "50px",
                background: dropOpen
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                fontSize: "18px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                boxShadow: "0 0 20px rgba(255,255,255,0.2)",
                textShadow: TEXT_SHADOW,
                whiteSpace: "nowrap",
                transition: "background 0.2s",
                touchAction: "manipulation",
              }}
              aria-label="Danh mục Kệ"
              aria-expanded={dropOpen}
            >
              𐙚 Lưu Ly. 𐙚
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropOpen && (
                <ShelfDropdown
                  shelves={nonEmpty}
                  currentIndex={safeIdx}
                  onSelect={(idx) => {
                    setShelfIndex(idx);
                    setDropOpen(false);
                  }}
                  onClose={() => setDropOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Empty library ── */}
      {isEmpty && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <motion.div className="flex justify-center gap-2 mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: i === 2 ? 7 : 4, height: i === 2 ? 7 : 4, background: i % 2 === 0 ? "rgba(78,205,196,0.45)" : "rgba(197,168,255,0.45)" }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "1.3rem", color: "rgba(240,244,255,0.38)", fontStyle: "italic", lineHeight: 1.7, textShadow: TEXT_SHADOW }}>
            Kệ đang trống...
            <br />
            <span style={{ fontSize: "0.92rem", color: "rgba(197,168,255,0.28)" }}>biển chờ đón những tác phẩm đầu tiên</span>
          </p>
        </motion.div>
      )}

      {/* ── No search results ── */}
      {noResults && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-14">
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.05rem", color: "rgba(197,168,255,0.4)", lineHeight: 1.7, textShadow: TEXT_SHADOW }}>
            Không tìm thấy tác phẩm nào...
            <br />
            <span style={{ fontSize: "0.82rem", color: "rgba(197,168,255,0.25)" }}>thử từ khác nhé</span>
          </p>
        </motion.div>
      )}

      {/* ── SEARCH RESULTS MODE ── */}
      {isSearching && !noResults && searchResults && (
        <div>
          {/* Ocean divider */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
            aria-hidden
            style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "16px", letterSpacing: "4px", margin: "4px 0 14px", userSelect: "none", pointerEvents: "none", textShadow: "0 0 8px rgba(255,255,255,0.35)" }}
          >
            𓆝 𓆟 𓆞 𓇼 ⋆.° 𓆉 𓆡 ⋆.˚ 𓇼
          </motion.div>

          <p style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(197,168,255,0.45)", letterSpacing: "0.1em", marginBottom: "12px", textShadow: TEXT_SHADOW }}>
            {searchResults.length} kết quả
          </p>

          {/* Scrollable results */}
          <div style={{ height: "60vh", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(197,168,255,0.2) transparent" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {searchResults.map(({ artwork, shelfId, accent }) => (
                <ArtworkCell key={artwork.id} artwork={artwork} accent={accent} onLike={() => onLike(shelfId, artwork.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NORMAL MODE: 1 shelf at a time ── */}
      {!isSearching && !isEmpty && currentShelf && (
        <div style={{ display: "flex", flexDirection: "column" }}>

          {/* Fixed header: ocean divider + shelf name */}
          <div style={{ position: "sticky", top: 0, zIndex: 10, paddingBottom: "4px" }}>
            {/* Ocean divider */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.2 }}
              aria-hidden
              style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "16px", letterSpacing: "4px", margin: "4px 0 10px", userSelect: "none", pointerEvents: "none", textShadow: "0 0 8px rgba(255,255,255,0.35)" }}
            >
              𓆝 𓆟 𓆞 𓇼 ⋆.° 𓆉 𓆡 ⋆.˚ 𓇼
            </motion.div>

            {/* Shelf name — always visible, never scrolls away */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentShelf.id + "-name"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                style={{
                  textAlign: "center",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 500,
                  fontStyle: "italic",
                  fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  textShadow: `1px 1px 4px black, 0 0 20px rgba(197,168,255,0.4), 0 2px 8px rgba(0,0,0,0.9)`,
                  marginBottom: "14px",
                }}
              >
                {currentShelf.shelfName}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Internal-scroll artwork list — body never scrolls */}
          <div
            style={{
              height: "60vh",
              overflowY: "auto",
              paddingRight: "4px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(197,168,255,0.2) transparent",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentShelf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", paddingBottom: "8px" }}
              >
                {shelfArtworks.map(({ artwork, shelfId, accent }) => (
                  <ArtworkCell key={artwork.id} artwork={artwork} accent={accent} onLike={() => onLike(shelfId, artwork.id)} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Shelf pagination dots (kept for discoverability) */}
          {nonEmpty.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", paddingTop: "12px" }}>
              {/* Prev */}
              <motion.button
                onClick={() => setShelfIndex((i) => Math.max(0, i - 1))}
                disabled={safeIdx === 0}
                whileTap={{ scale: 0.88 }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: safeIdx === 0 ? "rgba(197,168,255,0.15)" : "rgba(197,168,255,0.6)",
                  fontSize: "1.1rem", cursor: safeIdx === 0 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Kệ trước"
              >‹</motion.button>

              {/* Shelf dots */}
              {nonEmpty.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setShelfIndex(idx)}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: idx === safeIdx ? 28 : 24,
                    height: idx === safeIdx ? 28 : 24,
                    borderRadius: "50%",
                    background: idx === safeIdx ? "rgba(78,205,196,0.1)" : "transparent",
                    border: `1px solid ${idx === safeIdx ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.12)"}`,
                    color: idx === safeIdx ? "rgba(78,205,196,0.95)" : "rgba(197,168,255,0.45)",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "0.78rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textShadow: idx === safeIdx ? TEXT_SHADOW : "none",
                    transition: "all 0.2s",
                  }}
                  aria-label={`Kệ ${idx + 1}`}
                  aria-current={idx === safeIdx ? "page" : undefined}
                >
                  {idx + 1}
                </motion.button>
              ))}

              {/* Next */}
              <motion.button
                onClick={() => setShelfIndex((i) => Math.min(nonEmpty.length - 1, i + 1))}
                disabled={safeIdx === nonEmpty.length - 1}
                whileTap={{ scale: 0.88 }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: safeIdx === nonEmpty.length - 1 ? "rgba(197,168,255,0.15)" : "rgba(197,168,255,0.6)",
                  fontSize: "1.1rem", cursor: safeIdx === nonEmpty.length - 1 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Kệ tiếp"
              >›</motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
