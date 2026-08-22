import type { TankCategory, TankShape } from "@/types/tank";

interface Props {
  shape: TankShape | null;
  category: TankCategory;
  size?: number;
}

function Frame({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="2" fill={fill} stroke="#475569" strokeWidth="1.5" />
  );
}

export default function TankIcon({ shape, category, size = 40 }: Props) {
  const body = (() => {
    switch (shape) {
      case "cube_aquarium":
        return (
          <g>
            <Frame x={8} y={8} w={32} h={32} fill="#e0f2fe" />
            <rect x={8} y={22} width={32} height={18} fill="#38bdf8" opacity="0.6" />
          </g>
        );
      case "high_aquarium":
        return (
          <g>
            <Frame x={14} y={4} w={20} h={40} fill="#e0f2fe" />
            <rect x={14} y={16} width={20} height={28} fill="#38bdf8" opacity="0.6" />
          </g>
        );
      case "low_aquarium":
        return (
          <g>
            <Frame x={4} y={16} w={40} h={20} fill="#e0f2fe" />
            <rect x={4} y={24} width={40} height={12} fill="#38bdf8" opacity="0.6" />
          </g>
        );
      case "reptile_cage_horizontal":
        return (
          <g>
            <Frame x={4} y={12} w={40} h={26} fill="#fef3c7" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={4 + i * 8} y1={12} x2={4 + i * 8} y2={38} stroke="#92400e" strokeWidth="1" />
            ))}
          </g>
        );
      case "reptile_cage_vertical":
        return (
          <g>
            <Frame x={12} y={4} w={26} h={40} fill="#fef3c7" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={12} y1={4 + i * 8} x2={38} y2={4 + i * 8} stroke="#92400e" strokeWidth="1" />
            ))}
          </g>
        );
      case "reptile_acrylic_cage":
        return (
          <g>
            <Frame x={8} y={8} w={32} h={32} fill="#f1f5f9" />
            <rect x={12} y={12} width={10} height={10} fill="#ffffff" opacity="0.7" />
          </g>
        );
      case "insect_cage":
        return (
          <g>
            <ellipse cx="24" cy="26" rx="16" ry="14" fill="#dcfce7" stroke="#166534" strokeWidth="1.5" />
            <path d="M12 26 A12 14 0 0 1 36 26" fill="none" stroke="#166534" strokeWidth="1" />
            <rect x="20" y="8" width="8" height="6" rx="1" fill="#a3a3a3" />
          </g>
        );
      default:
        return null;
    }
  })();

  if (body) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-hidden>
        {body}
      </svg>
    );
  }

  const fallback: Record<TankCategory, React.ReactNode> = {
    aquarium: (
      <g>
        <Frame x={4} y={14} w={40} h={22} fill="#e0f2fe" />
        <rect x={4} y={24} width={40} height={12} fill="#38bdf8" opacity="0.6" />
      </g>
    ),
    cage: (
      <g>
        <Frame x={6} y={8} w={36} h={32} fill="#fef3c7" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={6 + i * 12} y1={8} x2={6 + i * 12} y2={40} stroke="#92400e" strokeWidth="1" />
        ))}
      </g>
    ),
    terrarium: (
      <g>
        <Frame x={6} y={10} w={36} h={30} fill="#dcfce7" />
        <path d="M24 34 L24 20 M18 24 L24 20 L30 22" stroke="#166534" strokeWidth="2" fill="none" />
      </g>
    ),
    other: (
      <g>
        <Frame x={8} y={8} w={32} h={32} fill="#f1f5f9" />
        <text x="24" y="30" fontSize="16" textAnchor="middle" fill="#64748b">
          ?
        </text>
      </g>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-hidden>
      {fallback[category]}
    </svg>
  );
}
