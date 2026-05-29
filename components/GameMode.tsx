"use client";

import {
  ArrowDownAZ,
  ArrowRight,
  Dice5,
  Film,
  Flame,
  Lightbulb,
  Sparkles,
  Star,
  Target,
  Trophy,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Dataset } from "@/lib/dataset";
import { imdbNameUrl } from "@/lib/dataset";
import { gameOptions, hopsOf, type ActorChallenge, type Focus } from "@/lib/graph";
import { Poster } from "./MovieSearch";
import { GameTrail } from "./GameTrail";

type SortMode = "popular" | "az";

export type Difficulty = "easy" | "medium" | "hard";

type TrailItem =
  | { kind: "movie"; id: string }
  | { kind: "actor"; id: string };

// Game mode UI as floating overlays (not a cramped sidebar): the goal + trail
// up top, a wide picker footer at the bottom, and a celebratory win modal.
export function GameMode({
  dataset,
  challenge,
  trail,
  hintOn,
  difficulty,
  filmsRemaining,
  bestOptionKey,
  onPick,
  onUndo,
  onNew,
  onJump,
  onToggleHint,
  onDifficulty,
}: {
  dataset: Dataset;
  challenge: ActorChallenge;
  trail: TrailItem[];
  hintOn: boolean;
  difficulty: Difficulty;
  filmsRemaining: number | null;
  bestOptionKey?: string;
  onPick: (opt: Focus) => void;
  onUndo: () => void;
  onNew: () => void;
  onJump: (index: number) => void;
  onToggleHint: () => void;
  onDifficulty: (d: Difficulty) => void;
}) {
  const [sort, setSort] = useState<SortMode>("popular");
  const tip = trail[trail.length - 1] as Focus;
  const visited = new Set(trail.map((t) => `${t.kind}:${t.id}`));
  const reached = tip.kind === "actor" && tip.id === challenge.to.id;
  const userFilms = trail.filter((t) => t.kind === "movie").length;
  const par = hopsOf(challenge.optimal);

  // Sort the options usefully, then pin the target (if it's right here) to the
  // front so it's never missed. JS sort is stable, so the pin preserves order.
  const options = useMemo(() => {
    const label = (o: Focus) =>
      o.kind === "movie"
        ? dataset.moviesById[o.id]?.title ?? ""
        : dataset.actorNamesById[o.id] ?? "";
    const weight = (o: Focus) =>
      o.kind === "movie"
        ? dataset.moviesById[o.id]?.votes ?? 0
        : (dataset.filmography[o.id] || []).length;
    const arr = gameOptions(dataset, tip, visited);
    arr.sort((a, b) =>
      sort === "az" ? label(a).localeCompare(label(b)) : weight(b) - weight(a),
    );
    arr.sort(
      (a, b) =>
        Number(b.kind === "actor" && b.id === challenge.to.id) -
        Number(a.kind === "actor" && a.id === challenge.to.id),
    );
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, tip.kind, tip.id, trail.length, sort, challenge.to.id]);

  return (
    <>
      {/* ── Goal + trail, top center (offset clear of the dock on desktop) ── */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-30 flex flex-col items-center gap-2 px-4 lg:pl-[372px]">
        <div className="glass-strong pointer-events-auto flex items-center gap-2.5 rounded-2xl px-3 py-2">
          <Endpoint
            id={challenge.from.id}
            name={dataset.actorNamesById[challenge.from.id] || challenge.from.id}
            tag="FROM"
            tone="from"
          />
          <div className="flex flex-col items-center px-1 text-ink-500">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
              {userFilms} {userFilms === 1 ? "film" : "films"}
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-[9px] text-ink-500/80">par {par}</span>
          </div>
          <Endpoint
            id={challenge.to.id}
            name={dataset.actorNamesById[challenge.to.id] || challenge.to.id}
            tag="TARGET"
            tone="to"
          />
          {filmsRemaining != null && !reached && (
            <div className="ml-1 hidden items-center gap-1 rounded-full bg-violet-100/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-300/50 sm:flex">
              <Target className="h-3 w-3" />
              {filmsRemaining} to go
            </div>
          )}
        </div>

        {trail.length > 1 && (
          <div className="pointer-events-auto">
            <GameTrail dataset={dataset} trail={trail} onJump={onJump} />
          </div>
        )}
      </div>

      {/* ── Win modal ────────────────────────────────────────────────── */}
      {reached && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/10 p-4 backdrop-blur-[2px]">
          <WinCard userFilms={userFilms} par={par} onNew={onNew} onUndo={onUndo} />
        </div>
      )}

      {/* ── Picker footer, bottom center ─────────────────────────────── */}
      {!reached && (
        <div className="fixed left-1/2 bottom-4 z-30 w-[min(96vw,960px)] -translate-x-1/2">
          <div className="glass-strong rounded-3xl p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium text-ink-900">
                {tip.kind === "actor" ? (
                  <Film className="h-3.5 w-3.5 text-violet-500" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                )}
                <span className="truncate">
                  {tip.kind === "actor"
                    ? `Pick a film with ${dataset.actorNamesById[tip.id] || tip.id}`
                    : `Pick a co-star from ${dataset.moviesById[tip.id]?.title ?? ""}`}
                </span>
                <span className="text-ink-500">· {options.length}</span>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <Btn
                  onClick={() => setSort((s) => (s === "popular" ? "az" : "popular"))}
                  title={sort === "popular" ? "Sorted by popularity" : "Sorted A–Z"}
                >
                  {sort === "popular" ? (
                    <Flame className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownAZ className="h-3.5 w-3.5" />
                  )}
                  {sort === "popular" ? "Popular" : "A–Z"}
                </Btn>
                <DifficultyPicker value={difficulty} onChange={onDifficulty} />
                <Btn onClick={onToggleHint} active={hintOn} title="Highlight the best next move">
                  <Lightbulb className="h-3.5 w-3.5" /> Hint
                </Btn>
                <Btn onClick={onUndo} disabled={trail.length <= 1} title="Undo last move">
                  <Undo2 className="h-3.5 w-3.5" /> Undo
                </Btn>
                <Btn onClick={onNew} dark title="New challenge">
                  <Dice5 className="h-3.5 w-3.5" /> New
                </Btn>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {options.map((opt) => {
                const key = `${opt.kind}:${opt.id}`;
                const isBest = hintOn && key === bestOptionKey;
                const isTarget = opt.kind === "actor" && opt.id === challenge.to.id;
                return opt.kind === "movie" ? (
                  <FilmCard
                    key={key}
                    movie={dataset.moviesById[opt.id]!}
                    best={isBest}
                    onClick={() => onPick(opt)}
                  />
                ) : (
                  <ActorCard
                    key={key}
                    name={dataset.actorNamesById[opt.id] || opt.id}
                    films={(dataset.filmography[opt.id] || []).length}
                    target={isTarget}
                    best={isBest}
                    onClick={() => onPick(opt)}
                  />
                );
              })}
              {options.length === 0 && (
                <div className="px-2 py-6 text-[12.5px] text-ink-500">
                  Dead end — everything here is already in your trail. Hit Undo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Endpoint({
  id,
  name,
  tag,
  tone,
}: {
  id: string;
  name: string;
  tag: string;
  tone: "from" | "to";
}) {
  return (
    <a
      href={imdbNameUrl(id)}
      target="_blank"
      rel="noreferrer"
      title={`${name} on IMDb`}
      className="group flex min-w-0 items-center gap-1.5"
    >
      <div
        className={[
          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white shadow-soft",
          tone === "from"
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
            : "bg-gradient-to-br from-emerald-500 to-cyan-500",
        ].join(" ")}
      >
        {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
      </div>
      <div className="min-w-0">
        <div
          className={[
            "text-[8.5px] font-semibold uppercase tracking-[0.14em]",
            tone === "from" ? "text-violet-700" : "text-emerald-700",
          ].join(" ")}
        >
          {tag}
        </div>
        <div className="max-w-[130px] truncate text-[13px] font-semibold leading-tight text-ink-900 group-hover:underline">
          {name}
        </div>
      </div>
    </a>
  );
}

function FilmCard({
  movie,
  best,
  onClick,
}: {
  movie: { id: string; title: string; year: number; rating: number; genres: string };
  best: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex w-[180px] shrink-0 items-center gap-2 rounded-2xl bg-white px-2.5 py-2 text-left ring-1 transition hover:bg-ink-900 hover:text-white",
        best ? "ring-2 ring-violet-500" : "ring-black/[0.05]",
      ].join(" ")}
    >
      <Poster movie={movie} className="h-12 w-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold leading-tight">
          {movie.title}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-ink-500 group-hover:text-white/70">
          <span>{movie.year}</span>
          <span className="opacity-40">·</span>
          <Star className="h-2.5 w-2.5 fill-amber-400 stroke-amber-500" />
          {movie.rating.toFixed(1)}
        </div>
      </div>
    </button>
  );
}

function ActorCard({
  name,
  films,
  target,
  best,
  onClick,
}: {
  name: string;
  films: number;
  target: boolean;
  best: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex w-[150px] shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 text-left ring-1 transition",
        target
          ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-900 ring-emerald-300/70 hover:from-emerald-200 hover:to-emerald-100"
          : best
            ? "bg-white ring-2 ring-violet-500 hover:bg-ink-900 hover:text-white"
            : "bg-white ring-black/[0.05] hover:bg-ink-900 hover:text-white",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white",
          target
            ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
            : "bg-gradient-to-br from-amber-400 to-orange-500",
        ].join(" ")}
      >
        {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold leading-tight">{name}</div>
        <div
          className={[
            "text-[10.5px]",
            target ? "text-emerald-700" : "text-ink-500 group-hover:text-white/70",
          ].join(" ")}
        >
          {target ? "🎯 the target!" : `${films} films`}
        </div>
      </div>
    </button>
  );
}

function DifficultyPicker({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  const opts: Difficulty[] = ["easy", "medium", "hard"];
  return (
    <div className="hidden items-center rounded-full bg-white/60 p-0.5 ring-1 ring-black/[0.05] md:flex">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition",
            value === o ? "bg-ink-900 text-white shadow-soft" : "text-ink-600 hover:text-ink-900",
          ].join(" ")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  dark,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  dark?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition disabled:opacity-40",
        dark
          ? "bg-ink-900 text-white shadow-soft hover:opacity-90"
          : active
            ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
            : "bg-white/70 text-ink-900 ring-1 ring-black/[0.05] hover:bg-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function WinCard({
  userFilms,
  par,
  onNew,
  onUndo,
}: {
  userFilms: number;
  par: number;
  onNew: () => void;
  onUndo: () => void;
}) {
  const perfect = userFilms <= par;
  return (
    <div className="glass-strong w-[min(92vw,360px)] rounded-3xl p-6 text-center shadow-soft animate-slide-up">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-soft">
        <Trophy className="h-7 w-7" />
      </div>
      <div className="mt-3 text-[20px] font-semibold tracking-tight">
        {perfect ? "Perfect link! 🎯" : "Connected!"}
      </div>
      <div className="mt-1 text-[13px] text-ink-500">
        You linked them in <span className="font-semibold text-ink-900">{userFilms}</span>{" "}
        {userFilms === 1 ? "film" : "films"} · par is {par}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-2 text-[13px] font-medium text-ink-900 ring-1 ring-black/[0.05] hover:bg-white"
        >
          <Undo2 className="h-3.5 w-3.5" /> Back
        </button>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-[13px] font-medium text-white shadow-soft hover:opacity-90"
        >
          <Dice5 className="h-3.5 w-3.5" /> New challenge
        </button>
      </div>
    </div>
  );
}
