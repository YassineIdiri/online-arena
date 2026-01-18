type CellType = "player" | "car" | "drone" | "trap" | "tree" | "-";

const icons: Record<CellType, string> = {
  player: "📍",
  car: "🚗",
  drone: "🚁",
  trap: "🌪️",
  tree: "🌳",
  "-": "",
};

export default function Cell({ type }: { type: CellType }) {
  return (
    <div
      className={[
        "grid place-items-center select-none",
        "h-12 w-12 sm:h-14 sm:w-14",
        "border border-white/15 bg-slate-900/60",
        "text-2xl sm:text-[28px]",
        "transition-transform hover:scale-[1.06]",
      ].join(" ")}
    >
      {icons[type]}
    </div>
  );
}

export type { CellType };
