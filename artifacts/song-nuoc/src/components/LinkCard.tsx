import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ShowcaseLink,
  useDeleteLink,
  useLikeLink,
  getListLinksQueryKey,
  getGetLinksStatsQueryKey,
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LinkCardProps {
  link: ShowcaseLink;
  isAdmin: boolean;
  cardIndex: number;
}

const blobShapes = [
  "62% 38% 46% 54% / 52% 44% 56% 48%",
  "38% 62% 54% 46% / 48% 56% 44% 52%",
  "54% 46% 62% 38% / 44% 52% 48% 56%",
  "46% 54% 38% 62% / 56% 48% 52% 44%",
];

const blobHoverShapes = [
  "55% 45% 52% 48% / 48% 52% 46% 54%",
  "45% 55% 48% 52% / 52% 46% 54% 48%",
  "50% 50% 55% 45% / 46% 54% 50% 50%",
  "48% 52% 44% 56% / 54% 44% 52% 46%",
];

const neonColors = [
  { border: "rgba(78,205,196,", glow: "rgba(78,205,196," },
  { border: "rgba(197,168,255,", glow: "rgba(197,168,255," },
  { border: "rgba(120,200,255,", glow: "rgba(120,200,255," },
  { border: "rgba(160,240,220,", glow: "rgba(160,240,220," },
];

interface BurstParticle {
  id: number;
  angle: number;
  color: string;
  dist: number;
  size: number;
}

interface BubbleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export function LinkCard({ link, isAdmin, cardIndex }: LinkCardProps) {
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);
  const [burst, setBurst] = useState<BurstParticle[]>([]);
  const [deleted, setDeleted] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  const blobIdx = cardIndex % 4;
  const blobRadius = blobShapes[blobIdx];
  const blobHover = blobHoverShapes[blobIdx];
  const neon = neonColors[blobIdx];

  const bubbles = useMemo<BubbleParticle[]>(() => (
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 4 + Math.random() * 10,
      delay: i * 0.06,
    }))
  ), []);

  const likeMutation = useLikeLink({
    mutation: {
      onSuccess: () => {
        toast.success("Yêu thích ♥");
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLinksStatsQueryKey() });
      },
      onError: () => toast.error("Có lỗi xảy ra, thử lại nhé"),
      onSettled: () => setIsLiking(false),
    },
  });

  const deleteMutation = useDeleteLink({
    mutation: {
      onSuccess: () => {
        toast.success("Tác phẩm đã tan vào biển cả");
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLinksStatsQueryKey() });
      },
      onError: () => {
        setDissolving(false);
        setDeleted(false);
        toast.error("Có lỗi xảy ra, thử lại nhé");
      },
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking || likeMutation.isPending) return;
    setIsLiking(true);
    const burstColors = [
      "rgba(78,205,196,0.95)", "rgba(197,168,255,0.95)",
      "rgba(240,244,255,0.9)", "rgba(255,160,200,0.9)",
      "rgba(120,220,255,0.9)", "rgba(160,255,220,0.9)",
      "rgba(230,180,255,0.9)", "rgba(100,200,255,0.9)",
    ];
    setBurst(
      Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 45 * Math.PI) / 180,
        color: burstColors[i],
        dist: 24 + Math.random() * 12,
        size: 2.5 + Math.random() * 3,
      }))
    );
    setTimeout(() => setBurst([]), 700);
    likeMutation.mutate({ id: link.id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleteMutation.isPending || dissolving) return;
    setDissolving(true);
    deleteMutation.mutate({ id: link.id });
    setTimeout(() => setDeleted(true), 900);
  };

  let hostname = "";
  try {
    hostname = new URL(link.url).hostname;
  } catch {
    hostname = link.url;
  }

  return (
    <AnimatePresence>
      {!deleted && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={
            dissolving
              ? {
                  opacity: [1, 0.8, 0.4, 0],
                  scale: [1, 1.06, 0.92, 0.7],
                  filter: ["blur(0px)", "blur(1px)", "blur(4px)", "blur(8px)"],
                }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={{ opacity: 0, scale: 0.75, y: -15, filter: "blur(6px)" }}
          whileHover={
            dissolving
              ? {}
              : {
                  y: -10,
                  borderRadius: blobHover,
                  boxShadow: `
                    0 24px 48px rgba(0,10,40,0.6),
                    0 0 0 1px ${neon.border}0.5),
                    0 0 30px ${neon.glow}0.22),
                    0 0 70px ${neon.glow}0.1),
                    inset 0 1px 0 rgba(240,244,255,0.14)
                  `,
                  transition: { duration: 0.4, ease: "easeOut" },
                }
          }
          transition={{ duration: dissolving ? 0.85 : 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative group w-full max-w-sm"
          style={{
            background: "rgba(8,18,42,0.32)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: blobRadius,
            border: `1px solid ${neon.border}0.25)`,
            boxShadow: `
              0 8px 32px rgba(0,10,40,0.5),
              0 0 0 1px ${neon.border}0.08),
              inset 0 1px 0 rgba(240,244,255,0.09)
            `,
            willChange: "transform, border-radius, box-shadow",
            contain: "paint layout",
          }}
          data-testid={`link-card-${link.id}`}
        >
          {/* Dissolve bubbles */}
          <AnimatePresence>
            {dissolving && bubbles.map((b) => (
              <motion.div
                key={b.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.size,
                  height: b.size,
                  background: "transparent",
                  border: `1px solid ${neon.border}0.7)`,
                  boxShadow: `0 0 ${b.size * 2}px ${neon.border}0.4)`,
                  zIndex: 20,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0.8], opacity: [0, 0.9, 0], y: -30 - b.size * 3 }}
                transition={{ duration: 0.8, delay: b.delay, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          {/* Hover shimmer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(130deg, transparent 30%, ${neon.border}0.05) 50%, transparent 70%)`,
              }}
            />
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 relative z-10"
            data-testid={`link-anchor-${link.id}`}
          >
            {/* Delete button — trash icon */}
            {isAdmin && (
              <motion.button
                onClick={handleDelete}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 rounded-full flex items-center justify-center"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(180,40,80,0.15)",
                  border: "1px solid rgba(255,100,120,0.22)",
                  color: "rgba(255,120,140,0.65)",
                  fontSize: "11px",
                }}
                whileHover={{
                  background: "rgba(180,40,80,0.35)",
                  color: "rgba(255,180,190,1)",
                  scale: 1.1,
                  boxShadow: "0 0 12px rgba(255,80,120,0.3)",
                }}
                whileTap={{ scale: 0.88 }}
                disabled={deleteMutation.isPending || dissolving}
                data-testid={`button-delete-${link.id}`}
                aria-label="Xóa tác phẩm"
              >
                🗑
              </motion.button>
            )}

            {/* Title */}
            <h3
              className="leading-snug mb-3 pr-7"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: "1.25rem",
                color: "rgba(240,244,255,0.94)",
                textShadow: `0 0 18px ${neon.glow}0.35)`,
                letterSpacing: "0.01em",
              }}
            >
              {link.title}
            </h3>

            {/* Description */}
            {link.description && (
              <motion.p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "0.92rem",
                  color: "rgba(197,168,255,0.78)",
                  lineHeight: 1.65,
                  marginBottom: "1rem",
                  textRendering: "optimizeSpeed",
                } as React.CSSProperties}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                {link.description}
              </motion.p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="rounded-full shrink-0"
                  style={{
                    width: 4,
                    height: 4,
                    background: neon.border + "0.65)",
                    boxShadow: `0 0 6px ${neon.glow}0.5)`,
                  }}
                />
                <span
                  className="text-xs truncate"
                  style={{
                    color: "rgba(160,200,220,0.38)",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    letterSpacing: "0.04em",
                    fontSize: "0.78rem",
                  }}
                >
                  {hostname}
                </span>
              </div>

              {/* Like button */}
              <div className="relative shrink-0">
                <AnimatePresence>
                  {burst.map((p) => (
                    <motion.div
                      key={p.id}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                        left: "50%",
                        top: "50%",
                        translateX: "-50%",
                        translateY: "-50%",
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(p.angle) * p.dist,
                        y: Math.sin(p.angle) * p.dist,
                        opacity: 0,
                        scale: 0,
                      }}
                      exit={{}}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>

                <motion.button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 relative z-10"
                  style={{
                    color: link.likesCount > 0
                      ? "rgba(255,160,200,0.95)"
                      : "rgba(197,168,255,0.5)",
                  }}
                  animate={isLiking ? {
                    scale: [1, 1.6, 0.82, 1.25, 1],
                    rotate: [0, -10, 10, -5, 0],
                  } : {}}
                  whileTap={{ scale: 0.78 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  disabled={isLiking}
                  data-testid={`button-like-${link.id}`}
                  aria-label="Thích"
                >
                  <motion.span
                    style={{
                      fontSize: "14px",
                      lineHeight: 1,
                      filter: link.likesCount > 0
                        ? "drop-shadow(0 0 6px rgba(255,140,180,0.8))"
                        : "none",
                    }}
                  >
                    {link.likesCount > 0 ? "♥" : "♡"}
                  </motion.span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 400,
                      fontSize: "0.88rem",
                      tabularNums: "true",
                    } as React.CSSProperties}
                  >
                    {link.likesCount}
                  </span>
                </motion.button>
              </div>
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
