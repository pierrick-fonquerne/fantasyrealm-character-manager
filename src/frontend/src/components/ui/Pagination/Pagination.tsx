import { type HTMLAttributes, forwardRef, useMemo } from 'react';

interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
}

const DOTS = '...';

const usePaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | string)[] => {
  return useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, DOTS, ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, DOTS, ...middleRange, DOTS, totalPages];
  }, [currentPage, totalPages, siblingCount]);
};

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onChange,
      siblingCount = 1,
      showFirstLast = true,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const paginationRange = usePaginationRange(currentPage, totalPages, siblingCount);

    if (totalPages <= 1) return null;

    const handlePrevious = () => {
      if (currentPage > 1 && !disabled) {
        onChange(currentPage - 1);
      }
    };

    const handleNext = () => {
      if (currentPage < totalPages && !disabled) {
        onChange(currentPage + 1);
      }
    };

    const handleFirst = () => {
      if (currentPage !== 1 && !disabled) {
        onChange(1);
      }
    };

    const handleLast = () => {
      if (currentPage !== totalPages && !disabled) {
        onChange(totalPages);
      }
    };

    const baseButtonStyles =
      'flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200';
    const activeStyles = 'bg-gold-500 text-dark-950';
    const inactiveStyles =
      'text-cream-300 hover:text-cream-100 hover:bg-dark-700 border border-dark-600';
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={`flex items-center gap-1 ${className}`}
        {...props}
      >
        {showFirstLast && (
          <button
            type="button"
            onClick={handleFirst}
            disabled={currentPage === 1 || disabled}
            aria-label="Première page"
            className={`${baseButtonStyles} ${inactiveStyles} ${
              currentPage === 1 || disabled ? disabledStyles : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1 || disabled}
          aria-label="Page précédente"
          className={`${baseButtonStyles} ${inactiveStyles} ${
            currentPage === 1 || disabled ? disabledStyles : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {paginationRange.map((page, index) => {
          if (page === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className="flex items-center justify-center w-10 h-10 text-dark-400"
              >
                {DOTS}
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => !disabled && onChange(pageNumber)}
              disabled={disabled}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
              className={`${baseButtonStyles} ${isActive ? activeStyles : inactiveStyles} ${
                disabled ? disabledStyles : ''
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages || disabled}
          aria-label="Page suivante"
          className={`${baseButtonStyles} ${inactiveStyles} ${
            currentPage === totalPages || disabled ? disabledStyles : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {showFirstLast && (
          <button
            type="button"
            onClick={handleLast}
            disabled={currentPage === totalPages || disabled}
            aria-label="Dernière page"
            className={`${baseButtonStyles} ${inactiveStyles} ${
              currentPage === totalPages || disabled ? disabledStyles : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination, type PaginationProps };
