import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export interface Artwork {
  id: string;
  title: string;
  description: string;
  link: string;
  likes: number;
  createdAt: number;
}

export interface Shelf {
  id: string;
  shelfName: string;
  artworks: Artwork[];
  createdAt: number;
}

const SHELVES_KEY = ["shelves"] as const;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? body?.detail ?? "";
    } catch {
      /* ignore parse error */
    }
    throw new Error(`API error ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return res.json();
}

export function computeStats(shelves: Shelf[]) {
  let totalArtworks = 0;
  let totalLikes = 0;
  for (const s of shelves) {
    totalArtworks += s.artworks.length;
    for (const a of s.artworks) {
      totalLikes += a.likes;
    }
  }
  return { totalArtworks, totalLikes, totalShelves: shelves.length };
}

export function useShelvesStore() {
  const queryClient = useQueryClient();

  const { data: shelves = [] } = useQuery<Shelf[]>({
    queryKey: SHELVES_KEY,
    queryFn: () => apiFetch("/api/shelves"),
    staleTime: 60_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SHELVES_KEY });
  }, [queryClient]);

  const createShelf = useCallback(async (name: string): Promise<string> => {
    const shelf: Shelf = await apiFetch("/api/shelves", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await queryClient.invalidateQueries({ queryKey: SHELVES_KEY });
    return shelf.id;
  }, [queryClient]);

  const renameShelf = useCallback((id: string, name: string) => {
    apiFetch(`/api/shelves/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    })
      .then(invalidate)
      .catch((err: unknown) => console.error("[renameShelf]", err));
  }, [invalidate]);

  const deleteShelf = useCallback((id: string) => {
    apiFetch(`/api/shelves/${id}`, { method: "DELETE" })
      .then(invalidate)
      .catch((err: unknown) => console.error("[deleteShelf]", err));
  }, [invalidate]);

  const addArtwork = useCallback(
    (shelfId: string, data: { title: string; description: string; link: string }) => {
      apiFetch(`/api/shelves/${shelfId}/artworks`, {
        method: "POST",
        body: JSON.stringify(data),
      })
        .then(invalidate)
        .catch((err: unknown) => console.error("[addArtwork]", err));
    },
    [invalidate]
  );

  const updateArtwork = useCallback(
    (shelfId: string, artId: string, data: { title: string; description: string; link: string }) => {
      apiFetch(`/api/shelves/${shelfId}/artworks/${artId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
        .then(invalidate)
        .catch((err: unknown) => console.error("[updateArtwork]", err));
    },
    [invalidate]
  );

  const deleteArtwork = useCallback((shelfId: string, artId: string) => {
    apiFetch(`/api/shelves/${shelfId}/artworks/${artId}`, {
      method: "DELETE",
    })
      .then(invalidate)
      .catch((err: unknown) => console.error("[deleteArtwork]", err));
  }, [invalidate]);

  const likeArtwork = useCallback((shelfId: string, artId: string) => {
    // Optimistic update — no full refetch, UI responds instantly
    queryClient.setQueryData<Shelf[]>(SHELVES_KEY, (old) => {
      if (!old) return old;
      return old.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          artworks: shelf.artworks.map((art) =>
            art.id === artId ? { ...art, likes: art.likes + 1 } : art
          ),
        };
      });
    });
    // Sync to server; reconcile on error
    apiFetch(`/api/shelves/${shelfId}/artworks/${artId}/like`, { method: "POST" })
      .catch((err: unknown) => {
        console.error("[likeArtwork]", err);
        invalidate(); // rollback by re-fetching truth
      });
  }, [queryClient, invalidate]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SHELVES_KEY });
  }, [queryClient]);

  return {
    shelves,
    createShelf,
    renameShelf,
    deleteShelf,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    likeArtwork,
    refresh,
  };
}
