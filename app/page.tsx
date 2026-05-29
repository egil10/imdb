"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset } from "@/lib/dataset";
import {
  applyGraphFilters,
  buildActorGraph,
  buildGraph,
  buildMovieGraph,
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
import { BaconGame } from "@/components/BaconGame";
import { GameTrail } from "@/components/GameTrail";
import { MapLegend } from "@/components/MapLegend";
import { Film, Loader2, UserRound, Wand2 } from "lucide-react";

type TrailItem = { kind: "movie"; id: string } | { kind: "actor"; id: string };
type GameState = {
  challenge: ActorChallenge;
  trail: TrailItem[];
  revealed: boolean;
};

export default function Home() {
  const dataset = useDataset();
  const [mode, setMode] = useState<Mode>("map");
  // The canvas can be centered on a film *or* an actor — clicking either kind
  // of node retargets it.
  const [focus, setFocus] = useState<Focus | null>(null);
  const focusMovie =
    focus?.kind === "movie" ? dataset?.moviesById[focus.id] ?? null : null;

  // Six Degrees state lives here (not inside BaconGame) so the trail can also
  // be rendered floating on the canvas.
  const [game, setGame] = useState<GameState | null>(null);

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

  // Bootstrap a challenge the first time the game is opened.
  useEffect(() => {
    if (mode !== "degrees" || !dataset || game) return;
    const c = pickSolvableActorChallenge(dataset);
    setGame({ challenge: c, trail: [{ kind: "actor", id: c.from.id }], revealed: false });
  }, [mode, dataset, game]);

  const newChallenge = () => {
    if (!dataset) return;
    const c = pickSolvableActorChallenge(dataset);
    setGame({ challenge: c, trail: [{ kind: "actor", id: c.from.id }], revealed: false });
  };
  const setTrail = (updater: (t: TrailItem[]) => TrailItem[]) =>
    setGame((g) => (g ? { ...g, trail: updater(g.trail) } : g));
  const toggleReveal = () =>
    setGame((g) => (g ? { ...g, revealed: !g.revealed } : g));

  const gameTip = game ? game.trail[game.trail.length - 1] : undefined;

  // In map mode the focus drives the graph. In game mode the *current* trail
  // tip drives it so the canvas tracks the player (an actor shows their films,
  // a film shows its cast).
  const graph: GraphData = useMemo(() => {
    if (!dataset) return { nodes: [], links: [] };
    if (mode === "map") {
      return focus ? buildGraph(dataset, focus) : { nodes: [], links: [] };
    }
    if (!gameTip) return { nodes: [], links: [] };
    return gameTip.kind === "actor"
      ? buildActorGraph(dataset, gameTip.id)
      : buildMovieGraph(dataset, gameTip.id);
  }, [dataset, mode, focus, gameTip]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees") {
      return gameTip ? `${gameTip.kind}:${gameTip.id}` : undefined;
    }
    return focus ? `${focus.kind}:${focus.id}` : undefined;
  }, [mode, focus, gameTip]);

  // Apply category toggles in map mode only (the game always needs everything).
  const visibleGraph = useMemo(
    () =>
      mode === "map" ? applyGraphFilters(graph, focalNodeId, filters) : graph,
    [graph, focalNodeId, filters, mode],
  );

  // Highlight the trail (always) and the optimal path (only when revealed).
  const highlightSet = useMemo(() => {
    if (mode !== "degrees" || !game) return undefined;
    const s = new Set<string>();
    for (const t of game.trail) s.add(`${t.kind}:${t.id}`);
    if (game.revealed) {
      for (const o of game.challenge.optimal) s.add(`${o.type}:${o.id}`);
    }
    return s;
  }, [mode, game]);

  const targetNodeId = useMemo(() => {
    if (mode !== "degrees" || !game) return undefined;
    return `actor:${game.challenge.to.id}`;
  }, [mode, game]);

  // Name of the central node, shown as a heading over the map (map mode).
  const central = useMemo(() => {
    if (mode !== "map" || !dataset || !focus) return null;
    if (focus.kind === "movie") {
      const m = dataset.moviesById[focus.id];
      return m
        ? { kind: "movie" as const, title: m.title, sub: String(m.year) }
        : null;
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
      {/* Floating left dock — replaces the old top header + side panel. */}
      <div className="fixed left-4 top-4 bottom-4 z-30 w-[min(94vw,344px)] flex flex-col animate-slide-up">
        <div className="glass-strong rounded-[26px] flex flex-1 flex-col overflow-hidden">
          <DockHeader
            mode={mode}
            onModeChange={setMode}
            movieCount={dataset?.movies.length}
            actorCount={dataset?.actors.length}
          />

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
          ) : mode === "map" ? (
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
          ) : (
            <div className="flex flex-1 min-h-0 flex-col px-4 pt-3 pb-4">
              {game ? (
                <BaconGame
                  dataset={dataset}
                  challenge={game.challenge}
                  trail={game.trail}
                  revealed={game.revealed}
                  onTrail={setTrail}
                  onNew={newChallenge}
                  onToggleReveal={toggleReveal}
                />
              ) : (
                <div className="flex-1 grid place-items-center text-ink-500 text-[12px]">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                </div>
              )}
            </div>
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
            if (!dataset || mode !== "map") return;
            // Every node is now actionable: a film recenters on that film,
            // an actor opens their full-career constellation.
            if (n.type === "movie") {
              const id = n.id.replace(/^movie:/, "");
              if (dataset.moviesById[id]) setFocus({ kind: "movie", id });
            } else {
              const id = n.id.replace(/^actor:/, "");
              if (dataset.filmography[id]) setFocus({ kind: "actor", id });
            }
          }}
        />
      </section>

      {/* Central node title (map mode) — top center over the canvas */}
      {central && (
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
          </div>
        </div>
      )}

      {/* Floating trail (game mode) — top center over the canvas */}
      {mode === "degrees" && game && dataset && (
        <div className="fixed left-1/2 top-4 z-30 -translate-x-1/2">
          <GameTrail
            dataset={dataset}
            trail={game.trail}
            onJump={(idx) => setTrail((t) => t.slice(0, idx + 1))}
          />
        </div>
      )}

      {/* Standardised colour legend + filter toggles, bottom-right */}
      <div className="fixed bottom-4 right-4 z-30">
        <MapLegend
          mode={mode}
          filters={mode === "map" ? filters : undefined}
          onToggleFilter={(k) =>
            setFilters((f) => ({ ...f, [k]: !f[k] }))
          }
        />
      </div>

      {/* Stats bottom-left (hidden on small screens) */}
      <div className="fixed bottom-4 left-[min(94vw,344px)] ml-6 z-30 hidden lg:block">
        <div className="glass pill px-4 py-2 text-[11.5px] text-ink-500 animate-fade-in flex items-center gap-1.5">
          <Wand2 className="h-3 w-3 text-fuchsia-500" />
          {visibleGraph.nodes.length} nodes · {visibleGraph.links.length} edges in view
        </div>
      </div>
    </main>
  );
}
