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

  // Tune the underlying d3-force layout to give nodes more breathing room.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-260).distanceMax(420);
    fg.d3Force("link")?.distance((l: any) => {
      const sIsActor =
        typeof l.source === "object" ? l.source.type === "actor" : false;
      const tIsActor =
        typeof l.target === "object" ? l.target.type === "actor" : false;
      // actor ↔ other-movie spokes pushed further out than focal ↔ actor edges
      return sIsActor && tIsActor ? 90 : 70;
    });
    fg.d3Force("center")?.strength(0.06);
  });

  // memoize graph data so the force layout doesn't re-init constantly.
  const gdata = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    }),
    [data],
  );

  // re-zoom whenever focal changes
  useEffect(() => {
    const t = setTimeout(() => {
      fgRef.current?.zoomToFit(420, 80);
    }, 250);
    return () => clearTimeout(t);
  }, [focalId, gdata]);

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
          return "rgba(15,15,20,0.10)";
        }}
        linkWidth={(l: any) => {
          const sid = typeof l.source === "object" ? l.source.id : l.source;
          const tid = typeof l.target === "object" ? l.target.id : l.target;
          if (highlightPath && highlightPath.has(sid) && highlightPath.has(tid)) return 2.4;
          return 1;
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isFocal = node.id === focalId;
          const isTarget = node.id === targetId;
          const isHighlighted = highlightPath?.has(node.id);
          const isActor = node.type === "actor";

          // Radius scales with popularity (weight is 0..1).
          // Movies: 3.5 → 11 (radius gets larger with vote count).
          // Actors: 3 → 7.5  (radius gets larger with filmography size).
          // Focal node is always bumped to ~14 so it dominates visually.
          const w = typeof node.weight === "number" ? node.weight : 0.4;
          let r: number;
          if (isFocal) r = 14;
          else if (isActor) r = 3 + w * 4.5;
          else r = 3.5 + w * 7.5;

          const label = node.label as string;

          // Skip render until force layout has assigned finite coordinates.
          if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

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
            ctx.fillStyle = "#f59e0b"; // amber
            ctx.fill();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = "white";
            ctx.stroke();
          } else {
            // other movie
            const hue = (node.hue ?? 220) as number;
            ctx.fillStyle = `hsl(${hue} 65% 58%)`;
            ctx.fill();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = "white";
            ctx.stroke();
          }

          // labels: focal/target always, others when zoomed in or highlighted
          const show = isFocal || isTarget || isHighlighted || globalScale > 1.6;
          if (show) {
            const fontSize = isFocal ? 13 / Math.max(1, globalScale * 0.9) + 4 : 10 / globalScale + 2;
            ctx.font = `${isFocal ? 600 : 500} ${fontSize}px -apple-system, "SF Pro Text", Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const pad = 4;
            const text = label;
            const tw = ctx.measureText(text).width;
            const bx = node.x - tw / 2 - pad;
            const by = node.y + r + 3;
            ctx.fillStyle = "rgba(255,255,255,0.86)";
            roundRect(ctx, bx, by, tw + pad * 2, fontSize + pad * 1.4, 6);
            ctx.fill();
            ctx.fillStyle = "#0c0d10";
            ctx.fillText(text, node.x, by + pad * 0.6);
          }
        }}
        onNodeClick={(n: any) => onNodeClick?.(n)}
        onNodeHover={(n: any) => {
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
