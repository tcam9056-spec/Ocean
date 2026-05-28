import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, showcaseLinksTable } from "@workspace/db";

import {
  ListLinksResponse,
  CreateLinkBody,
  DeleteLinkParams,
  LikeLinkParams,
  LikeLinkResponse,
  GetLinksStatsResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/links", async (req, res): Promise<void> => {
  const links = await db
    .select()
    .from(showcaseLinksTable)
    .orderBy(sql`${showcaseLinksTable.createdAt} DESC`);

  res.json(
    ListLinksResponse.parse(
      links.map((l) => ({
        ...l,
        likesCount: l.likesCount ?? 0,
        createdAt: l.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/links", async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.message,
    });

    return;
  }

  const [link] = await db
    .insert(showcaseLinksTable)
    .values({
      title: parsed.data.title,
      url: parsed.data.url,
      description: parsed.data.description ?? "",
      likesCount: 0,
    })
    .returning();

  res.json({
    ...link,
    likesCount: link.likesCount ?? 0,
    createdAt: link.createdAt.toISOString(),
  });
});

router.delete("/links/:id", async (req, res): Promise<void> => {
  const parsed = DeleteLinkParams.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.message,
    });

    return;
  }

  await db
    .delete(showcaseLinksTable)
    .where(eq(showcaseLinksTable.id, parsed.data.id));

  res.json({
    success: true,
  });
});

router.post("/links/:id/like", async (req, res): Promise<void> => {
  const parsed = LikeLinkParams.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.message,
    });

    return;
  }

  const [updated] = await db
    .update(showcaseLinksTable)
    .set({
      likesCount: sql`${showcaseLinksTable.likesCount} + 1`,
    })
    .where(eq(showcaseLinksTable.id, parsed.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({
      error: "Link not found",
    });

    return;
  }

  res.json(
    LikeLinkResponse.parse({
      likesCount: updated.likesCount ?? 0,
    })
  );
});

router.get("/links/stats", async (_req, res): Promise<void> => {
  const links = await db.select().from(showcaseLinksTable);

  const totalLinks = links.length;

  const totalLikes = links.reduce(
    (acc, link) => acc + (link.likesCount ?? 0),
    0
  );

  res.json(
    GetLinksStatsResponse.parse({
      totalLinks,
      totalLikes,
    })
  );
});

export default router;