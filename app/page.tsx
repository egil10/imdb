"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset, type Movie } from "@/lib/dataset";
import { buildMovieGraph, type GraphData, type PathStep } from "@/lib/graph";
import { Header, type Mode } from "@/components/Header";
import { MovieSearch } from "@/components/MovieSearch";
import { NetworkGraph } from "@/components/NetworkGraph";
import { InfoPanel } from "@/components/InfoPanel";
import { DegreesPanel } from "@/components/DegreesPanel";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

export default function Home() {
  const dataset = useDataset();
  const [mode, setMode] = useState<Mode>("map");
  const [focal, setFocal] = useState<Movie | null>(null);
  const [pathSteps, setPathSteps] = useState<PathStep[] | null>(null);
  const [pathFromTo, setPathFromTo] = useState<{ from: Movie | null; to: Movie | null }>({
    from: null,
    to: null,
  });

  // Seed the focal movie once the dataset loads — pick a familiar high-votes film.
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
    // fallback: highest-voted film
    setFocal([...dataset.movies].sort((a, b) => b.votes - a.votes)[0] ?? null);
  }, [dataset, focal]);

  const graph: GraphData = useMemo(() => {
    if (!dataset) return { nodes: [], links: [] };
    const sourceMovie =
      mode === "degrees" && pathFromTo.from ? pathFromTo.from : focal;
    if (!sourceMovie) return { nodes: [], links: [] };
    return buildMovieGraph(dataset, sourceMovie.id);
  }, [dataset, mode, focal, pathFromTo.from]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees" && pathFromTo.from) return `movie:${pathFromTo.from.id}`;
    return focal ? `movie:${focal.id}` : undefined;
  }, [mode, focal, pathFromTo.from]);

  const highlightSet = useMemo(() => {
    if (mode !== "degrees" || !pathSteps) return undefined;
    return new Set(
      pathSteps.map((s) =>
        s.type === "movie" ? `movie:${s.id}` : `actor:${s.id}`,
      ),
    );
  }, [mode, pathSteps]);

  return (
    <main className="relative min-h-screen">
      <Header
        mode={mode}
        onModeChange={setMode}
        movieCount={dataset?.movies.length}
        actorCount={dataset?.actors.length}
      />

      <div className="pointer-events-none fixed left-1/2 top-24 z-30 -translate-x-1/2">
        <div className="glass pill flex items-center gap-1.5 px-3 py-1 text-[11.5px] text-ink-500 animate-fade-in">
          <Sparkles className="h-3 w-3 text-violet-500" />
          {!dataset
            ? "Loading the cinema network…"
            : mode === "map"
            ? "Click any film in the cloud to dive in"
            : "Pick two films — we'll find the shortest cast-chain"}
        </div>
      </div>

      <div className="fixed left-4 top-24 bottom-4 z-30 w-[min(94vw,360px)] flex flex-col gap-3 animate-slide-up">
        {!dataset || !focal ? (
          <div className="flex-1 glass-strong rounded-[28px] grid place-items-center p-6">
            <div className="flex flex-col items-center gap-2 text-ink-500 text-[13px]">
              <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              <div className="font-medium">Loading IMDb dataset…</div>
              <div className="text-[11px] opacity-80">2.5 MB · cached after first visit</div>
            </div>
          </div>
        ) : mode === "map" ? (
          <>
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
          </>
        ) : (
          <div className="flex-1 min-h-0">
            <DegreesPanel
              dataset={dataset}
              onPath={(steps, from, to) => {
                setPathSteps(steps);
                setPathFromTo({ from, to });
              }}
            />
          </div>
        )}
      </div>

      <section className="absolute inset-0">
        <NetworkGraph
          data={graph}
          focalId={focalNodeId}
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

      <div className="fixed bottom-4 right-4 z-30">
        <div className="glass pill flex items-center gap-3 px-4 py-2 text-[12px] animate-fade-in">
          <Legend swatch="bg-violet-600" label="Focal film" />
          <Legend swatch="bg-amber-500" label="Actor" />
          <Legend swatch="bg-gradient-to-br from-sky-400 to-fuchsia-400" label="Other films" />
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-30 hidden md:block">
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
