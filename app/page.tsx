"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset, imdbNameUrl, imdbTitleUrl } from "@/lib/dataset";
import {
  applyGraphFilters,
  bfsDistancesFromActor,
  buildGameGraph,
  buildGraph,
  gameOptions,
  pickSolvableActorChallenge,
  type ActorChallenge,
  type Focus,
  type GraphData,
  type GraphFilters,
} from "@/lib/graph";
import { DockHeader, type Mode } from "@/components/DockHeader";
import { MovieSearch } from "@/components/MovieSearch";
import { NetworkGraph } from "@/components/NetworkGraph";
import { InfoPanel } from "@/components/InfoPanel";
import { ActorPanel } from "@/components/ActorPanel";
import { GameMode, type Difficulty } from "@/components/GameMode";
import { MapLegend } from "@/components/MapLegend";
import { ExternalLink, Film, Loader2, UserRound, Wand2 } from "lucide-react";

type TrailItem = { kind: "movie"; id: string } | { kind: "actor"; id: string };
type GameState = {
  challenge: ActorChallenge;
  trail: TrailItem[];
  hint: boolean;
};

const HOP_RANGE: Record<Difficulty, [number, number]> = {
  easy: [2, 2],
  medium: [3, 3],
  hard: [4, 6],
};

export default function Home() {
  const dataset = useDataset();
  const [mode, setMode] = useState<Mode>("map");
  // The canvas can be centered on a film *or* an actor — clicking either kind
  // of node retargets it.
  const [focus, setFocus] = useState<Focus | null>(null);
  const focusMovie =
    focus?.kind === "movie" ? dataset?.moviesById[focus.id] ?? null : null;

  // Six Degrees state lives here (not inside the game UI) so the trail/graph
  // can be driven from the canvas too.
  const [game, setGame] = useState<GameState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  // Map-mode category toggles for decluttering the canvas.
  const [filters, setFilters] = useState<GraphFilters>({ actors: true, films: true });

  // Seed focus once the dataset loads.
  useEffect(() => {
    if (!dataset || focus) return;
    const preferred = ["tt15398776", "tt1375666", "tt0468569", "tt0110912"]; // Oppenheimer, Inception, Dark Knight, Pulp Fiction
    for (const id of preferred) {
      if (dataset.moviesById[id]) {
        setFocus({ kind: "movie", id });
        return;
      }
    }
    const top = [...dataset.movies].sort((a, b) => b.votes - a.votes)[0];
    if (top) setFocus({ kind: "movie", id: top.id });
  }, [dataset, focus]);

  const startChallenge = (d: Difficulty) => {
    if (!dataset) return;
    const [lo, hi] = HOP_RANGE[d];
    const c = pickSolvableActorChallenge(dataset, lo, hi);
    setGame({ challenge: c, trail: [{ kind: "actor", id: c.from.id }], hint: false });
  };

  // Bootstrap a challenge the first time the game is opened.
  useEffect(() => {
    if (mode !== "degrees" || !dataset || game) return;
    startChallenge(difficulty);
  }, [mode, dataset, game]); // eslint-disable-line react-hooks/exhaustive-deps

  const newChallenge = () => startChallenge(difficulty);
  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    if (dataset) {
      const [lo, hi] = HOP_RANGE[d];
      const c = pickSolvableActorChallenge(dataset, lo, hi);
      setGame({ challenge: c, trail: [{ kind: "actor", id: c.from.id }], hint: false });
    }
  };
  const setTrail = (updater: (t: TrailItem[]) => TrailItem[]) =>
    setGame((g) => (g ? { ...g, trail: updater(g.trail) } : g));
  const pickOption = (opt: Focus) =>
    setTrail((t) => [...t, { kind: opt.kind, id: opt.id }]);
  const toggleHint = () => setGame((g) => (g ? { ...g, hint: !g.hint } : g));

  const gameTip = game ? (game.trail[game.trail.length - 1] as Focus) : undefined;
  const visitedKeys = useMemo(
    () => new Set((game?.trail ?? []).map((t) => `${t.kind}:${t.id}`)),
    [game],
  );

  // Edge distances from the target actor — powers the hint + "films to go".
  const distFromTarget = useMemo(() => {
    if (mode !== "degrees" || !dataset || !game) return null;
    return bfsDistancesFromActor(dataset, game.challenge.to.id);
  }, [mode, dataset, game]);

  const filmsRemaining = useMemo(() => {
    if (!distFromTarget || !gameTip) return null;
    const k =
      gameTip.kind === "actor"
        ? distFromTarget.get(`a:${gameTip.id}`)
        : distFromTarget.get(`m:${gameTip.id}`);
    if (k == null) return null;
    return gameTip.kind === "actor" ? k / 2 : (k - 1) / 2;
  }, [distFromTarget, gameTip]);

  const bestOptionKey = useMemo(() => {
    if (!game?.hint || !dataset || !distFromTarget || !gameTip) return undefined;
    let best: string | undefined;
    let bd = Infinity;
    for (const o of gameOptions(dataset, gameTip, visitedKeys)) {
      const dk =
        o.kind === "actor"
          ? distFromTarget.get(`a:${o.id}`)
          : distFromTarget.get(`m:${o.id}`);
      if (dk != null && dk < bd) {
        bd = dk;
        best = `${o.kind}:${o.id}`;
      }
    }
    return best;
  }, [game?.hint, dataset, distFromTarget, gameTip, visitedKeys]);

  // In map mode the focus drives the graph. In game mode the canvas shows just
  // the trail tip and its legal next moves (a clickable game board).
  const graph: GraphData = useMemo(() => {
    if (!dataset) return { nodes: [], links: [] };
    if (mode === "map") {
      return focus ? buildGraph(dataset, focus) : { nodes: [], links: [] };
    }
    if (!gameTip) return { nodes: [], links: [] };
    return buildGameGraph(dataset, gameTip, visitedKeys);
  }, [dataset, mode, focus, gameTip, visitedKeys]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees") return gameTip ? `${gameTip.kind}:${gameTip.id}` : undefined;
    return focus ? `${focus.kind}:${focus.id}` : undefined;
  }, [mode, focus, gameTip]);

  // Apply category toggles in map mode only.
  const visibleGraph = useMemo(
    () => (mode === "map" ? applyGraphFilters(graph, focalNodeId, filters) : graph),
    [graph, focalNodeId, filters, mode],
  );

  const highlightSet = useMemo(() => {
    if (mode !== "degrees" || !game?.hint || !bestOptionKey || !focalNodeId) return undefined;
    return new Set<string>([focalNodeId, bestOptionKey]);
  }, [mode, game?.hint, bestOptionKey, focalNodeId]);

  const targetNodeId = useMemo(() => {
    if (mode !== "degrees" || !game) return undefined;
    return `actor:${game.challenge.to.id}`;
  }, [mode, game]);

  // Name of the central node, shown as a heading over the map (map mode).
  const central = useMemo(() => {
    if (mode !== "map" || !dataset || !focus) return null;
    if (focus.kind === "movie") {
      const m = dataset.moviesById[focus.id];
      return m ? { kind: "movie" as const, title: m.title, sub: String(m.year) } : null;
    }
    const name = dataset.actorNamesById[focus.id];
    return name
      ? {
          kind: "actor" as const,
          title: name,
          sub: `${(dataset.filmography[focus.id] || []).length} films`,
        }
      : null;
  }, [mode, dataset, focus]);

  return (
    <main className="relative min-h-screen">
      {/* Floating left dock. Full sidebar in map mode; compact header-only in
          game mode (the game lives in floating overlays). */}
      <div
        className={[
          "fixed left-4 top-4 z-30 w-[min(94vw,344px)] flex flex-col animate-slide-up",
          mode === "map" ? "bottom-4" : "",
        ].join(" ")}
      >
        <div
          className={[
            "glass-strong rounded-[26px] flex flex-col overflow-hidden",
            mode === "map" ? "flex-1" : "",
          ].join(" ")}
        >
          <DockHeader
            mode={mode}
            onModeChange={setMode}
            movieCount={dataset?.movies.length}
            actorCount={dataset?.actors.length}
          />

          {mode === "map" && (
            <>
              <div className="border-t border-black/[0.04]" />
              {!dataset ? (
                <div className="flex-1 grid place-items-center p-6">
                  <div className="flex flex-col items-center gap-2 text-ink-500 text-[12px]">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                    <div className="font-medium">Loading IMDb dataset…</div>
                    <div className="text-[10.5px] opacity-80">
                      7.5 MB · cached after first visit
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 min-h-0 flex-col gap-3 px-4 pt-3 pb-4">
                  <MovieSearch
                    dataset={dataset}
                    value={focusMovie}
                    onChange={(m) => setFocus({ kind: "movie", id: m.id })}
                    placeholder="Search any film…"
                  />
                  <div className="flex-1 min-h-0">
                    {focus?.kind === "actor" ? (
                      <ActorPanel
                        dataset={dataset}
                        actorId={focus.id}
                        onPickMovie={(id) => setFocus({ kind: "movie", id })}
                        onPickActor={(id) => setFocus({ kind: "actor", id })}
                      />
                    ) : focusMovie ? (
                      <InfoPanel
                        dataset={dataset}
                        movie={focusMovie}
                        onPickMovie={(id) => setFocus({ kind: "movie", id })}
                        onPickActor={(id) => setFocus({ kind: "actor", id })}
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full-bleed graph canvas */}
      <section className="absolute inset-0">
        <NetworkGraph
          data={visibleGraph}
          focalId={focalNodeId}
          targetId={targetNodeId}
          highlightPath={highlightSet}
          onNodeClick={(n) => {
            if (!dataset) return;
            if (mode === "map") {
              if (n.type === "movie") {
                const id = n.id.replace(/^movie:/, "");
                if (dataset.moviesById[id]) setFocus({ kind: "movie", id });
              } else {
                const id = n.id.replace(/^actor:/, "");
                if (dataset.filmography[id]) setFocus({ kind: "actor", id });
              }
              return;
            }
            // Game mode: clicking any option node advances the trail.
            if (!gameTip || n.id === focalNodeId) return;
            if (n.type === "movie") {
              pickOption({ kind: "movie", id: n.id.replace(/^movie:/, "") });
            } else {
              pickOption({ kind: "actor", id: n.id.replace(/^actor:/, "") });
            }
          }}
        />
      </section>

      {/* Central node title (map mode) — top center over the canvas */}
      {central && focus && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-20 -translate-x-1/2">
          <div className="glass pill flex items-center gap-2 px-4 py-2 animate-fade-in">
            {central.kind === "movie" ? (
              <Film className="h-4 w-4 text-violet-600" />
            ) : (
              <UserRound className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-[15px] font-semibold tracking-tight text-ink-900">
              {central.title}
            </span>
            <span className="text-[12px] text-ink-500">{central.sub}</span>
            <a
              href={
                focus.kind === "movie"
                  ? imdbTitleUrl(focus.id)
                  : imdbNameUrl(focus.id)
              }
              target="_blank"
              rel="noreferrer"
              title="View on IMDb"
              className="pointer-events-auto ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-bold text-ink-900 ring-1 ring-black/[0.06] transition hover:bg-amber-400"
            >
              IMDb <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Game overlays (top goal/trail + footer picker + win modal) */}
      {mode === "degrees" && dataset && game && (
        <GameMode
          dataset={dataset}
          challenge={game.challenge}
          trail={game.trail}
          hintOn={game.hint}
          difficulty={difficulty}
          filmsRemaining={filmsRemaining}
          bestOptionKey={bestOptionKey}
          onPick={pickOption}
          onUndo={() => setTrail((t) => (t.length <= 1 ? t : t.slice(0, -1)))}
          onNew={newChallenge}
          onJump={(idx) => setTrail((t) => t.slice(0, idx + 1))}
          onToggleHint={toggleHint}
          onDifficulty={changeDifficulty}
        />
      )}

      {/* Map legend + filters (map mode only) */}
      {mode === "map" && (
        <div className="fixed bottom-4 right-4 z-30">
          <MapLegend
            mode={mode}
            filters={filters}
            onToggleFilter={(k) => setFilters((f) => ({ ...f, [k]: !f[k] }))}
          />
        </div>
      )}

      {/* Stats bottom-left (map mode, large screens) */}
      {mode === "map" && (
        <div className="fixed bottom-4 left-[min(94vw,344px)] ml-6 z-30 hidden lg:block">
          <div className="glass pill px-4 py-2 text-[11.5px] text-ink-500 animate-fade-in flex items-center gap-1.5">
            <Wand2 className="h-3 w-3 text-fuchsia-500" />
            {visibleGraph.nodes.length} nodes · {visibleGraph.links.length} edges in view
          </div>
        </div>
      )}
    </main>
  );
}
