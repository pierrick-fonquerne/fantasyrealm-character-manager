import type { ReactNode } from 'react';

interface IconProps {
  children: ReactNode;
  className?: string;
  fill?: string;
}

export function Icon({ children, className = 'w-4 h-4', fill = 'none' }: IconProps) {
  return (
    <svg
      className={className}
      fill={fill}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
