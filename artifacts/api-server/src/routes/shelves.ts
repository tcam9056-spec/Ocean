import { Router } from "express";
import { eq, asc, sql } from "drizzle-orm";
import { db, shelvesTable, artworksTable } from "@workspace/db";

const router = Router();

/* ─── GET /shelves ─────────────────────────────────────────────── */
router.get("/shelves", async (req, res): Promise<void> => {
  const shelves = await db
    .select()
    .from(shelvesTable)
    .orderBy(asc(shelvesTable.createdAt));

  const artworks = await db
    .select()
    .from(artworksTable)
    .orderBy(asc(artworksTable.createdAt));

  const artworksByShelf = new Map<number, typeof artworks>();
  for (const a of artworks) {
    if (!artworksByShelf.has(a.shelfId)) artworksByShelf.set(a.shelfId, []);
    artworksByShelf.get(a.shelfId)!.push(a);
  }

  res.json(
    shelves.map((s) => ({
      id: String(s.id),
      shelfName: s.shelfName,
      createdAt: s.createdAt.getTime(),
      artworks: (artworksByShelf.get(s.id) ?? []).map((a) => ({
        id: String(a.id),
        title: a.title,
        description: a.description,
        link: a.link,
        likes: a.likesCount,
        createdAt: a.createdAt.getTime(),
      })),
    }))
  );
});

/* ─── POST /shelves ────────────────────────────────────────────── */
router.post("/shelves", async (req, res): Promise<void> => {
  const { name } = req.body as { name?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [shelf] = await db
    .insert(shelvesTable)
    .values({ shelfName: name.trim() })
    .returning();

  res.json({
    id: String(shelf.id),
    shelfName: shelf.shelfName,
    createdAt: shelf.createdAt.getTime(),
    artworks: [],
  });
});

/* ─── PATCH /shelves/:shelfId ──────────────────────────────────── */
router.patch("/shelves/:shelfId", async (req, res): Promise<void> => {
  const shelfId = Number(req.params.shelfId);
  const { name } = req.body as { name?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  await db
    .update(shelvesTable)
    .set({ shelfName: name.trim() })
    .where(eq(shelvesTable.id, shelfId));

  res.json({ success: true });
});

/* ─── DELETE /shelves/:shelfId ─────────────────────────────────── */
router.delete("/shelves/:shelfId", async (req, res): Promise<void> => {
  const shelfId = Number(req.params.shelfId);
  await db.delete(shelvesTable).where(eq(shelvesTable.id, shelfId));
  res.json({ success: true });
});

/* ─── POST /shelves/:shelfId/artworks ──────────────────────────── */
router.post("/shelves/:shelfId/artworks", async (req, res): Promise<void> => {
  const shelfId = Number(req.params.shelfId);
  const { title, description, link } = req.body as {
    title?: string;
    description?: string;
    link?: string;
  };

  if (!title?.trim() || !link?.trim()) {
    res.status(400).json({ error: "title and link are required" });
    return;
  }

  const [artwork] = await db
    .insert(artworksTable)
    .values({
      shelfId,
      title: title.trim(),
      description: (description ?? "").trim(),
      link: link.trim(),
      likesCount: 0,
    })
    .returning();

  res.json({
    id: String(artwork.id),
    title: artwork.title,
    description: artwork.description,
    link: artwork.link,
    likes: artwork.likesCount,
    createdAt: artwork.createdAt.getTime(),
  });
});

/* ─── PATCH /shelves/:shelfId/artworks/:artId ──────────────────── */
router.patch(
  "/shelves/:shelfId/artworks/:artId",
  async (req, res): Promise<void> => {
    const artId = Number(req.params.artId);
    const { title, description, link } = req.body as {
      title?: string;
      description?: string;
      link?: string;
    };

    if (!title?.trim() || !link?.trim()) {
      res.status(400).json({ error: "title and link are required" });
      return;
    }

    await db
      .update(artworksTable)
      .set({
        title: title.trim(),
        description: (description ?? "").trim(),
        link: link.trim(),
      })
      .where(eq(artworksTable.id, artId));

    res.json({ success: true });
  }
);

/* ─── DELETE /shelves/:shelfId/artworks/:artId ─────────────────── */
router.delete(
  "/shelves/:shelfId/artworks/:artId",
  async (req, res): Promise<void> => {
    const artId = Number(req.params.artId);
    await db.delete(artworksTable).where(eq(artworksTable.id, artId));
    res.json({ success: true });
  }
);

/* ─── POST /shelves/:shelfId/artworks/:artId/like ──────────────── */
router.post(
  "/shelves/:shelfId/artworks/:artId/like",
  async (req, res): Promise<void> => {
    const artId = Number(req.params.artId);

    const [updated] = await db
      .update(artworksTable)
      .set({ likesCount: sql`${artworksTable.likesCount} + 1` })
      .where(eq(artworksTable.id, artId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Artwork not found" });
      return;
    }

    res.json({ likes: updated.likesCount });
  }
);

export default router;
