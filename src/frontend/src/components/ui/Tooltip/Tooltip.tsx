import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipVariant = 'default' | 'gold';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
}

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-dark-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-dark-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-dark-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-dark-700 border-y-transparent border-l-transparent',
};

const arrowGoldStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gold-600 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gold-600 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gold-600 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gold-600 border-y-transparent border-l-transparent',
};

const variantStyles: Record<TooltipVariant, string> = {
  default: 'bg-dark-700 border-dark-600 text-cream-200',
  gold: 'bg-gold-600 border-gold-500 text-dark-950',
};

const Tooltip = ({
  children,
  content,
  position = 'top',
  variant = 'default',
  delay = 200,
  disabled = false,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => {
      const element = triggerRef.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: position === 'top' ? rect.top : rect.bottom,
        });
        setIsVisible(true);
      }
    }, delay);
  }, [disabled, delay, position]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </span>
      {isVisible &&
        createPortal(
          <div
            className="fixed z-[100] pointer-events-none"
            style={{
              left: coords.x,
              top: position === 'top' ? coords.y - 8 : coords.y + 8,
              transform: 'translateX(-50%)',
            }}
          >
            <div className={`relative px-3 py-2 text-sm border rounded-md shadow-md whitespace-nowrap animate-fade-in ${variantStyles[variant]}`}>
              {content}
              <div
                className={`absolute border-[6px] ${variant === 'gold' ? arrowGoldStyles[position] : arrowStyles[position]}`}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip, type TooltipProps, type TooltipPosition, type TooltipVariant };
