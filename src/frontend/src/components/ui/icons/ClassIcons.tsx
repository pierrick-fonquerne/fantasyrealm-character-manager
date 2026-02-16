import type { ReactNode } from 'react';

export const CLASS_ICONS: Record<string, ReactNode> = {
  Guerrier: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L9 9H2l6 5-2 8 6-4 6 4-2-8 6-5h-7L12 2z" opacity="0.3" />
      <path d="M14.5 3.5L12 1 9.5 3.5 12 6l2.5-2.5zM6.5 9l-1 4h2l-1-4zm12 0l-1 4h2l-1-4zM12 8l-2 6h4l-2-6zm-1 8v5l1 2 1-2v-5h-2z" />
    </svg>
  ),
  Mage: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />
      <path d="M7 9l.5 2 2 .5-2 .5L7 14l-.5-2-2-.5 2-.5L7 9z" opacity="0.7" />
      <path d="M17 9l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" opacity="0.7" />
      <path d="M10 14h4l1 8H9l1-8z" opacity="0.5" />
      <path d="M11 15h2v7h-2z" />
    </svg>
  ),
  Archer: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 2v20l2-2 2 2 2-2 2 2V2L10 4 8 2 6 4 4 2z" opacity="0.3" />
      <path d="M20 12l-8-4v3H4v2h8v3l8-4z" />
      <path d="M3 8v8l1-1V9L3 8z" opacity="0.5" />
    </svg>
  ),
  Voleur: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L8 6l4 2 4-2-4-4z" opacity="0.3" />
      <path d="M9 8l-2 12h2l1-8 2 2 2-2 1 8h2L15 8l-3 2-3-2z" />
      <path d="M6 10l-2 4 3-1-1-3z" opacity="0.5" />
      <path d="M18 10l2 4-3-1 1-3z" opacity="0.5" />
    </svg>
  ),
};
