"use client";

import { Clapperboard, Film, Github, Map, Sparkles, Users } from "lucide-react";

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
    <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-soft">
          <Clapperboard className="h-4 w-4" strokeWidth={2.4} />
        </div>
        <div className="leading-none">
          <div className="text-[16px] font-semibold tracking-tight">IMDB Map</div>
          <div className="mt-0.5 text-[11px] text-ink-500">cinema as a network</div>
        </div>
        <a
          href="https://github.com/egil10/imdb"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/60 ring-1 ring-black/[0.04] text-ink-700 transition hover:bg-white"
        >
          <Github className="h-3.5 w-3.5" strokeWidth={2.2} />
        </a>
      </div>

      <div className="flex items-center gap-1.5">
        <Stat
          icon={<Film className="h-3 w-3" />}
          value={movieCount}
          label="films"
        />
        <Stat
          icon={<Users className="h-3 w-3" />}
          value={actorCount}
          label="actors"
        />
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white/55 p-1 ring-1 ring-black/[0.04]">
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

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-1.5 rounded-full bg-white/55 px-2.5 py-1 text-[11.5px] text-ink-700 ring-1 ring-black/[0.04]">
      <span className="text-ink-500">{icon}</span>
      <span className="font-semibold tabular-nums">
        {value != null ? value.toLocaleString() : "…"}
      </span>
      <span className="text-ink-500">{label}</span>
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
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition",
        active ? "bg-ink-900 text-white shadow-soft" : "text-ink-700 hover:bg-white/80",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
