import { useRef, useState, useEffect } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { OceanBackground } from "@/components/OceanBackground";
import { SplashScreen } from "@/components/SplashScreen";
import { ShowcaseShelf } from "@/components/ShowcaseShelf";
import { StatsBar } from "@/components/StatsBar";
import { AdminPanel } from "@/components/AdminPanel";
import { useShelvesStore } from "@/hooks/useShelvesStore";

/* ─── Audio sources (ambient ocean / cinematic) ───────────────── */
const AUDIO_SOURCES = [
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3",
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
];

/* ─── Mute button ─────────────────────────────────────────────── */
function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <motion.button
      className="fixed top-5 right-5 z-50 rounded-full flex items-center justify-center"
      style={{
        width: 40, height: 40,
        background: "rgba(8,18,42,0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${isMuted ? "rgba(197,168,255,0.12)" : "rgba(78,205,196,0.28)"}`,
        color: isMuted ? "rgba(197,168,255,0.35)" : "rgba(78,205,196,0.75)",
        boxShadow: isMuted ? "none" : "0 0 14px rgba(78,205,196,0.12)",
        fontSize: "16px",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      whileHover={{ scale: 1.1, boxShadow: "0 0 18px rgba(78,205,196,0.2)" }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      data-testid="button-mute-toggle"
      transition={{ duration: 0.15 }}
    >
      {isMuted ? "🔇" : "🎵"}
    </motion.button>
  );
}

/* ─── Main app ────────────────────────────────────────────────── */
function OceanApp() {
  const [entered, setEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() =>
    localStorage.getItem("ocean_admin_email") === "tcam9056@gmail.com"
  );
  const [search, setSearch] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const srcIdxRef = useRef(0);

  const store = useShelvesStore();

  /* ── Audio setup ── */
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.38;
    audio.preload = "none";

    const tryNext = () => {
      srcIdxRef.current += 1;
      if (srcIdxRef.current < AUDIO_SOURCES.length) {
        audio.src = AUDIO_SOURCES[srcIdxRef.current];
        audio.load();
      }
    };

    audio.addEventListener("error", tryNext, { passive: true });
    audio.src = AUDIO_SOURCES[0];
    audio.load();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("error", tryNext);
      audio.src = "";
    };
  }, []);

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.muted = true;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="ocean-root">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      <OceanBackground />

      <AnimatePresence>
        {!entered && (
          <SplashScreen onEnter={() => setEntered(true)} audioRef={audioRef} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="relative z-10 min-h-screen"
          >
            <MuteButton isMuted={isMuted} onToggle={handleMuteToggle} />

            <div className="ocean-scroll-container">
              <div
                className="mx-auto px-4 sm:px-6 py-16 sm:py-20"
                style={{ maxWidth: 900 }}
              >
                {/* Header */}
                <motion.header
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1.3 }}
                >
                  <motion.h1
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 300,
                      fontSize: "clamp(1.8rem, 5vw, 3rem)",
                      color: "rgba(240,244,255,0.88)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textShadow: `
                        0 0 28px rgba(197,168,255,0.4),
                        0 0 60px rgba(78,205,196,0.15),
                        0 2px 10px rgba(0,0,0,0.5)
                      `,
                    }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Ocean
                  </motion.h1>

                  <motion.div
                    className="flex justify-center gap-2 items-center mt-4"
                    animate={{ opacity: [0.25, 0.65, 0.25] }}
                    transition={{ duration: 4.5, repeat: Infinity }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: i === 3 ? 5 : 2.5,
                          height: i === 3 ? 5 : 2.5,
                          background: i % 2 === 0 ? "rgba(78,205,196,0.55)" : "rgba(197,168,255,0.55)",
                          boxShadow: i === 3 ? "0 0 8px rgba(197,168,255,0.6)" : "none",
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </motion.div>
                </motion.header>

                <StatsBar shelves={store.shelves} />

                <motion.p
                  className="text-center mb-8"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300, fontStyle: "italic",
                    fontSize: "0.72rem", letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(197,168,255,0.28)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  — kệ trưng bày —
                </motion.p>

                <ShowcaseShelf
                  shelves={store.shelves}
                  search={search}
                  onSearchChange={setSearch}
                  onLike={store.likeArtwork}
                />

                <div className="h-32" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminPanel
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        shelves={store.shelves}
        onCreateShelf={store.createShelf}
        onRenameShelf={store.renameShelf}
        onDeleteShelf={store.deleteShelf}
        onAddArtwork={store.addArtwork}
        onUpdateArtwork={store.updateArtwork}
        onDeleteArtwork={store.deleteArtwork}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
            background: "rgba(8,18,42,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(197,168,255,0.22)",
            borderRadius: "999px",
            color: "rgba(240,244,255,0.92)",
            fontSize: "0.95rem",
            padding: "11px 24px",
            boxShadow: "0 8px 32px rgba(0,10,40,0.5), 0 0 24px rgba(197,168,255,0.1)",
            letterSpacing: "0.02em",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return <OceanApp />;
}
