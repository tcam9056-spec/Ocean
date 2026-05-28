import { useState, useCallback } from "react";

const STORAGE_KEY = "ocean_shelves_v2";

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

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadShelves(): Shelf[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: ensure every shelf has a valid artworks array
    return parsed.map((s: Shelf) => ({
      ...s,
      artworks: Array.isArray(s.artworks) ? s.artworks.map((a: Artwork) => ({
        id: a.id ?? uid(),
        title: a.title ?? "",
        description: a.description ?? "",
        link: a.link ?? "",
        likes: typeof a.likes === "number" ? a.likes : 0,
        createdAt: a.createdAt ?? Date.now(),
      })) : [],
    }));
  } catch {
    return [];
  }
}

function persist(shelves: Shelf[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves));
  } catch {
    // Storage quota exceeded — silently fail
  }
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
  const [shelves, setShelves] = useState<Shelf[]>(() => loadShelves());

  const update = useCallback((next: Shelf[]) => {
    setShelves(next);
    persist(next);
  }, []);

  const createShelf = useCallback((name: string): string => {
    const shelf: Shelf = {
      id: `shelf_${uid()}`,
      shelfName: name.trim(),
      artworks: [],
      createdAt: Date.now(),
    };
    setShelves((prev) => {
      const next = [...prev, shelf];
      persist(next);
      return next;
    });
    return shelf.id;
  }, []);

  const renameShelf = useCallback((id: string, name: string) => {
    setShelves((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, shelfName: name.trim() } : s);
      persist(next);
      return next;
    });
  }, []);

  const deleteShelf = useCallback((id: string) => {
    setShelves((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const addArtwork = useCallback((shelfId: string, data: { title: string; description: string; link: string }) => {
    const artwork: Artwork = {
      id: `art_${uid()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      link: data.link.trim(),
      likes: 0,
      createdAt: Date.now(),
    };
    setShelves((prev) => {
      const next = prev.map((s) =>
        s.id === shelfId ? { ...s, artworks: [...s.artworks, artwork] } : s
      );
      persist(next);
      return next;
    });
  }, []);

  const updateArtwork = useCallback((shelfId: string, artId: string, data: { title: string; description: string; link: string }) => {
    setShelves((prev) => {
      const next = prev.map((s) =>
        s.id === shelfId
          ? {
              ...s,
              artworks: s.artworks.map((a) =>
                a.id === artId
                  ? { ...a, title: data.title.trim(), description: data.description.trim(), link: data.link.trim() }
                  : a
              ),
            }
          : s
      );
      persist(next);
      return next;
    });
  }, []);

  const deleteArtwork = useCallback((shelfId: string, artId: string) => {
    setShelves((prev) => {
      const next = prev.map((s) =>
        s.id === shelfId
          ? { ...s, artworks: s.artworks.filter((a) => a.id !== artId) }
          : s
      );
      persist(next);
      return next;
    });
  }, []);

  const likeArtwork = useCallback((shelfId: string, artId: string) => {
    setShelves((prev) => {
      const next = prev.map((s) =>
        s.id === shelfId
          ? { ...s, artworks: s.artworks.map((a) => a.id === artId ? { ...a, likes: a.likes + 1 } : a) }
          : s
      );
      persist(next);
      return next;
    });
  }, []);

  // Sync state if localStorage changes in another tab
  const refresh = useCallback(() => {
    const fresh = loadShelves();
    setShelves(fresh);
  }, []);

  return {
    shelves,
    update,
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
