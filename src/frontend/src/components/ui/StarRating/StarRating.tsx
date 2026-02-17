import { useState } from 'react';

type StarRatingSize = 'sm' | 'md';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: StarRatingSize;
}

const sizeStyles: Record<StarRatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
};

function StarIcon({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;
  const starSize = sizeStyles[size];

  if (readonly) {
    return (
      <div
        className="inline-flex items-center gap-0.5"
        role="img"
        aria-label={`Note : ${value} sur 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            filled={star <= value}
            className={`${starSize} ${star <= value ? 'text-gold-500' : 'text-dark-600'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <fieldset className="inline-flex items-center gap-0.5 border-0 p-0 m-0">
      <legend className="sr-only">Note (1 à 5 étoiles)</legend>
      {[1, 2, 3, 4, 5].map((star) => (
        <label
          key={star}
          className="cursor-pointer"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          <input
            type="radio"
            name="star-rating"
            value={star}
            checked={value === star}
            onChange={() => onChange?.(star)}
            className="sr-only"
          />
          <StarIcon
            filled={star <= displayValue}
            className={`${starSize} transition-colors ${
              star <= displayValue ? 'text-gold-500' : 'text-dark-600'
            }`}
          />
        </label>
      ))}
    </fieldset>
  );
}

export { StarRating, type StarRatingProps, type StarRatingSize };
