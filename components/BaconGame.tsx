"use client";

import {
  ArrowRight,
  ChevronDown,
  Dice5,
  Film,
  Flag,
  Lightbulb,
  Sparkles,
  Trophy,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import type { Dataset } from "@/lib/dataset";
import { hopsOf, type ActorChallenge, type PathStep } from "@/lib/graph";
import { Poster } from "./MovieSearch";

const COLLAPSED_FILMS_PER_ACTOR = 8;

type TrailItem =
  | { kind: "movie"; id: string }
  | { kind: "actor"; id: string };

// Controlled component: all game state lives in the page so the trail can also
// be rendered floating on the canvas. This panel just renders the current
// challenge + picker and reports moves back up.
export function BaconGame({
  dataset,
  challenge,
  trail,
  revealed,
  onTrail,
  onNew,
  onToggleReveal,
}: {
  dataset: Dataset;
  challenge: ActorChallenge;
  trail: TrailItem[];
  revealed: boolean;
  onTrail: (updater: (t: TrailItem[]) => TrailItem[]) => void;
  onNew: () => void;
  onToggleReveal: () => void;
}) {
  const last = trail[trail.length - 1];
  const reachedTarget =
    !!last && last.kind === "actor" && last.id === challenge.to.id;
  const userHops = trail.filter((t) => t.kind === "movie").length;
  const optimalHops = hopsOf(challenge.optimal);

  const undo = () => onTrail((t) => (t.length <= 1 ? t : t.slice(0, -1)));
  const pickFilm = (mid: string) =>
    onTrail((t) => [...t, { kind: "movie", id: mid }]);
  const pickActor = (aid: string) =>
    onTrail((t) => [...t, { kind: "actor", id: aid }]);

  const visitedMovieIds = new Set(
    trail.filter((t) => t.kind === "movie").map((t) => t.id),
  );
  const visitedActorIds = new Set(
    trail.filter((t) => t.kind === "actor").map((t) => t.id),
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <ChallengeCard
        from={challenge.from.id}
        to={challenge.to.id}
        userHops={userHops}
        optimalHops={optimalHops}
        reachedTarget={reachedTarget}
        dataset={dataset}
      />

      {/* Picker */}
      <div className="flex-1 min-h-0 overflow-auto no-scrollbar rounded-2xl bg-white/55 hairline p-3">
        {reachedTarget ? (
          <WinPanel userHops={userHops} optimalHops={optimalHops} onAgain={onNew} />
        ) : last.kind === "actor" ? (
          <FilmographyPicker
            actorName={dataset.actorNamesById[last.id] || last.id}
            films={(dataset.filmography[last.id] || []).filter(
              (mid) => !visitedMovieIds.has(mid),
            )}
            dataset={dataset}
            onPick={pickFilm}
          />
        ) : (
          <CastPicker
            movieId={last.id}
            dataset={dataset}
            targetActorId={challenge.to.id}
            visitedActorIds={visitedActorIds}
            onPick={pickActor}
          />
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[12px] font-medium text-white shadow-soft hover:opacity-90"
        >
          <Dice5 className="h-3.5 w-3.5" /> New
        </button>
        <button
          onClick={undo}
          disabled={trail.length <= 1}
          className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-medium text-ink-900 ring-1 ring-black/[0.05] hover:bg-white disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button
          onClick={onToggleReveal}
          className={[
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 transition",
            revealed
              ? "bg-amber-100 text-amber-800 ring-amber-300"
              : "bg-white/70 text-ink-900 ring-black/[0.05] hover:bg-white",
          ].join(" ")}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {revealed ? "Hide answer" : "Show optimal"}
        </button>
      </div>

      {revealed && <OptimalPath path={challenge.optimal} dataset={dataset} />}
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
  from: string;
  to: string;
  userHops: number;
  optimalHops: number;
  reachedTarget: boolean;
  dataset: Dataset;
}) {
  return (
    <div className="rounded-2xl glass-strong p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-500">
        <Sparkles className="h-3 w-3 text-violet-500" />
        Link the actors
      </div>

      <div className="mt-2 flex items-stretch gap-2">
        <ActorMini actorId={from} dataset={dataset} tone="from" tag="FROM" />
        <div className="grid place-items-center text-ink-500">
          <ArrowRight className="h-4 w-4" />
        </div>
        <ActorMini actorId={to} dataset={dataset} tone="to" tag="TO" />
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
            🎬 linked!
          </div>
        )}
      </div>
    </div>
  );
}

function ActorMini({
  actorId,
  dataset,
  tone,
  tag,
}: {
  actorId: string;
  dataset: Dataset;
  tone: "from" | "to";
  tag: string;
}) {
  const name = dataset.actorNamesById[actorId] || actorId;
  const films = (dataset.filmography[actorId] || []).length;
  return (
    <div className="flex flex-1 min-w-0 items-center gap-2 rounded-xl bg-white/70 hairline px-2 py-1.5">
      <div className="grid h-9 w-6 shrink-0 place-items-center rounded-sm bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">
        {name
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")}
      </div>
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
          {name}
        </div>
        <div className="text-[10px] text-ink-500">{films} films</div>
      </div>
    </div>
  );
}

function FilmographyPicker({
  actorName,
  films,
  dataset,
  onPick,
}: {
  actorName: string;
  films: string[];
  dataset: Dataset;
  onPick: (movieId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cap = expanded ? films.length : COLLAPSED_FILMS_PER_ACTOR;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.12em] text-ink-500">
        <Film className="h-3 w-3" />
        Pick a film with <span className="text-ink-900">{actorName}</span>
      </div>
      <div className="mt-2 grid gap-1">
        {films.slice(0, cap).map((mid) => {
          const m = dataset.moviesById[mid]!;
          return (
            <button
              key={mid}
              onClick={() => onPick(mid)}
              className="group flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-black/[0.04] transition hover:bg-ink-900 hover:text-white"
            >
              <Poster movie={m} className="h-9 w-6 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold leading-tight">
                  {m.title}
                </div>
                <div className="text-[10.5px] text-ink-500 group-hover:text-white/70">
                  {m.year} · ⭐ {m.rating.toFixed(1)}
                </div>
              </div>
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
            Dead end — every film of theirs is already in your trail. Try Undo.
          </div>
        )}
      </div>
    </div>
  );
}

function CastPicker({
  movieId,
  dataset,
  targetActorId,
  visitedActorIds,
  onPick,
}: {
  movieId: string;
  dataset: Dataset;
  targetActorId: string;
  visitedActorIds: Set<string>;
  onPick: (actorId: string) => void;
}) {
  const movie = dataset.moviesById[movieId]!;
  const cast = movie.cast.filter((aid) => !visitedActorIds.has(aid));
  const hasTarget = cast.includes(targetActorId);

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.12em] text-ink-500">
        <Sparkles className="h-3 w-3" />
        Pick a co-star from <span className="text-ink-900">{movie.title}</span>
        {hasTarget && (
          <span className="ml-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
            target here!
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-1">
        {cast.map((aid) => {
          const isTarget = aid === targetActorId;
          const films = dataset.filmography[aid] || [];
          return (
            <button
              key={aid}
              onClick={() => onPick(aid)}
              className={[
                "group flex items-center justify-between rounded-xl px-3 py-2 text-left ring-1 transition",
                isTarget
                  ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-900 ring-emerald-300/60 hover:from-emerald-200 hover:to-emerald-100"
                  : "bg-white ring-black/[0.04] hover:bg-ink-900 hover:text-white",
              ].join(" ")}
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
              {isTarget ? (
                <Trophy className="h-3.5 w-3.5 text-emerald-700" />
              ) : (
                <div className="text-[10px] text-ink-500 group-hover:text-white/70">
                  {films.length} films
                </div>
              )}
            </button>
          );
        })}
        {cast.length === 0 && (
          <div className="rounded-xl bg-white/70 px-3 py-2 text-[12px] text-ink-500">
            Dead end — every co-star here is already in your trail. Try Undo.
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
          {perfect ? "Perfect link!" : "Connected!"}
        </div>
        <div className="text-[12.5px] text-ink-500">
          {userHops} films · optimal is {optimalHops}
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

function OptimalPath({ path, dataset }: { path: PathStep[]; dataset: Dataset }) {
  return (
    <div className="rounded-2xl bg-amber-50/80 hairline p-3 ring-1 ring-amber-200/60">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-amber-700">
        <Lightbulb className="h-3 w-3" />
        Optimal link
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
