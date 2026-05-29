"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset, type Movie } from "@/lib/dataset";
import { buildGraph, buildMovieGraph, type Focus, type GraphData } from "@/lib/graph";
import { DockHeader, type Mode } from "@/components/DockHeader";
import { MovieSearch } from "@/components/MovieSearch";
import { NetworkGraph } from "@/components/NetworkGraph";
import { InfoPanel } from "@/components/InfoPanel";
import { ActorPanel } from "@/components/ActorPanel";
import { BaconGame } from "@/components/BaconGame";
import { Loader2, Wand2 } from "lucide-react";

type TrailItem = { kind: "movie"; id: string } | { kind: "actor"; id: string };

export default function Home() {
  const dataset = useDataset();
  const [mode, setMode] = useState<Mode>("map");
  // The canvas can be centered on a film *or* an actor — clicking either kind
  // of node retargets it.
  const [focus, setFocus] = useState<Focus | null>(null);
  const focusMovie =
    focus?.kind === "movie" ? dataset?.moviesById[focus.id] ?? null : null;

  const [game, setGame] = useState<{
    from: Movie | null;
    to: Movie | null;
    trail: TrailItem[];
    revealOptimal: boolean;
    optimal: { type: "movie" | "actor"; id: string }[];
  }>({ from: null, to: null, trail: [], revealOptimal: false, optimal: [] });

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

  // In map mode, the focus drives the graph. In game mode, the *current* trail
  // tip drives it so the canvas tracks the player.
  const graph: GraphData = useMemo(() => {
    if (!dataset) return { nodes: [], links: [] };
    if (mode === "map") {
      return focus ? buildGraph(dataset, focus) : { nodes: [], links: [] };
    }
    // degrees mode
    const lastMovie = [...game.trail].reverse().find((t) => t.kind === "movie");
    const sourceMovieId = lastMovie?.id ?? game.from?.id ?? null;
    if (!sourceMovieId) return { nodes: [], links: [] };
    return buildMovieGraph(dataset, sourceMovieId);
  }, [dataset, mode, focus, game.trail, game.from]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees") {
      const lastMovie = [...game.trail].reverse().find((t) => t.kind === "movie");
      return lastMovie ? `movie:${lastMovie.id}` : game.from ? `movie:${game.from.id}` : undefined;
    }
    return focus ? `${focus.kind}:${focus.id}` : undefined;
  }, [mode, focus, game.trail, game.from]);

  // What to highlight on the canvas in degrees mode:
  // - the trail itself (always)
  // - the optimal path (only when revealed)
  // - the target movie (always, with its own ring)
  const highlightSet = useMemo(() => {
    if (mode !== "degrees") return undefined;
    const s = new Set<string>();
    for (const t of game.trail) {
      s.add(t.kind === "movie" ? `movie:${t.id}` : `actor:${t.id}`);
    }
    if (game.revealOptimal) {
      for (const o of game.optimal) {
        s.add(o.type === "movie" ? `movie:${o.id}` : `actor:${o.id}`);
      }
    }
    return s;
  }, [mode, game.trail, game.revealOptimal, game.optimal]);

  const targetNodeId = useMemo(() => {
    if (mode !== "degrees" || !game.to) return undefined;
    return `movie:${game.to.id}`;
  }, [mode, game.to]);

  return (
    <main className="relative min-h-screen">
      {/* Floating left dock — replaces the old top header + side panel. */}
      <div className="fixed left-4 top-4 bottom-4 z-30 w-[min(94vw,360px)] flex flex-col animate-slide-up">
        <div className="glass-strong rounded-[28px] flex flex-1 flex-col overflow-hidden">
          <DockHeader
            mode={mode}
            onModeChange={setMode}
            movieCount={dataset?.movies.length}
            actorCount={dataset?.actors.length}
          />

          <div className="border-t border-black/[0.04]" />

          {!dataset || !focus ? (
            <div className="flex-1 grid place-items-center p-6">
              <div className="flex flex-col items-center gap-2 text-ink-500 text-[13px]">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <div className="font-medium">Loading IMDb dataset…</div>
                <div className="text-[11px] opacity-80">
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
                {focus.kind === "actor" ? (
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
              <BaconGame
                dataset={dataset}
                onTrailChange={(challenge, trail, revealed) => {
                  if (!challenge) {
                    setGame({
                      from: null,
                      to: null,
                      trail: [],
                      revealOptimal: false,
                      optimal: [],
                    });
                    return;
                  }
                  setGame({
                    from: challenge.from,
                    to: challenge.to,
                    trail,
                    revealOptimal: revealed,
                    optimal: challenge.optimal.map((s) =>
                      s.type === "movie"
                        ? { type: "movie", id: s.id }
                        : { type: "actor", id: s.id },
                    ),
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Full-bleed graph canvas */}
      <section className="absolute inset-0">
        <NetworkGraph
          data={graph}
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

      {/* Legend bottom-right */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="glass pill flex items-center gap-3 px-4 py-2 text-[12px] animate-fade-in">
          {mode === "map" ? (
            <>
              <Legend swatch="bg-violet-600" label="In focus" />
              <Legend swatch="bg-amber-500" label="Actor · click to expand" />
              <Legend
                swatch="bg-gradient-to-br from-sky-400 to-fuchsia-400"
                label="Film · click to recenter"
              />
            </>
          ) : (
            <>
              <Legend swatch="bg-violet-600" label="You are here" />
              <Legend swatch="bg-emerald-500" label="Target" />
              <Legend swatch="bg-amber-500" label="Actor" />
            </>
          )}
        </div>
      </div>

      {/* Stats bottom-left (hidden on small screens) */}
      <div className="fixed bottom-4 left-[min(94vw,360px)] ml-6 z-30 hidden lg:block">
        <div className="glass pill px-4 py-2 text-[11.5px] text-ink-500 animate-fade-in flex items-center gap-1.5">
          <Wand2 className="h-3 w-3 text-fuchsia-500" />
          {graph.nodes.length} nodes · {graph.links.length} edges in view
        </div>
      </div>
    </main>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${swatch}`} />
      <span className="text-ink-700">{label}</span>
    </span>
  );
}
