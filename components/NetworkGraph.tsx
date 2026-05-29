"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, GraphNode } from "@/lib/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-ink-500 text-sm">
      Loading graph…
    </div>
  ),
});

export function NetworkGraph({
  data,
  focalId,
  targetId,
  onNodeClick,
  highlightPath,
}: {
  data: GraphData;
  focalId?: string; // e.g. "movie:oppenheimer"
  targetId?: string; // game mode: emerald target ring
  onNodeClick?: (n: GraphNode) => void;
  highlightPath?: Set<string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // memoize graph data so the force layout doesn't re-init constantly.
  const gdata = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    }),
    [data],
  );

  // Adjacency built from the original (string) links — used to highlight a
  // node's immediate connections on hover. force-graph mutates link endpoints
  // into objects, so we read from `data` before that happens.
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      (m.get(a) ?? m.set(a, new Set()).get(a)!).add(b);
    };
    for (const l of data.links) {
      const s = l.source as unknown as string;
      const t = l.target as unknown as string;
      add(s, t);
      add(t, s);
    }
    return m;
  }, [data]);

  // Base zoom at which labels start appearing. Small graphs label almost
  // immediately; only very dense ones hold back a touch, so the canvas never
  // turns into a wall of overlapping text.
  const labelThreshold = useMemo(() => {
    const n = data.nodes.length;
    if (n > 280) return 0.9;
    if (n > 120) return 0.55;
    return 0.28;
  }, [data.nodes.length]);

  // Distance (in hops) of every node from the focal node, via BFS. Labels are
  // revealed level by level as you zoom in: focal (0) is always named, then its
  // direct neighbours — the cast (1) — then their films (2), and so on.
  const depthFromFocal = useMemo(() => {
    const m = new Map<string, number>();
    if (!focalId) return m;
    m.set(focalId, 0);
    const q = [focalId];
    let head = 0;
    while (head < q.length) {
      const cur = q[head++];
      const dc = m.get(cur)!;
      const nbs = neighbors.get(cur);
      if (!nbs) continue;
      for (const nb of nbs) {
        if (!m.has(nb)) {
          m.set(nb, dc + 1);
          q.push(nb);
        }
      }
    }
    return m;
  }, [neighbors, focalId]);

  // Tune the underlying d3-force layout to give nodes more breathing room.
  // Re-applied whenever the graph data changes (force-graph rebuilds its
  // simulation on new data, resetting these).
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // The focal node repels much harder so it carves out a clear hub of empty
    // space around itself — making it obvious what the graph is centered on.
    fg.d3Force("charge")
      ?.strength((n: any) => (n.id === focalId ? -900 : -260))
      .distanceMax(520);
    fg.d3Force("link")?.distance((l: any) => {
      const sid = typeof l.source === "object" ? l.source.id : l.source;
      const tid = typeof l.target === "object" ? l.target.id : l.target;
      // push the focal node's own spokes out furthest for breathing room
      if (sid === focalId || tid === focalId) return 150;
      const sIsActor =
        typeof l.source === "object" ? l.source.type === "actor" : false;
      const tIsActor =
        typeof l.target === "object" ? l.target.type === "actor" : false;
      // actor ↔ other-movie spokes pushed further out than focal ↔ actor edges
      return sIsActor && tIsActor ? 90 : 70;
    });
    fg.d3Force("center")?.strength(0.06);
    fg.d3ReheatSimulation?.();
  }, [gdata, focalId]);

  // re-zoom whenever focal changes
  useEffect(() => {
    const t = setTimeout(() => {
      fgRef.current?.zoomToFit(420, 80);
    }, 250);
    return () => clearTimeout(t);
  }, [focalId, gdata]);

  const hoverNeighbors = hoverId ? neighbors.get(hoverId) : undefined;

  return (
    <div ref={ref} className="absolute inset-0 dot-grid">
      <ForceGraph2D
        ref={fgRef}
        graphData={gdata}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTime={4000}
        warmupTicks={40}
        d3VelocityDecay={0.32}
        d3AlphaDecay={0.025}
        nodeRelSize={6}
        linkColor={(l: any) => {
          const sid = typeof l.source === "object" ? l.source.id : l.source;
          const tid = typeof l.target === "object" ? l.target.id : l.target;
          if (highlightPath && highlightPath.has(sid) && highlightPath.has(tid)) {
            return "rgba(124, 58, 237, 0.85)"; // violet-600
          }
          if (hoverId && (sid === hoverId || tid === hoverId)) {
            return "rgba(245, 158, 11, 0.7)"; // amber, edges of hovered node
          }
          return hoverId ? "rgba(15,15,20,0.04)" : "rgba(15,15,20,0.10)";
        }}
        linkWidth={(l: any) => {
          const sid = typeof l.source === "object" ? l.source.id : l.source;
          const tid = typeof l.target === "object" ? l.target.id : l.target;
          if (highlightPath && highlightPath.has(sid) && highlightPath.has(tid)) return 2.4;
          if (hoverId && (sid === hoverId || tid === hoverId)) return 1.8;
          return 1;
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // Skip render until force layout has assigned finite coordinates.
          if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

          const isFocal = node.id === focalId;
          const isTarget = node.id === targetId;
          const isHighlighted = highlightPath?.has(node.id);
          const isActor = node.type === "actor";
          const isHover = node.id === hoverId;
          const isNeighbor = hoverNeighbors?.has(node.id) ?? false;

          // When hovering, fade everything that isn't the node or its neighbors
          // so the local connections pop.
          const dimmed = !!hoverId && !isHover && !isNeighbor && !isHighlighted;
          ctx.save();
          if (dimmed) ctx.globalAlpha = 0.18;

          // Radius scales with popularity (weight is 0..1).
          // Movies: 3.5 → 11 (radius grows with vote count).
          // Actors: 3 → 7.5  (radius grows with filmography size).
          // Focal node is always bumped so it dominates visually.
          const w = typeof node.weight === "number" ? node.weight : 0.4;
          let r: number;
          if (isFocal) r = 19;
          else if (isActor) r = 3 + w * 4.5;
          else r = 3.5 + w * 7.5;
          if (isHover) r += 1.5;

          const label = node.label as string;

          // node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);

          if (isTarget) {
            // emerald glow for the game target
            const g = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, r * 2.4);
            g.addColorStop(0, "rgba(16,185,129,1)");
            g.addColorStop(0.6, "rgba(52,211,153,0.95)");
            g.addColorStop(1, "rgba(52,211,153,0)");
            ctx.fillStyle = g;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = "#10b981";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "white";
            ctx.stroke();
          } else if (isFocal) {
            // violet glow for the focal / current node
            const g = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, r * 2.2);
            g.addColorStop(0, "rgba(124,58,237,1)");
            g.addColorStop(0.6, "rgba(168,85,247,0.95)");
            g.addColorStop(1, "rgba(168,85,247,0)");
            ctx.fillStyle = g;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = "#7c3aed";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "white";
            ctx.stroke();
          } else if (isHighlighted) {
            ctx.fillStyle = isActor ? "#f59e0b" : "#7c3aed";
            ctx.fill();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = "white";
            ctx.stroke();
          } else if (isActor) {
            // amber sphere — reserved role colour, lit from top-left
            const g = ctx.createRadialGradient(
              node.x - r * 0.35,
              node.y - r * 0.35,
              r * 0.1,
              node.x,
              node.y,
              r,
            );
            g.addColorStop(0, "#fcd34d"); // amber-300
            g.addColorStop(1, "#f59e0b"); // amber-500
            ctx.fillStyle = g;
            ctx.fill();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = "white";
            ctx.stroke();
          } else {
            // other film — genre-hued sphere gradient
            const hue = (node.hue ?? 220) as number;
            const g = ctx.createRadialGradient(
              node.x - r * 0.35,
              node.y - r * 0.35,
              r * 0.1,
              node.x,
              node.y,
              r,
            );
            g.addColorStop(0, `hsl(${hue} 82% 70%)`);
            g.addColorStop(1, `hsl(${hue} 62% 48%)`);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = "white";
            ctx.stroke();
          }

          // Labels reveal step by step, outward from the centre: the focal node
          // (depth 0) is always named, the cast (depth 1) appears as you start
          // zooming, then their films (depth 2), and so on — never all at once.
          // Font is a constant on-screen size so text stays legible at any zoom.
          const depth = depthFromFocal.get(node.id);
          const d = depth == null ? 99 : depth;
          const reveal = d === 0 ? 0 : labelThreshold * (0.6 + (d - 1) * 2.4);
          const show =
            isFocal ||
            isTarget ||
            isHover ||
            isHighlighted ||
            (hoverId ? isNeighbor : globalScale > reveal);
          if (show && !dimmed) {
            const screenPx = isFocal ? 18 : isActor ? 12.5 : 11.5;
            const fontSize = screenPx / globalScale;
            ctx.font = `${isFocal || isActor ? 600 : 500} ${fontSize}px -apple-system, "SF Pro Text", Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const pad = 4 / globalScale;
            const text = label;
            const tw = ctx.measureText(text).width;
            const bx = node.x - tw / 2 - pad;
            const by = node.y + r + 3 / globalScale;
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            roundRect(ctx, bx, by, tw + pad * 2, fontSize + pad * 1.4, 6 / globalScale);
            ctx.fill();
            ctx.fillStyle = "#0c0d10";
            ctx.fillText(text, node.x, by + pad * 0.6);
          }

          ctx.restore();
        }}
        onNodeClick={(n: any) => onNodeClick?.(n)}
        onNodeHover={(n: any) => {
          setHoverId(n ? n.id : null);
          if (typeof document !== "undefined") {
            document.body.style.cursor = n ? "pointer" : "";
          }
        }}
      />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
