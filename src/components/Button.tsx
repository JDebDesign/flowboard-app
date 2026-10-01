import type { ComponentPropsWithRef, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger-text' | 'ghost-muted';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  accent: styles.accent,
  secondary: styles.secondary,
  'danger-text': styles.dangerText,
  'ghost-muted': styles.ghostMuted,
};

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  const classes = [styles.button, variantClass[variant], className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
