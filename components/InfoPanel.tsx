"use client";

import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Film,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Dataset, Movie } from "@/lib/dataset";
import { imdbNameUrl, imdbTitleUrl } from "@/lib/dataset";
import { Poster } from "./MovieSearch";

const COLLAPSED_FILMS_PER_ACTOR = 8;

export function InfoPanel({
  dataset,
  movie,
  onPickMovie,
  onPickActor,
  onClose,
}: {
  dataset: Dataset;
  movie: Movie;
  onPickMovie: (id: string) => void;
  onPickActor?: (id: string) => void;
  onClose?: () => void;
}) {
  const cast = movie.cast.map((id) => ({
    id,
    name: dataset.actorNamesById[id] || id,
  }));

  return (
    <aside className="pointer-events-auto h-full w-full flex flex-col">
      <header className="flex items-start gap-4">
        <Poster movie={movie} className="h-20 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {movie.year}
            </span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 stroke-amber-500" />
              {movie.rating.toFixed(1)}
              <span className="text-ink-500/70">({formatVotes(movie.votes)})</span>
            </span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {movie.cast.length}
            </span>
          </div>
          <div className="mt-0.5 flex items-start gap-1.5">
            <h2 className="text-[20px] font-semibold leading-tight tracking-tight">
              {movie.title}
            </h2>
            <a
              href={imdbTitleUrl(movie.id)}
              target="_blank"
              rel="noreferrer"
              title="View on IMDb"
              className="mt-1 inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-bold text-ink-900 ring-1 ring-black/[0.06] transition hover:bg-amber-400"
            >
              IMDb <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          {movie.genres && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {movie.genres
                .split(",")
                .filter(Boolean)
                .slice(0, 3)
                .map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] text-ink-700 ring-1 ring-black/[0.05]"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {g}
                  </span>
                ))}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/60 ring-1 ring-black/[0.04] text-ink-500 hover:bg-white"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      <div className="mt-4 -mx-1 flex-1 overflow-auto no-scrollbar px-1">
        <SectionTitle icon={<Users className="h-3.5 w-3.5" />} text="Cast" />
        <div className="mt-1.5 grid gap-1">
          {cast.map((a) => (
            <CastRow
              key={a.id}
              actorId={a.id}
              actorName={a.name}
              totalFilms={(dataset.filmography[a.id] || []).length}
              films={(dataset.filmography[a.id] || []).filter((i) => i !== movie.id)}
              dataset={dataset}
              onPickMovie={onPickMovie}
              onPickActor={onPickActor}
            />
          ))}
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between rounded-2xl bg-white/55 hairline px-3 py-2 text-[11.5px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5" /> Click a film to recenter, an actor for their career
        </span>
      </footer>
    </aside>
  );
}

function CastRow({
  actorId,
  actorName,
  totalFilms,
  films,
  dataset,
  onPickMovie,
  onPickActor,
}: {
  actorId: string;
  actorName: string;
  totalFilms: number;
  films: string[];
  dataset: Dataset;
  onPickMovie: (id: string) => void;
  onPickActor?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cap = expanded ? films.length : COLLAPSED_FILMS_PER_ACTOR;
  const shown = films.slice(0, cap);
  const hidden = films.length - shown.length;

  return (
    <div className="rounded-2xl bg-white/55 hairline px-3 py-2">
      <div className="flex items-baseline gap-1.5">
        <button
          onClick={() => onPickActor?.(actorId)}
          disabled={!onPickActor}
          className="text-left text-[13.5px] font-medium text-ink-900 hover:text-violet-700 disabled:hover:text-ink-900 transition"
          title={onPickActor ? `See all ${totalFilms} films with ${actorName}` : undefined}
        >
          {actorName}
        </button>
        <a
          href={imdbNameUrl(actorId)}
          target="_blank"
          rel="noreferrer"
          title={`${actorName} on IMDb`}
          className="text-ink-500/60 transition hover:text-amber-600"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
        <div className="ml-auto text-[10.5px] text-ink-500">
          {films.length} other {films.length === 1 ? "film" : "films"}
        </div>
      </div>
      {films.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {shown.map((mid) => {
            const m = dataset.moviesById[mid]!;
            return (
              <button
                key={mid}
                onClick={() => onPickMovie(mid)}
                className="rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-700 ring-1 ring-black/[0.05] hover:bg-ink-900 hover:text-white transition"
              >
                {m.title}
                <span className="ml-1 text-ink-500">{m.year}</span>
              </button>
            );
          })}
          {hidden > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-violet-700 ring-1 ring-violet-300/40 hover:bg-white"
            >
              +{hidden} more <ChevronDown className="h-3 w-3" />
            </button>
          )}
          {expanded && films.length > COLLAPSED_FILMS_PER_ACTOR && (
            <button
              onClick={() => setExpanded(false)}
              className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] text-ink-500 ring-1 ring-black/[0.04] hover:bg-white"
            >
              show fewer
            </button>
          )}
        </div>
      )}
    </div>
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

function formatVotes(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return Math.round(v / 1_000) + "k";
  return String(v);
}
