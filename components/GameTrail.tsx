"use client";

import { ArrowRight, Flag } from "lucide-react";
import type { Dataset } from "@/lib/dataset";
import { Poster } from "./MovieSearch";

type TrailItem =
  | { kind: "movie"; id: string }
  | { kind: "actor"; id: string };

// The actor → film → actor breadcrumb, floated over the canvas during a game.
// Click any step to rewind the trail back to it.
export function GameTrail({
  dataset,
  trail,
  onJump,
}: {
  dataset: Dataset;
  trail: TrailItem[];
  onJump: (index: number) => void;
}) {
  return (
    <div className="glass pill flex max-w-[min(92vw,720px)] items-center gap-1 overflow-x-auto no-scrollbar px-2.5 py-1.5 animate-fade-in">
      <Flag className="h-3.5 w-3.5 shrink-0 text-violet-500" />
      {trail.map((t, i) => {
        const isLast = i === trail.length - 1;
        return (
          <div key={i} className="flex shrink-0 items-center gap-1">
            {t.kind === "actor" ? (
              <button
                onClick={() => onJump(i)}
                className={[
                  "rounded-full px-2 py-0.5 text-[11px] font-medium transition",
                  isLast
                    ? "bg-amber-500 text-white shadow-soft"
                    : "bg-amber-100 text-amber-900 ring-1 ring-amber-300/60 hover:bg-amber-50",
                ].join(" ")}
                title={dataset.actorNamesById[t.id] || t.id}
              >
                {dataset.actorNamesById[t.id] || t.id}
              </button>
            ) : (
              <button
                onClick={() => onJump(i)}
                className={[
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition",
                  isLast
                    ? "bg-ink-900 text-white shadow-soft"
                    : "bg-white text-ink-900 ring-1 ring-black/[0.05] hover:bg-white/90",
                ].join(" ")}
                title={dataset.moviesById[t.id]?.title}
              >
                <Poster
                  movie={dataset.moviesById[t.id] ?? { title: "?", id: t.id }}
                  className="h-3.5 w-2.5 shrink-0"
                />
                <span className="max-w-[140px] truncate font-medium">
                  {dataset.moviesById[t.id]?.title || t.id}
                </span>
              </button>
            )}
            {!isLast && <ArrowRight className="h-3 w-3 text-ink-500/60" />}
          </div>
        );
      })}
    </div>
  );
}
