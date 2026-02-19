import {
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
  forwardRef,
  useState,
  useId,
  useRef,
  createContext,
  useContext,
} from 'react';

type TabsVariant = 'default' | 'pills';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs');
  }
  return context;
};

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  defaultTab: string;
  variant?: TabsVariant;
  onTabChange?: (tab: string) => void;
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  'aria-label'?: string;
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  value: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  value: string;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, defaultTab, variant = 'default', onTabChange, className = '', ...props }, ref) => {
    const [activeTab, setActiveTabState] = useState(defaultTab);
    const baseId = useId();

    const setActiveTab = (tab: string) => {
      setActiveTabState(tab);
      onTabChange?.(tab);
    };

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab, variant, baseId }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = '', ...props }, ref) => {
    const { variant } = useTabs();
    const listRef = useRef<HTMLDivElement>(null);

    const baseStyles = variant === 'pills'
      ? 'inline-flex gap-1 p-1 bg-dark-900 rounded-lg'
      : 'flex gap-1 border-b border-dark-600';

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const container = listRef.current ?? (ref as React.RefObject<HTMLDivElement>)?.current;
      if (!container) return;

      const tabs = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    };

    return (
      <div
        ref={listRef}
        role="tablist"
        className={`${baseStyles} ${className}`}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ children, value, icon, badge, disabled = false, className = '', ...props }, ref) => {
    const { activeTab, setActiveTab, variant, baseId } = useTabs();
    const isActive = activeTab === value;

    const tabId = `tab-${baseId}-${value}`;
    const panelId = `panel-${baseId}-${value}`;

    const baseStyles = 'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200';

    const variantStyles = variant === 'pills'
      ? isActive
        ? 'bg-gold-500 text-dark-950 rounded-md'
        : 'text-cream-300 hover:text-cream-100 hover:bg-dark-800 rounded-md'
      : isActive
        ? 'text-gold-400 border-b-2 border-gold-500 -mb-px'
        : 'text-dark-100 hover:text-cream-200 border-b-2 border-transparent -mb-px';

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={tabId}
        aria-selected={isActive}
        aria-controls={panelId}
        aria-disabled={disabled}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && setActiveTab(value)}
        className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
        {...props}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
        {badge && <span className="ml-1">{badge}</span>}
      </button>
    );
  }
);

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ children, value, className = '', ...props }, ref) => {
    const { activeTab, baseId } = useTabs();

    const tabId = `tab-${baseId}-${value}`;
    const panelId = `panel-${baseId}-${value}`;

    if (activeTab !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        className={`pt-4 animate-fade-in ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
Tab.displayName = 'Tab';
TabsPanel.displayName = 'TabsPanel';

export {
  Tabs,
  TabsList,
  Tab,
  TabsPanel,
  type TabsProps,
  type TabsListProps,
  type TabProps,
  type TabsPanelProps,
  type TabsVariant,
};
