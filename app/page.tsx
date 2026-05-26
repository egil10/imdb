"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset, type Movie } from "@/lib/dataset";
import { buildMovieGraph, type GraphData } from "@/lib/graph";
import { DockHeader, type Mode } from "@/components/DockHeader";
import { MovieSearch } from "@/components/MovieSearch";
import { NetworkGraph } from "@/components/NetworkGraph";
import { InfoPanel } from "@/components/InfoPanel";
import { BaconGame } from "@/components/BaconGame";
import { Loader2, Wand2 } from "lucide-react";

type TrailItem = { kind: "movie"; id: string } | { kind: "actor"; id: string };

export default function Home() {
  const dataset = useDataset();
  const [mode, setMode] = useState<Mode>("map");
  const [focal, setFocal] = useState<Movie | null>(null);

  const [game, setGame] = useState<{
    from: Movie | null;
    to: Movie | null;
    trail: TrailItem[];
    revealOptimal: boolean;
    optimal: { type: "movie" | "actor"; id: string }[];
  }>({ from: null, to: null, trail: [], revealOptimal: false, optimal: [] });

  // Seed focal once the dataset loads.
  useEffect(() => {
    if (!dataset || focal) return;
    const preferred = ["tt15398776", "tt1375666", "tt0468569", "tt0110912"]; // Oppenheimer, Inception, Dark Knight, Pulp Fiction
    for (const id of preferred) {
      const m = dataset.moviesById[id];
      if (m) {
        setFocal(m);
        return;
      }
    }
    setFocal([...dataset.movies].sort((a, b) => b.votes - a.votes)[0] ?? null);
  }, [dataset, focal]);

  // In map mode, the focal drives the graph. In game mode, the *current* trail
  // tip drives it so the canvas tracks the player.
  const graph: GraphData = useMemo(() => {
    if (!dataset) return { nodes: [], links: [] };
    let sourceMovieId: string | null = null;
    if (mode === "map") sourceMovieId = focal?.id ?? null;
    else if (mode === "degrees") {
      const lastMovie = [...game.trail].reverse().find((t) => t.kind === "movie");
      sourceMovieId = lastMovie?.id ?? game.from?.id ?? null;
    }
    if (!sourceMovieId) return { nodes: [], links: [] };
    return buildMovieGraph(dataset, sourceMovieId);
  }, [dataset, mode, focal, game.trail, game.from]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees") {
      const lastMovie = [...game.trail].reverse().find((t) => t.kind === "movie");
      return lastMovie ? `movie:${lastMovie.id}` : game.from ? `movie:${game.from.id}` : undefined;
    }
    return focal ? `movie:${focal.id}` : undefined;
  }, [mode, focal, game.trail, game.from]);

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

          {!dataset || !focal ? (
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
                value={focal}
                onChange={(m) => setFocal(m)}
                placeholder="Search any film…"
              />
              <div className="flex-1 min-h-0">
                <InfoPanel
                  dataset={dataset}
                  movie={focal}
                  onPickMovie={(id) => {
                    const m = dataset.moviesById[id];
                    if (m) setFocal(m);
                  }}
                />
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
            if (!dataset) return;
            if (n.type === "movie" && mode === "map") {
              const id = n.id.replace(/^movie:/, "");
              const m = dataset.moviesById[id];
              if (m) setFocal(m);
            }
          }}
        />
      </section>

      {/* Legend bottom-right */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="glass pill flex items-center gap-3 px-4 py-2 text-[12px] animate-fade-in">
          {mode === "map" ? (
            <>
              <Legend swatch="bg-violet-600" label="Focal film" />
              <Legend swatch="bg-amber-500" label="Actor" />
              <Legend
                swatch="bg-gradient-to-br from-sky-400 to-fuchsia-400"
                label="Other films"
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
