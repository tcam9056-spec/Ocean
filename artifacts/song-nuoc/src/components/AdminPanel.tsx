import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Shelf, Artwork } from "@/hooks/useShelvesStore";

/* ─── Types ───────────────────────────────────────────────────── */
interface AdminPanelProps {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  shelves: Shelf[];
  onCreateShelf: (name: string) => Promise<string>;
  onRenameShelf: (id: string, name: string) => void;
  onDeleteShelf: (id: string) => void;
  onAddArtwork: (shelfId: string, data: { title: string; description: string; link: string }) => void;
  onUpdateArtwork: (shelfId: string, artId: string, data: { title: string; description: string; link: string }) => void;
  onDeleteArtwork: (shelfId: string, artId: string) => void;
}

const ADMIN_EMAIL = "tcam9056@gmail.com";
const ADMIN_PASSWORD = "1234";

/* ─── Shared input styles ─────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: "100%",
  background: "rgba(8,18,42,0.6)",
  border: "1px solid rgba(197,168,255,0.15)",
  borderRadius: "10px",
  padding: "9px 14px",
  color: "rgba(240,244,255,0.9)",
  fontSize: "0.86rem",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 300,
  outline: "none",
  letterSpacing: "0.02em",
  boxSizing: "border-box",
};

function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={inp} {...props} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={{ ...inp, resize: "none", height: 68, padding: "9px 14px" }}
      {...props}
    />
  );
}

function Btn({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "danger" | "ghost" }) {
  const base: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: 300,
    fontSize: "0.86rem",
    letterSpacing: "0.08em",
    borderRadius: "10px",
    padding: "9px 18px",
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.5 : 1,
    border: "none",
    transition: "all 0.2s",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "linear-gradient(135deg, rgba(78,205,196,0.18), rgba(197,168,255,0.18))", border: "1px solid rgba(78,205,196,0.28)", color: "rgba(240,244,255,0.92)" },
    danger: { ...base, background: "rgba(160,30,60,0.12)", border: "1px solid rgba(255,80,110,0.2)", color: "rgba(255,130,150,0.85)" },
    ghost: { ...base, background: "rgba(197,168,255,0.07)", border: "1px solid rgba(197,168,255,0.14)", color: "rgba(197,168,255,0.7)" },
  };
  return <button style={styles[variant]} {...props}>{children}</button>;
}

function IconBtn({ children, title, onClick, danger }: { children: React.ReactNode; title?: string; onClick: (e: React.MouseEvent) => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: danger ? "rgba(160,30,60,0.1)" : "rgba(197,168,255,0.07)",
        border: danger ? "1px solid rgba(255,80,110,0.18)" : "1px solid rgba(197,168,255,0.14)",
        color: danger ? "rgba(255,130,150,0.8)" : "rgba(197,168,255,0.65)",
        fontSize: "12px",
        cursor: "pointer",
        flexShrink: 0,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "rgba(160,30,60,0.28)" : "rgba(197,168,255,0.16)";
        e.currentTarget.style.borderColor = danger ? "rgba(255,80,110,0.45)" : "rgba(197,168,255,0.38)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = danger ? "rgba(160,30,60,0.1)" : "rgba(197,168,255,0.07)";
        e.currentTarget.style.borderColor = danger ? "rgba(255,80,110,0.18)" : "rgba(197,168,255,0.14)";
      }}
    >
      {children}
    </button>
  );
}

/* ─── Login modal ─────────────────────────────────────────────── */
function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 100); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim() !== ADMIN_EMAIL) { setError("Email không hợp lệ"); return; }
    if (password !== ADMIN_PASSWORD) { setError("Mật khẩu không đúng"); return; }
    localStorage.setItem("ocean_admin_email", email.trim());
    onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      style={{ background: "rgba(2,8,20,0.85)", backdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 24, opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: "100%", maxWidth: 320,
          background: "rgba(8,18,42,0.97)",
          backdropFilter: "blur(32px)",
          borderRadius: "28px",
          border: "1px solid rgba(197,168,255,0.22)",
          boxShadow: "0 32px 72px rgba(0,10,40,0.75), inset 0 1px 0 rgba(240,244,255,0.07)",
          padding: "32px 28px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none",
            color: "rgba(197,168,255,0.45)", fontSize: "14px",
            cursor: "pointer", padding: "6px", touchAction: "manipulation",
          }}
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.div
            style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "rgba(197,168,255,0.08)",
              border: "1px solid rgba(197,168,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
            }}
            animate={{ boxShadow: ["0 0 0 rgba(197,168,255,0)", "0 0 22px rgba(197,168,255,0.25)", "0 0 0 rgba(197,168,255,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🗝
          </motion.div>
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 300, fontSize: "1.4rem",
          color: "rgba(240,244,255,0.85)",
          letterSpacing: "0.08em", fontStyle: "italic",
          textAlign: "center", marginBottom: 4,
        }}>
          Phòng Chủ Kệ
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic", fontSize: "0.7rem",
          letterSpacing: "0.18em", color: "rgba(197,168,255,0.3)",
          textAlign: "center", marginBottom: 24,
        }}>
          chỉ dành cho chủ nhân
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="email..."
            autoComplete="email"
            required
          />
          <Field
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="mật khẩu..."
            autoComplete="current-password"
            required
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic", fontSize: "0.82rem",
                  color: "rgba(255,110,140,0.85)",
                  textAlign: "center", margin: 0,
                }}
              >
                ✕ {error}
              </motion.p>
            )}
          </AnimatePresence>
          <Btn type="submit" variant="primary" style={{ marginTop: 4, width: "100%" }}>
            bước vào
          </Btn>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Artwork form ────────────────────────────────────────────── */
interface ArtworkFormProps {
  shelfId: string;
  initial?: Artwork;
  onSave: (data: { title: string; description: string; link: string }) => void;
  onCancel: () => void;
}

function ArtworkForm({ initial, onSave, onCancel }: ArtworkFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [link, setLink] = useState(initial?.link ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    onSave({ title, description: desc, link });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.28 }}
      onSubmit={handleSubmit}
      style={{
        background: "rgba(6,12,32,0.85)",
        border: "1px solid rgba(78,205,196,0.18)",
        borderRadius: "16px",
        padding: "16px",
        display: "flex", flexDirection: "column", gap: 8,
        margin: "8px 0",
      }}
    >
      <Field
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="tên tác phẩm..."
        required
        autoFocus
      />
      <TextArea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="mô tả nhẹ nhàng..."
      />
      <Field
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://..."
        required
      />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Btn type="submit" variant="primary" style={{ flex: 1 }}>
          {initial ? "lưu thay đổi" : "đăng ✦"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          huỷ
        </Btn>
      </div>
    </motion.form>
  );
}

/* ─── Artwork item ────────────────────────────────────────────── */
interface ArtworkItemProps {
  artwork: Artwork;
  shelfId: string;
  onUpdate: (data: { title: string; description: string; link: string }) => void;
  onDelete: () => void;
}

function ArtworkItem({ artwork, onUpdate, onDelete }: ArtworkItemProps) {
  const [editing, setEditing] = useState(false);

  let hostname = "";
  try { hostname = new URL(artwork.link).hostname; } catch { hostname = artwork.link; }

  if (editing) {
    return (
      <ArtworkForm
        shelfId=""
        initial={artwork}
        onSave={(data) => { onUpdate(data); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400, fontSize: "0.9rem",
          color: "rgba(240,244,255,0.85)",
          marginBottom: 2, wordBreak: "break-word",
        }}>
          {artwork.title}
        </p>
        {artwork.description && (
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontWeight: 300,
            fontSize: "0.78rem", color: "rgba(197,168,255,0.45)",
            marginBottom: 2, wordBreak: "break-word",
          }}>
            {artwork.description}
          </p>
        )}
        <a
          href={artwork.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.7rem",
            color: "rgba(78,205,196,0.5)",
            fontFamily: "monospace",
            letterSpacing: "0.01em",
            wordBreak: "break-all",
            display: "block",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {hostname}
        </a>
        <span style={{ fontSize: "0.68rem", color: "rgba(197,168,255,0.3)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          ♥ {artwork.likes}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0, paddingTop: 2 }}>
        <IconBtn onClick={(e) => { e.preventDefault(); setEditing(true); }} title="Sửa">✎</IconBtn>
        <IconBtn
          onClick={(e) => {
            e.preventDefault();
            if (confirm(`Xoá tác phẩm "${artwork.title}"?`)) onDelete();
          }}
          title="Xoá"
          danger
        >
          🗑
        </IconBtn>
      </div>
    </div>
  );
}

/* ─── Shelf detail view ───────────────────────────────────────── */
interface ShelfDetailProps {
  shelf: Shelf;
  onBack: () => void;
  onRename: (name: string) => void;
  onAdd: (data: { title: string; description: string; link: string }) => void;
  onUpdate: (artId: string, data: { title: string; description: string; link: string }) => void;
  onDelete: (artId: string) => void;
}

function ShelfDetail({ shelf, onBack, onRename, onAdd, onUpdate, onDelete }: ShelfDetailProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(shelf.shelfName);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameVal.trim()) return;
    onRename(nameVal);
    setEditingName(false);
    toast.success("Đã đổi tên kệ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none",
            color: "rgba(197,168,255,0.55)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.8rem", letterSpacing: "0.1em",
            cursor: "pointer", padding: "0 0 8px",
            display: "flex", alignItems: "center", gap: 6,
            touchAction: "manipulation",
          }}
        >
          ← kệ trưng bày
        </button>

        {editingName ? (
          <form onSubmit={handleRename} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              autoFocus
              style={{ ...inp, flex: 1, fontSize: "1rem" }}
              onKeyDown={(e) => { if (e.key === "Escape") setEditingName(false); }}
            />
            <button
              type="submit"
              style={{ background: "none", border: "none", color: "rgba(78,205,196,0.8)", cursor: "pointer", fontSize: "16px", touchAction: "manipulation" }}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              style={{ background: "none", border: "none", color: "rgba(197,168,255,0.45)", cursor: "pointer", fontSize: "13px", touchAction: "manipulation" }}
            >
              ✕
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300, fontStyle: "italic",
              fontSize: "1.15rem", color: "rgba(240,244,255,0.82)",
              letterSpacing: "0.06em", flex: 1,
              margin: 0,
            }}>
              {shelf.shelfName}
            </h3>
            <IconBtn onClick={() => { setNameVal(shelf.shelfName); setEditingName(true); }} title="Đổi tên">✎</IconBtn>
          </div>
        )}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic", fontSize: "0.72rem",
          color: "rgba(197,168,255,0.3)",
          margin: "4px 0 0",
        }}>
          {shelf.artworks.length} tác phẩm
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
        {/* Add form */}
        <AnimatePresence>
          {addingNew && (
            <ArtworkForm
              shelfId={shelf.id}
              onSave={(data) => { onAdd(data); setAddingNew(false); toast.success("Tác phẩm đã lên kệ ✦"); }}
              onCancel={() => setAddingNew(false)}
            />
          )}
        </AnimatePresence>

        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            style={{
              width: "100%",
              background: "rgba(78,205,196,0.06)",
              border: "1px dashed rgba(78,205,196,0.22)",
              borderRadius: "10px",
              padding: "10px",
              color: "rgba(78,205,196,0.6)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300, fontSize: "0.86rem",
              letterSpacing: "0.08em",
              cursor: "pointer",
              marginBottom: 12,
              touchAction: "manipulation",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,205,196,0.12)"; e.currentTarget.style.borderColor = "rgba(78,205,196,0.38)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,205,196,0.06)"; e.currentTarget.style.borderColor = "rgba(78,205,196,0.22)"; }}
          >
            + thêm tác phẩm
          </button>
        )}

        {shelf.artworks.length === 0 && !addingNew && (
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontWeight: 300,
            fontSize: "0.88rem", color: "rgba(197,168,255,0.28)",
            textAlign: "center", padding: "20px 0",
          }}>
            kệ trống, thêm tác phẩm đầu tiên nhé
          </p>
        )}

        <div>
          {shelf.artworks.map((art) => (
            <ArtworkItem
              key={art.id}
              artwork={art}
              shelfId={shelf.id}
              onUpdate={(data) => { onUpdate(art.id, data); toast.success("Đã cập nhật tác phẩm"); }}
              onDelete={() => { onDelete(art.id); toast.success("Tác phẩm đã tan vào biển cả"); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Shelf list view ─────────────────────────────────────────── */
interface ShelfListProps {
  shelves: Shelf[];
  onSelectShelf: (id: string) => void;
  onCreateShelf: (name: string) => Promise<string>;
  onDeleteShelf: (id: string) => void;
  onRenameShelf: (id: string, name: string) => void;
}

function ShelfList({ shelves, onSelectShelf, onCreateShelf, onDeleteShelf, onRenameShelf }: ShelfListProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newId = await onCreateShelf(newName);
    setNewName("");
    setCreating(false);
    toast.success("Kệ mới đã tạo — thêm tác phẩm ngay nhé ✦");
    onSelectShelf(newId);
  };

  const handleRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!renameVal.trim()) return;
    onRenameShelf(id, renameVal);
    setRenamingId(null);
    toast.success("Đã đổi tên kệ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: "18px" }}>🗝</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontStyle: "italic",
            fontSize: "1.25rem", color: "rgba(240,244,255,0.85)",
            letterSpacing: "0.08em", margin: 0,
          }}>
            Phòng Chủ Kệ
          </h2>
        </div>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic", fontSize: "0.7rem",
          color: "rgba(197,168,255,0.3)",
          letterSpacing: "0.12em", margin: 0,
        }}>
          {shelves.length} kệ · {shelves.reduce((n, s) => n + s.artworks.length, 0)} tác phẩm
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
        {/* Create form */}
        <AnimatePresence>
          {creating && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleCreate}
              style={{ display: "flex", gap: 8, marginBottom: 12, overflow: "hidden" }}
            >
              <Field
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="tên kệ mới..."
                autoFocus
                required
                style={{ flex: 1 }}
              />
              <button type="submit" style={{
                background: "rgba(78,205,196,0.14)", border: "1px solid rgba(78,205,196,0.28)",
                borderRadius: 10, padding: "0 14px",
                color: "rgba(78,205,196,0.9)", cursor: "pointer", flexShrink: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "0.84rem", touchAction: "manipulation",
              }}>✓</button>
              <button type="button" onClick={() => setCreating(false)} style={{
                background: "rgba(197,168,255,0.07)", border: "1px solid rgba(197,168,255,0.14)",
                borderRadius: 10, padding: "0 14px",
                color: "rgba(197,168,255,0.6)", cursor: "pointer", flexShrink: 0,
                touchAction: "manipulation",
              }}>✕</button>
            </motion.form>
          )}
        </AnimatePresence>

        {!creating && (
          <button
            onClick={() => setCreating(true)}
            style={{
              width: "100%",
              background: "rgba(197,168,255,0.06)",
              border: "1px dashed rgba(197,168,255,0.2)",
              borderRadius: "10px",
              padding: "10px",
              color: "rgba(197,168,255,0.55)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300, fontSize: "0.86rem",
              letterSpacing: "0.08em",
              cursor: "pointer",
              marginBottom: 14,
              touchAction: "manipulation",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(197,168,255,0.12)"; e.currentTarget.style.borderColor = "rgba(197,168,255,0.36)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(197,168,255,0.06)"; e.currentTarget.style.borderColor = "rgba(197,168,255,0.2)"; }}
          >
            + tạo kệ mới
          </button>
        )}

        {shelves.length === 0 && (
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontSize: "0.88rem",
            color: "rgba(197,168,255,0.25)", textAlign: "center",
            padding: "24px 0",
          }}>
            chưa có kệ nào, tạo kệ đầu tiên nhé
          </p>
        )}

        {/* Shelf list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {shelves.map((shelf, i) => (
            <motion.div
              key={shelf.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {renamingId === shelf.id ? (
                <form
                  onSubmit={(e) => handleRename(e, shelf.id)}
                  style={{ display: "flex", gap: 8, padding: "10px 12px" }}
                >
                  <Field
                    type="text"
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    autoFocus
                    style={{ flex: 1, fontSize: "0.88rem" }}
                    onBlur={() => setRenamingId(null)}
                  />
                  <button type="submit" style={{
                    background: "none", border: "none",
                    color: "rgba(78,205,196,0.8)", cursor: "pointer", fontSize: "16px", touchAction: "manipulation",
                  }}>✓</button>
                </form>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
                  <button
                    onClick={() => onSelectShelf(shelf.id)}
                    style={{
                      flex: 1, background: "none", border: "none",
                      textAlign: "left", cursor: "pointer",
                      touchAction: "manipulation",
                      minWidth: 0,
                    }}
                  >
                    <div style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 300, fontSize: "0.92rem",
                      color: "rgba(240,244,255,0.8)",
                      letterSpacing: "0.03em",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {shelf.shelfName}
                    </div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: "italic", fontSize: "0.7rem",
                      color: "rgba(197,168,255,0.35)",
                      marginTop: 1,
                    }}>
                      {shelf.artworks.length} tác phẩm →
                    </div>
                  </button>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <IconBtn
                      onClick={() => { setRenameVal(shelf.shelfName); setRenamingId(shelf.id); }}
                      title="Đổi tên"
                    >✎</IconBtn>
                    <IconBtn
                      onClick={() => {
                        if (confirm(`Xoá kệ "${shelf.shelfName}" và toàn bộ tác phẩm?`)) {
                          onDeleteShelf(shelf.id);
                          toast.success("Kệ đã được xoá");
                        }
                      }}
                      title="Xoá kệ"
                      danger
                    >🗑</IconBtn>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Admin panel (main export) ───────────────────────────────── */
export function AdminPanel({
  isAdmin, setIsAdmin,
  shelves,
  onCreateShelf, onRenameShelf, onDeleteShelf,
  onAddArtwork, onUpdateArtwork, onDeleteArtwork,
}: AdminPanelProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);

  const activeShelf = shelves.find((s) => s.id === activeShelfId) ?? null;

  const handleLogout = () => {
    setIsAdmin(false);
    setShowPanel(false);
    setActiveShelfId(null);
    localStorage.removeItem("ocean_admin_email");
    toast.success("Đã đăng xuất");
  };

  return (
    <>
      {/* Key icon trigger — fixed bottom-left */}
      {!isAdmin && (
        <motion.button
          className="fixed bottom-5 left-5 z-50 rounded-full flex items-center justify-center"
          style={{
            width: 40, height: 40,
            background: "rgba(8,18,42,0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(197,168,255,0.12)",
            color: "rgba(197,168,255,0.35)",
            fontSize: "15px",
            boxShadow: "0 2px 12px rgba(0,10,40,0.35)",
            touchAction: "manipulation",
          }}
          whileHover={{ scale: 1.12, borderColor: "rgba(197,168,255,0.45)", color: "rgba(197,168,255,0.9)", boxShadow: "0 0 18px rgba(197,168,255,0.25)" }}
          whileTap={{ scale: 0.9 }}
          animate={{ opacity: [0.38, 0.62, 0.38] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => setShowLogin(true)}
          aria-label="Đăng nhập quản trị"
          data-testid="button-admin-trigger"
        >
          🗝
        </motion.button>
      )}

      {/* Admin open button — fixed bottom-left when logged in */}
      {isAdmin && !showPanel && (
        <motion.button
          className="fixed bottom-5 left-5 z-50 rounded-full flex items-center gap-2 px-4"
          style={{
            height: 40,
            background: "rgba(78,205,196,0.12)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(78,205,196,0.28)",
            color: "rgba(78,205,196,0.85)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.08em",
            boxShadow: "0 0 16px rgba(78,205,196,0.12)",
            touchAction: "manipulation",
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 22px rgba(78,205,196,0.22)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPanel(true)}
          aria-label="Mở phòng chủ kệ"
        >
          <span style={{ fontSize: "14px" }}>🗝</span>
          <span>chủ kệ</span>
        </motion.button>
      )}

      {/* Login modal */}
      <AnimatePresence>
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSuccess={() => {
              setIsAdmin(true);
              setShowLogin(false);
              toast.success("Chào mừng trở lại ✦");
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin room panel — slides in from right */}
      <AnimatePresence>
        {isAdmin && showPanel && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[55]"
              style={{ background: "rgba(2,8,20,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowPanel(false)}
            />

            {/* Side panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed right-0 top-0 bottom-0 z-[56] flex flex-col"
              style={{
                width: "min(440px, 100vw)",
                background: "rgba(6,13,35,0.97)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                borderLeft: "1px solid rgba(197,168,255,0.14)",
                boxShadow: "-8px 0 48px rgba(0,0,0,0.5)",
                overflowY: "hidden",
              }}
            >
              {/* Panel top bar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}>
                <div />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "rgba(197,168,255,0.07)",
                      border: "1px solid rgba(197,168,255,0.14)",
                      borderRadius: 8, padding: "6px 14px",
                      color: "rgba(197,168,255,0.55)",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 300, fontSize: "0.78rem",
                      letterSpacing: "0.06em",
                      cursor: "pointer", touchAction: "manipulation",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,110,140,0.12)"; e.currentTarget.style.borderColor = "rgba(255,110,140,0.28)"; e.currentTarget.style.color = "rgba(255,140,165,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(197,168,255,0.07)"; e.currentTarget.style.borderColor = "rgba(197,168,255,0.14)"; e.currentTarget.style.color = "rgba(197,168,255,0.55)"; }}
                  >
                    đăng xuất
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "6px 12px",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer", fontSize: "13px",
                      touchAction: "manipulation", transition: "all 0.2s",
                    }}
                    aria-label="Đóng"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Panel content */}
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <AnimatePresence mode="wait">
                  {activeShelf ? (
                    <motion.div
                      key={`detail-${activeShelf.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      style={{ height: "100%" }}
                    >
                      <ShelfDetail
                        shelf={activeShelf}
                        onBack={() => setActiveShelfId(null)}
                        onRename={(name) => onRenameShelf(activeShelf.id, name)}
                        onAdd={(data) => onAddArtwork(activeShelf.id, data)}
                        onUpdate={(artId, data) => onUpdateArtwork(activeShelf.id, artId, data)}
                        onDelete={(artId) => onDeleteArtwork(activeShelf.id, artId)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      style={{ height: "100%" }}
                    >
                      <ShelfList
                        shelves={shelves}
                        onSelectShelf={setActiveShelfId}
                        onCreateShelf={onCreateShelf}
                        onDeleteShelf={onDeleteShelf}
                        onRenameShelf={onRenameShelf}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
