import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
};

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'left' | 'right';
}

interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

type DropdownDividerProps = HTMLAttributes<HTMLDivElement>;

interface DropdownHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className = '', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const close = () => setIsOpen(false);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    return (
      <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
        <div
          ref={dropdownRef || ref}
          className={`relative inline-block ${className}`}
          {...props}
        >
          {children}
        </div>
      </DropdownContext.Provider>
    );
  }
);

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isOpen, setIsOpen } = useDropdown();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, align = 'left', className = '', ...props }, ref) => {
    const { isOpen } = useDropdown();

    if (!isOpen) return null;

    const alignStyles = align === 'right' ? 'right-0' : 'left-0';

    return (
      <div
        ref={ref}
        className={`absolute top-full mt-2 ${alignStyles} min-w-[200px] bg-dark-800 border border-dark-600 rounded-lg shadow-lg py-2 z-50 animate-slide-down ${className}`}
        role="menu"
        {...props}
      >
        {children}
      </div>
    );
  }
);

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ children, icon, danger = false, disabled = false, className = '', onClick, ...props }, ref) => {
    const { close } = useDropdown();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onClick?.(e);
        close();
      }
    };

    const baseStyles =
      'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors';
    const colorStyles = danger
      ? 'text-error-500 hover:bg-error-500/10'
      : 'text-cream-200 hover:bg-dark-700';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
        className={`${baseStyles} ${colorStyles} ${disabledStyles} ${className}`}
        {...props}
      >
        {icon && <span className={`w-5 ${danger ? 'text-error-500' : 'text-gold-400'}`}>{icon}</span>}
        {children}
      </button>
    );
  }
);

const DropdownDivider = forwardRef<HTMLDivElement, DropdownDividerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`h-px bg-dark-600 my-2 ${className}`}
        role="separator"
        {...props}
      />
    );
  }
);

const DropdownHeader = forwardRef<HTMLDivElement, DropdownHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-4 py-2 text-xs font-semibold text-dark-200 uppercase tracking-wider ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
DropdownTrigger.displayName = 'DropdownTrigger';
DropdownMenu.displayName = 'DropdownMenu';
DropdownItem.displayName = 'DropdownItem';
DropdownDivider.displayName = 'DropdownDivider';
DropdownHeader.displayName = 'DropdownHeader';

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
  type DropdownProps,
  type DropdownTriggerProps,
  type DropdownMenuProps,
  type DropdownItemProps,
  type DropdownDividerProps,
  type DropdownHeaderProps,
};
