import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useCallback,
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

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
}: ModalProps) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

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
    >
      <div
        className={`w-full ${sizeStyles[size]} bg-dark-800 border border-dark-600 rounded-xl shadow-xl animate-scale-in`}
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
        <h3 className="font-display text-xl text-gold-400">{children}</h3>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dark-200 hover:text-cream-200 hover:bg-dark-700 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

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
