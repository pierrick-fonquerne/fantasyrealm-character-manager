import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
  createContext,
  useContext,
} from 'react';

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger/Content must be used within an AccordionItem');
  }
  return context;
};

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  value: string;
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, type = 'single', defaultOpen = [], className = '', ...props }, ref) => {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

    const toggleItem = (value: string) => {
      if (type === 'single') {
        setOpenItems((prev) => (prev.includes(value) ? [] : [value]));
      } else {
        setOpenItems((prev) =>
          prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
      }
    };

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
        <div
          ref={ref}
          className={`border border-dark-600 rounded-lg overflow-hidden divide-y divide-dark-600 ${className}`}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, value, className = '', ...props }, ref) => {
    const { openItems } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, icon, className = '', ...props }, ref) => {
    const { toggleItem } = useAccordion();
    const { value, isOpen } = useAccordionItem();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => toggleItem(value)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between p-5 bg-dark-800 hover:bg-dark-700 transition-colors text-left ${className}`}
        {...props}
      >
        <span className="flex items-center gap-3 font-medium text-cream-100">
          {icon && <span className="text-gold-400">{icon}</span>}
          {children}
        </span>
        <svg
          className={`w-5 h-5 text-dark-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }
);

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isOpen } = useAccordionItem();

    return (
      <div
        ref={ref}
        className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        {...props}
      >
        <div className="overflow-hidden">
          <div className={`p-5 bg-dark-900/50 text-cream-300 leading-relaxed ${className}`}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
};
