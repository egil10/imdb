"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOVIES, type Movie } from "@/data/movies";

export function MovieSearch({
  value,
  onChange,
  placeholder = "Search films…",
  size = "lg",
  autoFocus = false,
}: {
  value: Movie | null;
  onChange: (m: Movie) => void;
  placeholder?: string;
  size?: "lg" | "sm";
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return MOVIES.slice(0, 12);
    return MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(t) ||
        String(m.year).startsWith(t),
    ).slice(0, 24);
  }, [q]);

  const px = size === "lg" ? "px-5 py-3.5" : "px-3.5 py-2.5";
  const fs = size === "lg" ? "text-[15px]" : "text-[13px]";

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={[
          "glass pill flex items-center gap-2",
          px,
          "ring-1 ring-black/[0.03]",
        ].join(" ")}
      >
        <Search className="h-4 w-4 shrink-0 text-ink-500" strokeWidth={2.4} />
        <input
          autoFocus={autoFocus}
          value={open ? q : value?.title ?? q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={[
            "w-full bg-transparent outline-none placeholder:text-ink-500",
            fs,
          ].join(" ")}
        />
        {value && (
          <button
            onClick={() => {
              setQ("");
              setOpen(true);
            }}
            className="grid h-6 w-6 place-items-center rounded-full bg-white/60 text-ink-500 hover:bg-white"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[60vh] overflow-auto no-scrollbar rounded-3xl glass-strong p-1.5 animate-slide-up">
          {results.length === 0 && (
            <div className="px-4 py-3 text-[13px] text-ink-500">No matches.</div>
          )}
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onChange(m);
                setOpen(false);
                setQ("");
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white/70 transition"
            >
              <Poster movie={m} className="h-10 w-7 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-ink-900">
                  {m.title}
                </div>
                <div className="text-[11.5px] text-ink-500">
                  {m.year} · {m.cast.length} cast
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Poster({
  movie,
  className = "h-12 w-9",
}: {
  movie: { hue?: number; title: string };
  className?: string;
}) {
  const h = movie.hue ?? Math.floor((movie.title.charCodeAt(0) * 37) % 360);
  const initials = movie.title
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <div
      className={[
        "poster overflow-hidden rounded-md ring-1 ring-black/[0.04] grid place-items-center text-white/90 font-semibold tracking-wide",
        className,
      ].join(" ")}
      style={{ ["--h" as any]: h } as React.CSSProperties}
    >
      <span className="text-[10px] drop-shadow">{initials || "·"}</span>
    </div>
  );
}
