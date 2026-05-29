"use client";

import { Clapperboard, Github, Map, Sparkles } from "lucide-react";

export type Mode = "map" | "degrees";

export function DockHeader({
  mode,
  onModeChange,
  movieCount,
  actorCount,
}: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  movieCount?: number;
  actorCount?: number;
}) {
  return (
    <div className="flex flex-col gap-2.5 px-3.5 pt-3.5 pb-2.5">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-soft">
          <Clapperboard className="h-3.5 w-3.5" strokeWidth={2.4} />
        </div>
        <div className="text-[14px] font-semibold tracking-tight leading-none">
          IMDB Map
        </div>
        <span className="text-[10.5px] text-ink-500 tabular-nums">
          {movieCount != null ? `${(movieCount / 1000).toFixed(0)}k films` : "…"}
          {actorCount != null ? ` · ${(actorCount / 1000).toFixed(0)}k actors` : ""}
        </span>
        <a
          href="https://github.com/egil10/imdb"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-white/60 ring-1 ring-black/[0.04] text-ink-700 transition hover:bg-white"
        >
          <Github className="h-3.5 w-3.5" strokeWidth={2.2} />
        </a>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white/55 p-0.5 ring-1 ring-black/[0.04]">
        <TabButton
          active={mode === "map"}
          onClick={() => onModeChange("map")}
          icon={<Map className="h-3.5 w-3.5" strokeWidth={2.4} />}
          label="Map"
        />
        <TabButton
          active={mode === "degrees"}
          onClick={() => onModeChange("degrees")}
          icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />}
          label="6 Degrees"
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition",
        active ? "bg-ink-900 text-white shadow-soft" : "text-ink-700 hover:bg-white/80",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
