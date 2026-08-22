import type { CreatureCategory } from "@/types/creature";

interface Props {
  category: CreatureCategory;
  size?: number;
}

export default function CreatureIcon({ category, size = 40 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-hidden>
      {category === "fish" && (
        <g>
          <path
            d="M8 24 C8 16 18 12 28 16 L38 10 L36 24 L38 38 L28 32 C18 36 8 32 8 24 Z"
            fill="#38bdf8"
          />
          <circle cx="16" cy="21" r="2" fill="#0c4a6e" />
        </g>
      )}

      {category === "reptile" && (
        <g>
          <ellipse cx="20" cy="28" rx="14" ry="8" fill="#65a30d" />
          <circle cx="34" cy="22" r="7" fill="#65a30d" />
          <circle cx="37" cy="20" r="1.4" fill="#1a2e05" />
          <path d="M8 30 Q2 26 4 20" stroke="#65a30d" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}

      {category === "insect" && (
        <g>
          <ellipse cx="24" cy="26" rx="7" ry="12" fill="#78350f" />
          <circle cx="24" cy="12" r="5" fill="#78350f" />
          <path d="M12 16 L20 22 M36 16 L28 22" stroke="#451a03" strokeWidth="2" />
          <path d="M10 26 L18 26 M38 26 L30 26 M10 34 L18 32 M38 34 L30 32" stroke="#451a03" strokeWidth="2" />
        </g>
      )}

      {category === "other" && (
        <g>
          <circle cx="24" cy="24" r="16" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          <text x="24" y="30" fontSize="16" textAnchor="middle" fill="#64748b">
            ?
          </text>
        </g>
      )}
    </svg>
  );
}
