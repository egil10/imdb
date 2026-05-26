"use client";

import {
  ArrowRight,
  ChevronDown,
  Dice5,
  Flag,
  Lightbulb,
  Sparkles,
  Trophy,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dataset, Movie } from "@/lib/dataset";
import { pickRandomMovie } from "@/lib/dataset";
import { findPath, type PathStep } from "@/lib/graph";
import { Poster } from "./MovieSearch";

const COLLAPSED_FILMS_PER_ACTOR = 8;

type TrailItem =
  | { kind: "movie"; id: string }
  | { kind: "actor"; id: string };

type SolvableChallenge = {
  from: Movie;
  to: Movie;
  optimal: PathStep[];
};

function pickSolvableChallenge(d: Dataset, minHops = 2, maxHops = 4): SolvableChallenge {
  // Try random pairs until we find one connected with at least minHops hops.
  for (let i = 0; i < 60; i++) {
    const a = pickRandomMovie(d);
    const b = pickRandomMovie(d, a.id);
    const path = findPath(d, a.id, b.id);
    if (!path) continue;
    const hops = Math.max(0, Math.floor((path.length - 1) / 2));
    if (hops >= minHops && hops <= maxHops) return { from: a, to: b, optimal: path };
  }
  // Fallback: any connected pair
  for (let i = 0; i < 100; i++) {
    const a = pickRandomMovie(d);
    const b = pickRandomMovie(d, a.id);
    const path = findPath(d, a.id, b.id);
    if (path) return { from: a, to: b, optimal: path };
  }
  // Hard fallback: same movie
  const a = pickRandomMovie(d);
  return { from: a, to: a, optimal: [{ type: "movie", id: a.id, title: a.title, year: a.year }] };
}

export function BaconGame({
  dataset,
  onTrailChange,
}: {
  dataset: Dataset;
  onTrailChange: (
    challenge: SolvableChallenge | null,
    trail: TrailItem[],
    revealOptimal: boolean,
  ) => void;
}) {
  const [challenge, setChallenge] = useState<SolvableChallenge | null>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [revealed, setRevealed] = useState(false);

  // bootstrap a starting challenge once
  useEffect(() => {
    if (challenge) return;
    const c = pickSolvableChallenge(dataset);
    setChallenge(c);
    setTrail([{ kind: "movie", id: c.from.id }]);
    setRevealed(false);
  }, [dataset, challenge]);

  // bubble state up so the graph can highlight the trail / target
  const lastSentRef = useRef<{
    challenge: SolvableChallenge | null;
    trail: TrailItem[];
    revealed: boolean;
  }>({ challenge: null, trail: [], revealed: false });
  useEffect(() => {
    const last = lastSentRef.current;
    if (
      last.challenge === challenge &&
      last.trail === trail &&
      last.revealed === revealed
    )
      return;
    lastSentRef.current = { challenge, trail, revealed };
    onTrailChange(challenge, trail, revealed);
  }, [challenge, trail, revealed, onTrailChange]);

  if (!challenge) return null;

  const last = trail[trail.length - 1];
  const reachedTarget =
    last && last.kind === "movie" && last.id === challenge.to.id;
  const userHops = Math.max(0, Math.floor((trail.length - 1) / 2));
  const optimalHops = Math.max(0, Math.floor((challenge.optimal.length - 1) / 2));

  const newChallenge = () => {
    const c = pickSolvableChallenge(dataset);
    setChallenge(c);
    setTrail([{ kind: "movie", id: c.from.id }]);
    setRevealed(false);
  };

  const undo = () => {
    if (trail.length <= 1) return;
    setTrail((t) => t.slice(0, -1));
  };

  const pickActor = (aid: string) => {
    setTrail((t) => [...t, { kind: "actor", id: aid }]);
  };
  const pickMovie = (mid: string) => {
    setTrail((t) => [...t, { kind: "movie", id: mid }]);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      {/* Challenge header */}
      <ChallengeCard
        from={challenge.from}
        to={challenge.to}
        userHops={userHops}
        optimalHops={optimalHops}
        reachedTarget={!!reachedTarget}
        dataset={dataset}
      />

      {/* Trail */}
      <Trail
        trail={trail}
        dataset={dataset}
        onJump={(idx) => setTrail((t) => t.slice(0, idx + 1))}
      />

      {/* Picker */}
      <div className="flex-1 min-h-0 overflow-auto no-scrollbar rounded-2xl bg-white/55 hairline p-3">
        {reachedTarget ? (
          <WinPanel
            userHops={userHops}
            optimalHops={optimalHops}
            onAgain={newChallenge}
          />
        ) : last.kind === "movie" ? (
          <CastPicker
            movie={dataset.moviesById[last.id]!}
            dataset={dataset}
            onPick={pickActor}
          />
        ) : (
          <FilmographyPicker
            actorId={last.id}
            actorName={dataset.actorNamesById[last.id] || last.id}
            dataset={dataset}
            targetId={challenge.to.id}
            visitedMovieIds={new Set(
              trail.filter((t) => t.kind === "movie").map((t) => t.id),
            )}
            onPick={pickMovie}
          />
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={newChallenge}
          className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-soft hover:opacity-90"
        >
          <Dice5 className="h-3.5 w-3.5" /> New
        </button>
        <button
          onClick={undo}
          disabled={trail.length <= 1}
          className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[12.5px] font-medium text-ink-900 ring-1 ring-black/[0.05] hover:bg-white disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button
          onClick={() => setRevealed((r) => !r)}
          className={[
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium ring-1 transition",
            revealed
              ? "bg-amber-100 text-amber-800 ring-amber-300"
              : "bg-white/70 text-ink-900 ring-black/[0.05] hover:bg-white",
          ].join(" ")}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {revealed ? "Hide answer" : "Show optimal"}
        </button>
      </div>

      {revealed && (
        <OptimalPath
          path={challenge.optimal}
          dataset={dataset}
        />
      )}
    </div>
  );
}

function ChallengeCard({
  from,
  to,
  userHops,
  optimalHops,
  reachedTarget,
  dataset,
}: {
  from: Movie;
  to: Movie;
  userHops: number;
  optimalHops: number;
  reachedTarget: boolean;
  dataset: Dataset;
}) {
  return (
    <div className="rounded-2xl glass-strong p-3">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
        <Sparkles className="h-3 w-3 text-violet-500" />
        Challenge
      </div>

      <div className="mt-2 flex items-stretch gap-2">
        <MovieMini
          movie={from}
          dataset={dataset}
          tone="from"
          tag="FROM"
        />
        <div className="grid place-items-center text-ink-500">
          <ArrowRight className="h-4 w-4" />
        </div>
        <MovieMini
          movie={to}
          dataset={dataset}
          tone="to"
          tag="TO"
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
          <Flag className="h-3 w-3" />
          you: <span className="font-semibold text-ink-900 tabular-nums">{userHops}</span>
          <span className="opacity-40">·</span>
          optimal: <span className="font-semibold text-ink-900 tabular-nums">{optimalHops}</span>
        </div>
        {reachedTarget && (
          <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
            🎬 reached!
          </div>
        )}
      </div>
    </div>
  );
}

function MovieMini({
  movie,
  dataset: _ds,
  tone,
  tag,
}: {
  movie: Movie;
  dataset: Dataset;
  tone: "from" | "to";
  tag: string;
}) {
  return (
    <div className="flex flex-1 min-w-0 items-center gap-2 rounded-xl bg-white/70 hairline px-2 py-1.5">
      <Poster movie={movie} className="h-9 w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <div
          className={[
            "text-[9px] font-semibold uppercase tracking-[0.12em]",
            tone === "from" ? "text-violet-700" : "text-emerald-700",
          ].join(" ")}
        >
          {tag}
        </div>
        <div className="truncate text-[12.5px] font-semibold leading-tight text-ink-900">
          {movie.title}
        </div>
        <div className="text-[10px] text-ink-500">{movie.year}</div>
      </div>
    </div>
  );
}

function Trail({
  trail,
  dataset,
  onJump,
}: {
  trail: TrailItem[];
  dataset: Dataset;
  onJump: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-2xl bg-white/45 hairline px-2 py-1.5">
      {trail.map((t, i) => {
        const isLast = i === trail.length - 1;
        return (
          <div key={i} className="flex items-center gap-1 shrink-0">
            {t.kind === "movie" ? (
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
                  movie={
                    dataset.moviesById[t.id] ?? { title: "?", id: t.id }
                  }
                  className="h-3.5 w-2.5 shrink-0"
                />
                <span className="max-w-[120px] truncate font-medium">
                  {dataset.moviesById[t.id]?.title || t.id}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onJump(i)}
                className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 ring-1 ring-amber-300/60 hover:bg-amber-50"
              >
                {dataset.actorNamesById[t.id] || t.id}
              </button>
            )}
            {i < trail.length - 1 && (
              <ArrowRight className="h-3 w-3 text-ink-500/60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CastPicker({
  movie,
  dataset,
  onPick,
}: {
  movie: Movie;
  dataset: Dataset;
  onPick: (actorId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
        <Sparkles className="h-3 w-3" />
        Pick an actor from <span className="text-ink-900">{movie.title}</span>
      </div>
      <div className="mt-2 grid gap-1">
        {movie.cast.map((aid) => {
          const films = dataset.filmography[aid] || [];
          return (
            <button
              key={aid}
              onClick={() => onPick(aid)}
              className="group flex items-center justify-between rounded-xl bg-white px-3 py-2 text-left ring-1 ring-black/[0.04] transition hover:bg-ink-900 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-5 place-items-center rounded-sm bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white">
                  {(dataset.actorNamesById[aid] || aid)
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="text-[13px] font-medium">
                  {dataset.actorNamesById[aid] || aid}
                </div>
              </div>
              <div className="text-[10.5px] text-ink-500 group-hover:text-white/70">
                {films.length} films
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilmographyPicker({
  actorId,
  actorName,
  dataset,
  targetId,
  visitedMovieIds,
  onPick,
}: {
  actorId: string;
  actorName: string;
  dataset: Dataset;
  targetId: string;
  visitedMovieIds: Set<string>;
  onPick: (movieId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const films = (dataset.filmography[actorId] || []).filter(
    (mid) => !visitedMovieIds.has(mid),
  );
  const hasTarget = films.includes(targetId);
  const cap = expanded ? films.length : COLLAPSED_FILMS_PER_ACTOR;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
        <Sparkles className="h-3 w-3" />
        Pick a film with <span className="text-ink-900">{actorName}</span>
        {hasTarget && (
          <span className="ml-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
            target available!
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-1">
        {films.slice(0, cap).map((mid) => {
          const m = dataset.moviesById[mid]!;
          const isTarget = mid === targetId;
          return (
            <button
              key={mid}
              onClick={() => onPick(mid)}
              className={[
                "group flex items-center gap-2 rounded-xl px-3 py-2 text-left ring-1 transition",
                isTarget
                  ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-900 ring-emerald-300/60 hover:from-emerald-200 hover:to-emerald-100"
                  : "bg-white ring-black/[0.04] hover:bg-ink-900 hover:text-white",
              ].join(" ")}
            >
              <Poster movie={m} className="h-9 w-6 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold leading-tight">
                  {m.title}
                </div>
                <div
                  className={[
                    "text-[10.5px]",
                    isTarget
                      ? "text-emerald-700"
                      : "text-ink-500 group-hover:text-white/70",
                  ].join(" ")}
                >
                  {m.year} · ⭐ {m.rating.toFixed(1)}
                </div>
              </div>
              {isTarget && (
                <Trophy className="h-3.5 w-3.5 text-emerald-700" />
              )}
            </button>
          );
        })}
        {films.length > COLLAPSED_FILMS_PER_ACTOR && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11.5px] font-medium text-violet-700 ring-1 ring-violet-300/40 hover:bg-white"
          >
            Show all {films.length} <ChevronDown className="h-3 w-3" />
          </button>
        )}
        {expanded && films.length > COLLAPSED_FILMS_PER_ACTOR && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center justify-center rounded-full bg-white/70 px-3 py-1 text-[11.5px] text-ink-500 ring-1 ring-black/[0.05] hover:bg-white"
          >
            Show fewer
          </button>
        )}
        {films.length === 0 && (
          <div className="rounded-xl bg-white/70 px-3 py-2 text-[12px] text-ink-500">
            Dead end — every film this actor's known for is already in your
            trail. Try Undo.
          </div>
        )}
      </div>
    </div>
  );
}

function WinPanel({
  userHops,
  optimalHops,
  onAgain,
}: {
  userHops: number;
  optimalHops: number;
  onAgain: () => void;
}) {
  const perfect = userHops === optimalHops;
  return (
    <div className="grid place-items-center gap-3 py-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-soft">
        <Trophy className="h-6 w-6" />
      </div>
      <div>
        <div className="text-[16px] font-semibold tracking-tight">
          {perfect ? "Perfect run!" : "You made it!"}
        </div>
        <div className="text-[12.5px] text-ink-500">
          {userHops} hops · optimal is {optimalHops}
          {perfect ? " 🎯" : ""}
        </div>
      </div>
      <button
        onClick={onAgain}
        className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-[13px] font-medium text-white shadow-soft hover:opacity-90"
      >
        <Dice5 className="h-3.5 w-3.5" /> New challenge
      </button>
    </div>
  );
}

function OptimalPath({
  path,
  dataset,
}: {
  path: PathStep[];
  dataset: Dataset;
}) {
  return (
    <div className="rounded-2xl bg-amber-50/80 hairline p-3 ring-1 ring-amber-200/60">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-amber-700">
        <Lightbulb className="h-3 w-3" />
        Optimal path
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {path.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            {s.type === "movie" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink-900 ring-1 ring-black/[0.05]">
                <Poster
                  movie={dataset.moviesById[s.id] ?? { title: s.title, id: s.id }}
                  className="h-3.5 w-2.5"
                />
                {s.title}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 ring-1 ring-amber-300/60">
                {s.name}
              </span>
            )}
            {i < path.length - 1 && (
              <ArrowRight className="h-3 w-3 text-amber-700/70" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
