type Status = "good" | "watch" | "alert";

const STYLES: Record<Status, { fill: string; stroke: string; label: string }> = {
  good: { fill: "#10b981", stroke: "#047857", label: "良好" },
  watch: { fill: "#f59e0b", stroke: "#b45309", label: "要観察" },
  alert: { fill: "#ef4444", stroke: "#b91c1c", label: "要注意" },
};

const MOUTHS: Record<Status, string> = {
  good: "M32 62 Q48 78 64 62",
  watch: "M32 66 Q48 66 64 66",
  alert: "M32 68 Q48 54 64 68",
};

interface Props {
  status: Status;
  size?: number;
  showLabel?: boolean;
}

export default function StatusFace({ status, size = 56, showLabel = true }: Props) {
  const style = STYLES[status];
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        role="img"
        aria-label={style.label}
      >
        <circle cx="48" cy="48" r="44" fill={style.fill} stroke={style.stroke} strokeWidth="3" />
        <circle cx="34" cy="40" r="5" fill={style.stroke} />
        <circle cx="62" cy="40" r="5" fill={style.stroke} />
        <path
          d={MOUTHS[status]}
          fill="none"
          stroke={style.stroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color: style.stroke }}>
          {style.label}
        </span>
      )}
    </div>
  );
}
