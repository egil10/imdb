"use client";

import { Clapperboard, Map, Sparkles, Github } from "lucide-react";

export type Mode = "map" | "degrees";

export function Header({ mode, onModeChange }: { mode: Mode; onModeChange: (m: Mode) => void }) {
  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(96vw,860px)]">
      <div className="glass-strong pill flex items-center gap-2 px-2 py-2">
        <div className="flex items-center gap-2 pl-3 pr-2">
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-soft">
            <Clapperboard className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-tight">IMDB Map</div>
            <div className="text-[11px] text-ink-500">cinema as a network</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-full bg-white/60 p-1 ring-1 ring-black/[0.04]">
          <PillButton
            active={mode === "map"}
            onClick={() => onModeChange("map")}
            icon={<Map className="h-3.5 w-3.5" strokeWidth={2.4} />}
            label="Map"
          />
          <PillButton
            active={mode === "degrees"}
            onClick={() => onModeChange("degrees")}
            icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />}
            label="6 Degrees"
          />
        </div>

        <a
          href="https://github.com/egil10/imdb"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-white/60 ring-1 ring-black/[0.04] text-ink-700 transition hover:bg-white"
        >
          <Github className="h-4 w-4" strokeWidth={2.2} />
        </a>
      </div>
    </header>
  );
}

function PillButton({
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
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
        active
          ? "bg-ink-900 text-white shadow-soft"
          : "text-ink-700 hover:bg-white/70",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
