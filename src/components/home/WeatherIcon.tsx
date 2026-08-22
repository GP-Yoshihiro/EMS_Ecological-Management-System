import type { WeatherIconKind } from "@/lib/weather-codes";

interface Props {
  kind: WeatherIconKind;
  size?: number;
}

export default function WeatherIcon({ kind, size = 40 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={kind}>
      {kind === "sunny" && (
        <g>
          <circle cx="24" cy="24" r="10" fill="#f59e0b" />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * Math.PI) / 4;
            const x1 = 24 + Math.cos(angle) * 15;
            const y1 = 24 + Math.sin(angle) * 15;
            const x2 = 24 + Math.cos(angle) * 21;
            const y2 = 24 + Math.sin(angle) * 21;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {kind === "cloudy" && (
        <g>
          <circle cx="24" cy="10" r="8" fill="#fbbf24" opacity="0.6" />
          <ellipse cx="20" cy="28" rx="14" ry="10" fill="#cbd5e1" />
          <ellipse cx="30" cy="24" rx="10" ry="9" fill="#e2e8f0" />
        </g>
      )}

      {kind === "rain" && (
        <g>
          <ellipse cx="20" cy="18" rx="13" ry="9" fill="#cbd5e1" />
          <ellipse cx="30" cy="15" rx="9" ry="8" fill="#e2e8f0" />
          {[16, 24, 32].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="30"
              x2={x - 3}
              y2="40"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      {kind === "heavy-rain" && (
        <g>
          <ellipse cx="20" cy="16" rx="13" ry="9" fill="#94a3b8" />
          <ellipse cx="30" cy="13" rx="9" ry="8" fill="#cbd5e1" />
          {[13, 19, 25, 31, 37].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="28"
              x2={x - 4}
              y2="42"
              stroke="#0ea5e9"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      {kind === "snow" && (
        <g>
          <ellipse cx="20" cy="16" rx="13" ry="9" fill="#cbd5e1" />
          <ellipse cx="30" cy="13" rx="9" ry="8" fill="#e2e8f0" />
          {[16, 24, 32].map((x, i) => (
            <text key={i} x={x} y="40" fontSize="12" textAnchor="middle" fill="#38bdf8">
              ❄
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
