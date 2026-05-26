"use client";

import { ArrowRight, Dice5, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dataset, Movie } from "@/lib/dataset";
import { pickRandomMovie } from "@/lib/dataset";
import { findPath, type PathStep } from "@/lib/graph";
import { MovieSearch, Poster } from "./MovieSearch";

export function DegreesPanel({
  dataset,
  onPath,
}: {
  dataset: Dataset;
  onPath: (steps: PathStep[] | null, from: Movie | null, to: Movie | null) => void;
}) {
  // Pick two well-known films as defaults (highest votes -> recognizable).
  const defaults = useMemo(() => {
    const sorted = [...dataset.movies].sort((a, b) => b.votes - a.votes);
    return { from: sorted[0], to: sorted[5] };
  }, [dataset]);

  const [from, setFrom] = useState<Movie | null>(defaults.from);
  const [to, setTo] = useState<Movie | null>(defaults.to);

  const steps = useMemo<PathStep[] | null>(() => {
    if (!from || !to) return null;
    return findPath(dataset, from.id, to.id);
  }, [dataset, from, to]);

  // bubble result up so the graph can highlight it; use ref to avoid re-firing on identity-only changes
  const lastSentRef = useRef<PathStep[] | null | undefined>(undefined);
  useEffect(() => {
    if (lastSentRef.current === steps) return;
    lastSentRef.current = steps;
    onPath(steps, from, to);
  }, [steps, from, to, onPath]);

  const movieHops = steps ? Math.max(0, Math.floor((steps.length - 1) / 2)) : 0;

  return (
    <aside className="pointer-events-auto h-full w-full overflow-hidden rounded-[28px] glass-strong p-5 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-soft">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Six Degrees</div>
          <div className="text-[11px] text-ink-500">
            shortest cast-chain between two films
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Label text="From" />
        <MovieSearch
          dataset={dataset}
          value={from}
          onChange={setFrom}
          placeholder="Starting film…"
          size="sm"
        />
        <Label text="To" />
        <MovieSearch
          dataset={dataset}
          value={to}
          onChange={setTo}
          placeholder="Target film…"
          size="sm"
        />
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              const a = pickRandomMovie(dataset);
              const b = pickRandomMovie(dataset, a.id);
              setFrom(a);
              setTo(b);
            }}
            className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-soft hover:opacity-90"
          >
            <Dice5 className="h-3.5 w-3.5" /> Random pair
          </button>
          <button
            onClick={() => {
              const a = from;
              setFrom(to);
              setTo(a);
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[12.5px] font-medium text-ink-900 ring-1 ring-black/[0.05] hover:bg-white"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Swap
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto no-scrollbar -mx-1 px-1">
        {!steps && (
          <div className="rounded-2xl bg-white/55 hairline px-4 py-6 text-center text-[13px] text-ink-500">
            No path found — these films don't share a chain in this dataset.
          </div>
        )}
        {steps && (
          <div className="rounded-2xl bg-white/55 hairline p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-500">
                <Trophy className="h-3 w-3" />
                Path
              </div>
              <div className="rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {movieHops} {movieHops === 1 ? "hop" : "hops"}
              </div>
            </div>

            <ol className="relative space-y-1.5 pl-2">
              {steps.map((s, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-semibold text-ink-700 ring-1 ring-black/[0.06]">
                    {i + 1}
                  </div>
                  {s.type === "movie" ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Poster
                        movie={{
                          id: s.id,
                          title: s.title,
                          genres: dataset.moviesById[s.id]?.genres,
                        }}
                        className="h-9 w-6 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-ink-900">
                          {s.title}
                        </div>
                        <div className="text-[11px] text-ink-500">{s.year} · film</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="grid h-9 w-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">
                        {s.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-ink-900">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-ink-500">actor</div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </aside>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div className="px-1 pt-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
      {text}
    </div>
  );
}
