"use client";

import { useState, useEffect } from "react";

type Catalog = {
  groups: string[];
  albums: Record<string, string[]>; // groupSlug -> album names
  members: Record<string, string[]>; // groupSlug -> member names
};

const STORAGE_KEY = "binder-catalog";

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>({
    groups: [],
    albums: {},
    members: {},
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCatalog(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const saveGroup = (groupSlug: string, groupName: string) => {
    setCatalog((prev) => {
      const updated = {
        ...prev,
        groups: [...new Set([...prev.groups, groupName])],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const saveAlbum = (groupSlug: string, albumName: string) => {
    setCatalog((prev) => {
      const updated = {
        ...prev,
        albums: {
          ...prev.albums,
          [groupSlug]: [...new Set([...(prev.albums[groupSlug] || []), albumName])],
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const saveMember = (groupSlug: string, memberName: string) => {
    setCatalog((prev) => {
      const updated = {
        ...prev,
        members: {
          ...prev.members,
          [groupSlug]: [...new Set([...(prev.members[groupSlug] || []), memberName])],
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    catalog,
    saveGroup,
    saveAlbum,
    saveMember,
  };
}
