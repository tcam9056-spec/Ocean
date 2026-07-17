/**
 * AgeVerification.tsx
 * ───────────────────────────────────────────────────────────────
 * Popup xác nhận độ tuổi 18+ theo phong cách "bóng nước" (Glassmorphism).
 * Hiển thị trước khi người dùng vào app. Không thể tắt bằng cách bấm ra ngoài.
 * Khi xác nhận → phát nhạc ngay (lách luật chặn autoplay của trình duyệt).
 * ───────────────────────────────────────────────────────────────
 */

import { useState, memo } from "react";
import { motion } from "framer-motion";

interface AgeVerificationProps {
  /** Được gọi sau khi người dùng xác nhận, để App biết mà ẩn popup */
  onConfirm: () => void;
  /** audioRef từ App — dùng để phát nhạc ngay khi xác nhận */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

/* ─── Các mục nội dung cảnh báo ───────────────────────────────── */
const NOTICES = [
  {
    label: "QUY ĐỊNH",
    text: "Cốt truyện chứa nội dung nhạy cảm (18+). Nghiêm cấm người dưới 18 tuổi tham gia dưới mọi hình thức.",
  },
  {
    label: "ĐIỀU KHOẢN",
    text: "Yêu cầu người chơi từ đủ 18 tuổi. Bằng việc tiếp tục, bạn xác nhận mình đã đủ tuổi và hoàn toàn tự chịu trách nhiệm với nội dung trải nghiệm.",
  },
  {
    label: "LƯU Ý",
    text: "Sản phẩm hư cấu 100%, không cổ xúy, không đả kích tôn giáo hay bất kỳ cá nhân nào. Tất cả chỉ tồn tại trong trí tưởng tượng.",
  },
];

/* ─── Màu sắc chủ đạo ─────────────────────────────────────────── */
const TEAL   = "rgba(78,205,196,1)";
const TEAL_D = "rgba(78,205,196,0.18)";
const PURPLE = "rgba(197,168,255,0.85)";

export const AgeVerification = memo(function AgeVerification({
  onConfirm,
  audioRef,
}: AgeVerificationProps) {
  /* Trạng thái nút — tránh bấm nhiều lần */
  const [confirming, setConfirming] = useState(false);

  /**
   * Khi bấm xác nhận:
   * 1. Đánh dấu đang xử lý (vô hiệu hoá nút)
   * 2. Phát nhạc ngay — đây là hành động trong gesture của người dùng
   *    nên trình duyệt sẽ cho phép autoplay
   * 3. Gọi onConfirm để App ẩn popup
   */
  const handleConfirm = () => {
    if (confirming) return;
    setConfirming(true);
    // Kích hoạt nhạc ngay khi có gesture người dùng
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Nếu trình duyệt vẫn chặn (rất hiếm), bỏ qua yên lặng
      });
    }
    onConfirm();
  };

  return (
    /* ── Overlay phủ toàn màn hình — z-index 70 cao hơn SplashScreen (50) ── */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        // Nền tối mờ ảo, tạo chiều sâu cho popup bóng nước
        background: "rgba(4,10,28,0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {/* ── Popup bóng nước chính ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          // Glassmorphism — màu nền trong suốt như bong bóng nước
          background: "rgba(10,22,54,0.55)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          // Viền mỏng ánh sáng như bề mặt bong bóng
          border: "1px solid rgba(78,205,196,0.22)",
          borderRadius: "32px",
          padding: "36px 28px 32px",
          // Bóng đổ nhiều lớp — mô phỏng cảm giác bong bóng nổi lên
          boxShadow: `
            0 8px 64px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 32px 64px rgba(78,205,196,0.07),
            0 -4px 32px rgba(197,168,255,0.08) inset
          `,
          overflow: "hidden",
        }}
      >
        {/* ── Vệt sáng bề mặt bong bóng (highlight) ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
            borderRadius: "50%",
          }}
        />

        {/* ── Icon 18+ ── */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            textAlign: "center",
            fontSize: "clamp(2.2rem, 8vw, 3rem)",
            lineHeight: 1,
            marginBottom: "18px",
            filter: "drop-shadow(0 0 12px rgba(78,205,196,0.6))",
          }}
        >
          🔞
        </motion.div>

        {/* ── Tiêu đề ── */}
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(1.15rem, 4vw, 1.45rem)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(240,244,255,0.92)",
            textShadow: `0 0 18px ${TEAL}, 0 0 40px rgba(78,205,196,0.3)`,
            marginBottom: "24px",
          }}
        >
          Xác nhận độ tuổi
        </h2>

        {/* ── Các mục nội dung cảnh báo ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
          {NOTICES.map(({ label, text }) => (
            <div
              key={label}
              style={{
                // Mỗi mục cũng có nền bong bóng nhỏ hơn
                background: "rgba(78,205,196,0.05)",
                border: "1px solid rgba(78,205,196,0.12)",
                borderRadius: "16px",
                padding: "12px 16px",
              }}
            >
              {/* Nhãn in hoa */}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: TEAL,
                  marginBottom: "5px",
                }}
              >
                {label}
              </span>
              {/* Nội dung */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(0.82rem, 2.8vw, 0.94rem)",
                  fontWeight: 500,
                  color: PURPLE,
                  lineHeight: 1.65,
                  margin: 0,
                  textRendering: "optimizeSpeed",
                } as React.CSSProperties}
              >
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* ── Nút xác nhận hình bóng nước ── */}
        <motion.button
          onClick={handleConfirm}
          disabled={confirming}
          whileHover={{ scale: confirming ? 1 : 1.04 }}
          whileTap={{ scale: confirming ? 1 : 0.96 }}
          style={{
            display: "block",
            width: "100%",
            padding: "15px 24px",
            // Nút cũng glassmorphism, nổi bật hơn popup
            background: confirming
              ? "rgba(78,205,196,0.12)"
              : `linear-gradient(135deg, ${TEAL_D} 0%, rgba(197,168,255,0.15) 100%)`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1.5px solid ${confirming ? "rgba(78,205,196,0.2)" : "rgba(78,205,196,0.45)"}`,
            borderRadius: "999px", // Bo tròn hoàn toàn như bong bóng
            boxShadow: confirming
              ? "none"
              : `0 4px 32px rgba(78,205,196,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset`,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(0.9rem, 3vw, 1.05rem)",
            letterSpacing: "0.1em",
            color: confirming ? "rgba(255,255,255,0.4)" : "rgba(240,244,255,0.95)",
            cursor: confirming ? "default" : "pointer",
            transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s",
            // Ngăn text bị chọn khi bấm nhanh
            userSelect: "none",
          }}
        >
          {confirming ? "Đang vào..." : "Tôi đã đủ 18 tuổi — Xác nhận"}
        </motion.button>
      </motion.div>
    </div>
  );
});
