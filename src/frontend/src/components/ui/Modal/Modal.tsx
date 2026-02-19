import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useCallback,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  showCloseButton?: boolean;
}

type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

type ModalFooterProps = HTMLAttributes<HTMLDivElement>;

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
}: ModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      if (!dialogRef.current) return;
      if (dialogRef.current.contains(document.activeElement)) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });

    return () => {
      document.body.style.overflow = '';
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen, handleEscape, handleFocusTrap]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className={`w-full ${sizeStyles[size]} bg-dark-800 border border-dark-600 rounded-xl shadow-xl animate-scale-in`}
        data-modal-title-id={titleId}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ onClose, showCloseButton = true, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between p-6 border-b border-dark-600 ${className}`}
        {...props}
      >
        <ModalTitle>{children}</ModalTitle>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dark-200 hover:text-cream-200 hover:bg-dark-700 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

function ModalTitle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const modal = ref.current?.closest('[data-modal-title-id]');
    if (modal instanceof HTMLElement) {
      const titleId = modal.dataset.modalTitleId;
      if (titleId && ref.current) {
        ref.current.id = titleId;
      }
    }
  }, []);

  return (
    <h3 ref={ref} className="font-display text-xl text-gold-400">
      {children}
    </h3>
  );
}

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 text-cream-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-end gap-3 p-4 bg-dark-900/50 border-t border-dark-600 rounded-b-xl ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';

export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  type ModalProps,
  type ModalSize,
  type ModalHeaderProps,
  type ModalBodyProps,
  type ModalFooterProps,
};
