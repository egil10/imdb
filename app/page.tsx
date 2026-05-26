"use client";

import { useMemo, useState } from "react";
import { MOVIES_BY_ID, MOVIES, type Movie } from "@/data/movies";
import { buildMovieGraph, findPath, type GraphData, type PathStep } from "@/lib/graph";
import { Header, type Mode } from "@/components/Header";
import { MovieSearch } from "@/components/MovieSearch";
import { NetworkGraph } from "@/components/NetworkGraph";
import { InfoPanel } from "@/components/InfoPanel";
import { DegreesPanel } from "@/components/DegreesPanel";
import { Sparkles, Wand2 } from "lucide-react";

const DEFAULT_FOCAL = "oppenheimer";

export default function Home() {
  const [mode, setMode] = useState<Mode>("map");
  const [focal, setFocal] = useState<Movie>(
    MOVIES_BY_ID[DEFAULT_FOCAL] ?? MOVIES[0],
  );
  const [pathSteps, setPathSteps] = useState<PathStep[] | null>(null);
  const [pathFromTo, setPathFromTo] = useState<{ from: Movie | null; to: Movie | null }>({
    from: null,
    to: null,
  });

  const graph: GraphData = useMemo(() => {
    if (mode === "degrees" && pathSteps && pathFromTo.from) {
      return buildMovieGraph(pathFromTo.from.id);
    }
    return buildMovieGraph(focal.id);
  }, [mode, focal.id, pathSteps, pathFromTo.from]);

  const focalNodeId = useMemo(() => {
    if (mode === "degrees" && pathFromTo.from) return `movie:${pathFromTo.from.id}`;
    return `movie:${focal.id}`;
  }, [mode, focal.id, pathFromTo.from]);

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
      <Header mode={mode} onModeChange={setMode} />

      {/* Floating hint pill */}
      <div className="pointer-events-none fixed left-1/2 top-24 z-30 -translate-x-1/2">
        <div className="glass pill flex items-center gap-1.5 px-3 py-1 text-[11.5px] text-ink-500 animate-fade-in">
          <Sparkles className="h-3 w-3 text-violet-500" />
          {mode === "map"
            ? "Click any film in the cloud to dive in"
            : "Pick two films — we'll find the shortest cast-chain"}
        </div>
      </div>

      {/* Left panel: search + info / degrees */}
      <div className="fixed left-4 top-24 bottom-4 z-30 w-[min(94vw,360px)] flex flex-col gap-3 animate-slide-up">
        {mode === "map" ? (
          <>
            <MovieSearch
              value={focal}
              onChange={(m) => setFocal(m)}
              placeholder="Search any film…"
            />
            <div className="flex-1 min-h-0">
              <InfoPanel
                movie={focal}
                onPickMovie={(id) => {
                  const m = MOVIES_BY_ID[id];
                  if (m) setFocal(m);
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0">
            <DegreesPanel
              onPath={(steps, from, to) => {
                setPathSteps(steps);
                setPathFromTo({ from, to });
              }}
            />
          </div>
        )}
      </div>

      {/* Graph canvas */}
      <section className="absolute inset-0">
        <NetworkGraph
          data={graph}
          focalId={focalNodeId}
          highlightPath={highlightSet}
          onNodeClick={(n) => {
            if (n.type === "movie" && mode === "map") {
              const id = n.id.replace(/^movie:/, "");
              const m = MOVIES_BY_ID[id];
              if (m) setFocal(m);
            }
          }}
        />
      </section>

      {/* Bottom-right legend */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="glass pill flex items-center gap-3 px-4 py-2 text-[12px] animate-fade-in">
          <Legend swatch="bg-violet-600" label="Focal film" />
          <Legend swatch="bg-amber-500" label="Actor" />
          <Legend swatch="bg-gradient-to-br from-sky-400 to-fuchsia-400" label="Other films" />
        </div>
      </div>

      {/* Stats pill bottom-left */}
      <div className="fixed bottom-4 left-4 z-30 hidden md:block">
        <div className="glass pill px-4 py-2 text-[11.5px] text-ink-500 animate-fade-in flex items-center gap-1.5">
          <Wand2 className="h-3 w-3 text-fuchsia-500" />
          {MOVIES.length} films · {Object.keys(graph.nodes.reduce((a, n) => ((a[n.id] = 1), a), {} as Record<string, number>)).length} nodes in view
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
