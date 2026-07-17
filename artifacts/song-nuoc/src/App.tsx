import { useRef, useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { OceanBackground } from "@/components/OceanBackground";
import { AgeVerification } from "@/components/AgeVerification";
import { SplashScreen } from "@/components/SplashScreen";
import { ShowcaseShelf } from "@/components/ShowcaseShelf";
import { StatsBar } from "@/components/StatsBar";
import { useShelvesStore } from "@/hooks/useShelvesStore";

// AdminPanel is 1000+ lines and only used by admins — lazy-load it
// so it doesn't inflate the initial bundle for regular visitors.
const AdminPanel = lazy(() =>
  import("@/components/AdminPanel").then((m) => ({ default: m.AdminPanel }))
);

/* ─── Danh sách nhạc nền ──────────────────────────────────────────
   Để thêm bài mới: copy file .mp3 vào thư mục public/ rồi thêm
   tên file vào mảng PLAYLIST bên dưới, ví dụ: "/bai-moi.mp3"
──────────────────────────────────────────────────────────────── */
const PLAYLIST = [
  "/bg-music.mp3",
  "/nhac_video_1.mp4",
];

/**
 * Chọn ngẫu nhiên một bài khác với bài đang phát.
 * Nếu playlist chỉ có 1 bài thì trả lại bài đó.
 */
function pickNextRandom(currentSrc: string): string {
  if (PLAYLIST.length === 1) return PLAYLIST[0];
  const others = PLAYLIST.filter((s) => s !== currentSrc);
  return others[Math.floor(Math.random() * others.length)];
}

/* ─── Mute button ─────────────────────────────────────────────── */
const MuteButton = memo(function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
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
        transform: "translateZ(0)",
        willChange: "transform",
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
});

/* ─── Main app ────────────────────────────────────────────────── */
function OceanApp() {
  // Trạng thái xác nhận độ tuổi — false = chưa xác nhận, hiển thị popup 18+
  const [ageVerified, setAgeVerified] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() =>
    localStorage.getItem("ocean_admin_email") === "tcam9056@gmail.com"
  );
  const [search, setSearch] = useState("");

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  // Lưu src đang phát để hàm ended có thể đọc mà không cần closure cũ
  const currentSrcRef = useRef<string>(PLAYLIST[Math.floor(Math.random() * PLAYLIST.length)]);

  const store = useShelvesStore();

  /* ── Audio setup ──────────────────────────────────────────────────
     Giải thích:
     1. Khởi tạo Audio object với bài ngẫu nhiên đầu tiên.
     2. KHÔNG dùng loop — thay vào đó lắng nghe sự kiện "ended".
     3. Khi "ended" kích hoạt → chọn ngẫu nhiên bài tiếp → phát tiếp.
     4. Việc phát bài đầu tiên do SplashScreen kích hoạt (click của
        người dùng) → tuân thủ luật autoplay của trình duyệt.
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.38;
    audio.preload = "none";
    // Bài ngẫu nhiên đầu tiên đã được chọn lúc khởi tạo ref
    audio.src = currentSrcRef.current;
    audio.load();
    audioRef.current = audio;

    // Khi một bài kết thúc → chọn bài ngẫu nhiên khác → phát tiếp
    const handleEnded = () => {
      const next = pickNextRandom(currentSrcRef.current);
      currentSrcRef.current = next;
      audio.src = next;
      audio.load();
      // Chỉ phát nếu người dùng chưa tắt tiếng
      if (!audio.muted) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  /* ── Nút tắt/mở nhạc ─────────────────────────────────────────── */
  const handleMuteToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsMuted((prev) => {
      if (prev) {
        // Đang tắt → bật lại: bỏ mute và phát tiếp
        audio.muted = false;
        audio.play().catch(() => {});
      } else {
        // Đang bật → tắt: chỉ mute, không dừng hoàn toàn
        // (giữ vị trí bài để khi bật lại phát tiếp tục)
        audio.muted = true;
      }
      return !prev;
    });
  }, []);

  return (
    <div className="ocean-root">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          transform: "translateZ(0)",
          willChange: "transform",
          pointerEvents: "none",
        }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      <OceanBackground />

      {/* ── Popup xác nhận 18+ — hiển thị trước mọi thứ khác ── */}
      {!ageVerified && (
        <AgeVerification
          audioRef={audioRef}
          onConfirm={() => setAgeVerified(true)}
        />
      )}

      {/* ── Màn hình Splash — chỉ hiện sau khi đã xác nhận tuổi ── */}
      <AnimatePresence>
        {ageVerified && !entered && (
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
            <a
              href="https://www.facebook.com/profile.php?id=61586109384108"
              target="_blank"
              rel="noopener noreferrer"
              className="page-link-btn"
            >
              page
            </a>
            <MuteButton isMuted={isMuted} onToggle={handleMuteToggle} />

            <div className="ocean-scroll-container">
              <div
                className="mx-auto px-4 sm:px-6 py-8"
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

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
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
      </Suspense>

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
