"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast/ToastProvider";

const STORAGE_KEY = "hayattan_followed_authors";

export function AuthorFollowButton({
  authorId,
  authorName,
  className = "",
}: {
  authorId: string;
  authorName: string;
  className?: string;
}) {
  const { addToast } = useToast();
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFollowedAuthors(JSON.parse(raw) as string[]);
    } catch {
      setFollowedAuthors([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(followedAuthors));
  }, [followedAuthors, isReady]);

  if (!isReady) return null;

  const isFollowing = followedAuthors.includes(authorId);

  return (
    <button
      type="button"
      onClick={() => {
        setFollowedAuthors((prev) => {
          if (prev.includes(authorId)) {
            addToast(`${authorName} takip listenizden çıkarıldı.`, "info");
            return prev.filter((id) => id !== authorId);
          }
          addToast(`${authorName} takip listenize eklendi.`, "success");
          return [...prev, authorId];
        });
      }}
      aria-pressed={isFollowing}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
        isFollowing
          ? "bg-primary text-white hover:bg-primary-hover"
          : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
      } ${className}`}
    >
      <span aria-hidden>{isFollowing ? "✓" : "+"}</span>
      {isFollowing ? "Takiptesiniz" : "Yazarı Takip Et"}
    </button>
  );
}
