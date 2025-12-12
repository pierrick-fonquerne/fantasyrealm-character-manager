import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'gold';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
type CardBodyProps = HTMLAttributes<HTMLDivElement>;
type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-dark-700 border border-dark-500',
  elevated: 'bg-dark-700 shadow-lg',
  outlined: 'bg-transparent border border-dark-400',
  gold: 'bg-dark-700 border border-gold-500/30 shadow-gold',
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'none',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg overflow-hidden transition-all duration-200';
    const hoverStyles = hoverable
      ? 'hover:border-gold-500/50 hover:shadow-gold cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-4 border-b border-dark-500 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-4 border-t border-dark-500 bg-dark-800/50 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
  type CardVariant,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
};
