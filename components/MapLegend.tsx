"use client";

import { ChevronDown, Eye, EyeOff, Palette } from "lucide-react";
import { useState } from "react";
import { GENRE_HUES, colorForHue } from "@/lib/dataset";
import type { GraphFilters } from "@/lib/graph";
import type { Mode } from "./DockHeader";

// One floating, standardised key for the whole canvas: what the special nodes
// mean, what every film colour maps to (genre hue band), and — in map mode —
// toggles to hide whole categories.
export function MapLegend({
  mode,
  filters,
  onToggleFilter,
}: {
  mode: Mode;
  filters?: GraphFilters;
  onToggleFilter?: (key: keyof GraphFilters) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass w-[210px] rounded-2xl p-2.5 text-[10.5px] animate-fade-in">
      {mode === "degrees" ? (
        <div className="grid gap-1">
          <Key color="#7c3aed" label="You are here" />
          <Key color="#10b981" label="Target" />
          <Key color="#f59e0b" label="Actor" />
        </div>
      ) : (
        <div className="grid gap-1">
          <Key color="#7c3aed" label="In focus" />
          <Toggle
            color="#f59e0b"
            label="Actors"
            on={filters?.actors ?? true}
            onClick={() => onToggleFilter?.("actors")}
          />
          <Toggle
            color="hsl(220 70% 56%)"
            label="Films"
            on={filters?.films ?? true}
            onClick={() => onToggleFilter?.("films")}
          />
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex w-full items-center gap-1.5 border-t border-black/[0.06] pt-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-500 transition hover:text-ink-700"
      >
        <Palette className="h-3 w-3" />
        Film genre
        <ChevronDown
          className={`ml-auto h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
          {Object.entries(GENRE_HUES).map(([genre, hue]) => (
            <Key key={genre} color={colorForHue(hue)} label={cap(genre)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 leading-none">
      <Dot color={color} />
      <span className="truncate text-ink-700">{label}</span>
    </span>
  );
}

function Toggle({
  color,
  label,
  on,
  onClick,
}: {
  color: string;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 leading-none transition ${on ? "" : "opacity-40"}`}
      title={on ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
    >
      <Dot color={color} />
      <span className={`truncate text-ink-700 ${on ? "" : "line-through"}`}>
        {label}
      </span>
      {on ? (
        <Eye className="ml-auto h-3 w-3 text-ink-500" />
      ) : (
        <EyeOff className="ml-auto h-3 w-3 text-ink-500" />
      )}
    </button>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-black/[0.06]"
      style={{ backgroundColor: color }}
    />
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
