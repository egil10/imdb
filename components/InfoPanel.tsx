"use client";

import { Calendar, Film, Users, X } from "lucide-react";
import { ACTORS_NAMES, FILMOGRAPHY, MOVIES_BY_ID, type Movie } from "@/data/movies";
import { Poster } from "./MovieSearch";

export function InfoPanel({
  movie,
  onPickMovie,
  onClose,
}: {
  movie: Movie;
  onPickMovie: (id: string) => void;
  onClose?: () => void;
}) {
  const cast = movie.cast.map((id) => ({ id, name: ACTORS_NAMES[id] || id }));

  return (
    <aside className="pointer-events-auto h-full w-full overflow-hidden rounded-[28px] glass-strong p-5 flex flex-col">
      <header className="flex items-start gap-4">
        <Poster movie={movie} className="h-20 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-ink-500">
            <Calendar className="h-3 w-3" />
            {movie.year}
            <span className="opacity-40">·</span>
            <Users className="h-3 w-3" />
            {movie.cast.length} cast
          </div>
          <h2 className="mt-0.5 text-[20px] font-semibold leading-tight tracking-tight">
            {movie.title}
          </h2>
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
          {cast.map((a) => {
            const others = (FILMOGRAPHY[a.id] || []).filter((i) => i !== movie.id);
            return (
              <div
                key={a.id}
                className="rounded-2xl bg-white/55 hairline px-3 py-2"
              >
                <div className="text-[13.5px] font-medium text-ink-900">{a.name}</div>
                {others.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {others.slice(0, 6).map((mid) => {
                      const m = MOVIES_BY_ID[mid]!;
                      return (
                        <button
                          key={mid}
                          onClick={() => onPickMovie(mid)}
                          className="rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-700 ring-1 ring-black/[0.05] hover:bg-ink-900 hover:text-white transition"
                        >
                          {m.title}
                          <span className="ml-1 text-ink-500 group-hover:text-white/70">
                            {m.year}
                          </span>
                        </button>
                      );
                    })}
                    {others.length > 6 && (
                      <span className="rounded-full bg-white/50 px-2 py-0.5 text-[11px] text-ink-500 ring-1 ring-black/[0.04]">
                        +{others.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between rounded-2xl bg-white/55 hairline px-3 py-2 text-[11.5px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5" /> Click any film to recenter
        </span>
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
