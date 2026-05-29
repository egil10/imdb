"use client";

import { ExternalLink, Film, Star, UserRound, Users } from "lucide-react";
import { useMemo } from "react";
import type { Dataset } from "@/lib/dataset";
import { imdbNameUrl, imdbTitleUrl } from "@/lib/dataset";
import { Poster } from "./MovieSearch";

// The actor-centric counterpart to InfoPanel: who they are, every film they're
// known for, and the people they've shared the most screens with.
export function ActorPanel({
  dataset,
  actorId,
  onPickMovie,
  onPickActor,
}: {
  dataset: Dataset;
  actorId: string;
  onPickMovie: (id: string) => void;
  onPickActor?: (id: string) => void;
}) {
  const name = dataset.actorNamesById[actorId] || actorId;
  const films = dataset.filmography[actorId] || []; // already sorted by votes desc

  // Derive a quick profile + top collaborators in one pass over the films.
  const { years, topGenres, coStars } = useMemo(() => {
    let minYear = Infinity;
    let maxYear = -Infinity;
    const genreCount = new Map<string, number>();
    const coCount = new Map<string, number>();
    for (const mid of films) {
      const m = dataset.moviesById[mid];
      if (!m) continue;
      if (m.year) {
        if (m.year < minYear) minYear = m.year;
        if (m.year > maxYear) maxYear = m.year;
      }
      const g = m.genres ? m.genres.split(",")[0] : "";
      if (g) genreCount.set(g, (genreCount.get(g) || 0) + 1);
      for (const other of m.cast) {
        if (other !== actorId) coCount.set(other, (coCount.get(other) || 0) + 1);
      }
    }
    const topGenres = [...genreCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);
    const coStars = [...coCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, shared]) => ({ id, shared }));
    return {
      years:
        minYear <= maxYear && Number.isFinite(minYear)
          ? { from: minYear, to: maxYear }
          : null,
      topGenres,
      coStars,
    };
  }, [films, dataset, actorId]);

  return (
    <aside className="pointer-events-auto h-full w-full flex flex-col">
      <header className="flex items-start gap-4">
        <div className="grid h-20 w-14 shrink-0 place-items-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-[16px] font-bold text-white ring-1 ring-black/[0.04]">
          {name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
            <span className="flex items-center gap-1">
              <Film className="h-3 w-3" /> {films.length} films
            </span>
            {years && (
              <>
                <span className="opacity-40">·</span>
                <span>
                  {years.from}–{years.to}
                </span>
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-start gap-1.5">
            <h2 className="flex items-center gap-1.5 text-[20px] font-semibold leading-tight tracking-tight">
              <UserRound className="h-4 w-4 text-amber-500" />
              {name}
            </h2>
            <a
              href={imdbNameUrl(actorId)}
              target="_blank"
              rel="noreferrer"
              title={`${name} on IMDb`}
              className="mt-1 inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-bold text-ink-900 ring-1 ring-black/[0.06] transition hover:bg-amber-400"
            >
              IMDb <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          {topGenres.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {topGenres.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] text-ink-700 ring-1 ring-black/[0.05]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-4 -mx-1 flex-1 overflow-auto no-scrollbar px-1">
        {coStars.length > 0 && (
          <>
            <SectionTitle
              icon={<Users className="h-3.5 w-3.5" />}
              text="Frequent collaborators"
            />
            <div className="mt-1.5 mb-4 flex flex-wrap gap-1">
              {coStars.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onPickActor?.(c.id)}
                  disabled={!onPickActor}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-700 ring-1 ring-black/[0.05] transition hover:bg-amber-500 hover:text-white disabled:hover:bg-white disabled:hover:text-ink-700"
                  title={`${c.shared} films together`}
                >
                  {dataset.actorNamesById[c.id] || c.id}
                  <span className="text-ink-500/70">{c.shared}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <SectionTitle icon={<Film className="h-3.5 w-3.5" />} text="Filmography" />
        <div className="mt-1.5 grid gap-1">
          {films.map((mid) => {
            const m = dataset.moviesById[mid];
            if (!m) return null;
            return (
              <div
                key={mid}
                className="group flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/[0.04] transition hover:bg-ink-900"
              >
                <button
                  onClick={() => onPickMovie(mid)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <Poster movie={m} className="h-9 w-6 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold leading-tight group-hover:text-white">
                      {m.title}
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px] text-ink-500 group-hover:text-white/70">
                      <span>{m.year}</span>
                      <span className="opacity-40">·</span>
                      <Star className="h-2.5 w-2.5 fill-amber-400 stroke-amber-500" />
                      {m.rating.toFixed(1)}
                    </div>
                  </div>
                </button>
                <a
                  href={imdbTitleUrl(mid)}
                  target="_blank"
                  rel="noreferrer"
                  title={`${m.title} on IMDb`}
                  className="shrink-0 text-ink-500/60 transition hover:text-amber-500 group-hover:text-white/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-3 flex items-center gap-1.5 rounded-2xl bg-white/55 hairline px-3 py-2 text-[11.5px] text-ink-500">
        <Film className="h-3.5 w-3.5" /> Every film radiates from {name.split(" ")[0]} on the map
      </footer>
    </aside>
  );
}

function SectionTitle({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
      {icon}
      <span>{text}</span>
    </div>
  );
}
