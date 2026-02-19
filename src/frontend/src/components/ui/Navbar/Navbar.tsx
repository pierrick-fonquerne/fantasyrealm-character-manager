import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
}

interface NavbarBrandProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  href?: string;
}

interface NavbarContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  position?: 'left' | 'center' | 'right';
}

interface NavbarItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
}

interface NavbarLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  active?: boolean;
}

interface NavbarToggleProps extends HTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  onToggle?: () => void;
}

interface NavbarCollapseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  isOpen: boolean;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ children, sticky = false, transparent = false, className = '', ...props }, ref) => {
    const stickyStyles = sticky ? 'sticky top-0 z-40' : '';
    const bgStyles = transparent
      ? 'bg-transparent'
      : 'bg-dark-900/95 backdrop-blur-sm border-b border-dark-700';

    return (
      <nav
        ref={ref}
        className={`w-full px-4 lg:px-8 ${stickyStyles} ${bgStyles} ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          {children}
        </div>
      </nav>
    );
  }
);

const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ children, href, className = '', ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={`flex items-center gap-3 font-display text-xl font-semibold text-gold-400 ${className}`}
        {...props}
      >
        {children}
      </div>
    );

    if (href) {
      return (
        <a href={href} className="hover:opacity-90 transition-opacity">
          {content}
        </a>
      );
    }

    return content;
  }
);

const NavbarContent = forwardRef<HTMLDivElement, NavbarContentProps>(
  ({ children, position = 'left', className = '', ...props }, ref) => {
    const positionStyles = {
      left: 'justify-start',
      center: 'justify-center flex-1',
      right: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={`hidden md:flex items-center gap-1 ${positionStyles[position]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
  ({ children, active = false, className = '', ...props }, ref) => {
    const activeStyles = active ? 'text-gold-400' : 'text-cream-300';

    return (
      <div
        ref={ref}
        className={`flex items-center ${activeStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  ({ children, href, active = false, className = '', ...props }, ref) => {
    const baseStyles =
      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
    const activeStyles = active
      ? 'text-gold-400 bg-dark-800'
      : 'text-cream-300 hover:text-cream-100 hover:bg-dark-800';

    return (
      <a
        ref={ref}
        href={href}
        className={`${baseStyles} ${activeStyles} ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  }
);

const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(
  ({ isOpen = false, onToggle, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        className={`md:hidden p-2 rounded-lg text-cream-300 hover:text-cream-100 hover:bg-dark-800 transition-colors ${className}`}
        {...props}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
    );
  }
);

const NavbarCollapse = forwardRef<HTMLDivElement, NavbarCollapseProps>(
  ({ children, isOpen, className = '', ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={`md:hidden absolute top-16 left-0 right-0 bg-dark-900 border-b border-dark-700 p-4 animate-slide-down ${className}`}
        {...props}
      >
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    );
  }
);

Navbar.displayName = 'Navbar';
NavbarBrand.displayName = 'NavbarBrand';
NavbarContent.displayName = 'NavbarContent';
NavbarItem.displayName = 'NavbarItem';
NavbarLink.displayName = 'NavbarLink';
NavbarToggle.displayName = 'NavbarToggle';
NavbarCollapse.displayName = 'NavbarCollapse';

export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarToggle,
  NavbarCollapse,
  type NavbarProps,
  type NavbarBrandProps,
  type NavbarContentProps,
  type NavbarItemProps,
  type NavbarLinkProps,
  type NavbarToggleProps,
  type NavbarCollapseProps,
};
