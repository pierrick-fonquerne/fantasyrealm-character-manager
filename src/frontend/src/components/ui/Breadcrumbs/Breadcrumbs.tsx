import { type HTMLAttributes, type ReactNode, forwardRef, Children } from 'react';

interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  separator?: ReactNode;
}

interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  href?: string;
  active?: boolean;
  icon?: ReactNode;
}

const defaultSeparator = (
  <svg
    className="w-4 h-4 text-dark-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ children, separator = defaultSeparator, className = '', ...props }, ref) => {
    const items = Children.toArray(children);

    return (
      <nav ref={ref} aria-label="Fil d'Ariane" className={className} {...props}>
        <ol className="flex items-center gap-2 text-sm">
          {items.map((child, index) => (
            <li key={index} className="flex items-center gap-2">
              {child}
              {index < items.length - 1 && (
                <span aria-hidden="true">{separator}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, href, active = false, icon, className = '', ...props }, ref) => {
    const baseStyles = 'flex items-center gap-1.5 transition-colors';
    const activeStyles = active
      ? 'text-cream-200 font-medium'
      : 'text-dark-200 hover:text-cream-300';

    const content = (
      <>
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </>
    );

    if (href && !active) {
      return (
        <span ref={ref} className={className} {...props}>
          <a
            href={href}
            className={`${baseStyles} ${activeStyles}`}
            aria-current={active ? 'page' : undefined}
          >
            {content}
          </a>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${activeStyles} ${className}`}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        {content}
      </span>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
BreadcrumbItem.displayName = 'BreadcrumbItem';

export {
  Breadcrumbs,
  BreadcrumbItem,
  type BreadcrumbsProps,
  type BreadcrumbItemProps,
};
