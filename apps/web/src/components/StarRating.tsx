import { useState } from 'react';

interface Props {
  value: number;        // current rating (0 = none)
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ value, max = 5, size = 16, interactive = false, onChange }: Props) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <span
      className="star-rating"
      style={{ display: 'inline-flex', gap: 1 }}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= active;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'var(--gold-500, #f59e0b)' : 'none'}
            stroke={filled ? 'var(--gold-500, #f59e0b)' : 'var(--gray-300)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0, transition: 'fill 0.1s, stroke 0.1s' }}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}
