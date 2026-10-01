import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from './Button';
import styles from './ConfirmAction.module.css';

interface ConfirmActionProps {
  label: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  onConfirmingChange?: (confirming: boolean) => void;
}

export function ConfirmAction({
  label,
  message,
  confirmLabel = 'Yes, delete',
  onConfirm,
  disabled,
  onConfirmingChange,
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const hasInteracted = useRef(false);

  // Move focus into the confirmation, and back to the trigger when it is dismissed.
  useEffect(() => {
    if (!hasInteracted.current) return;
    (confirming ? cancelRef : triggerRef).current?.focus();
  }, [confirming]);

  const updateConfirming = (next: boolean) => {
    hasInteracted.current = true;
    setConfirming(next);
    onConfirmingChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      // Dismiss only the confirmation, not an enclosing dialog.
      event.stopPropagation();
      updateConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <Button ref={triggerRef} type="button" variant="danger-text" onClick={() => updateConfirming(true)} disabled={disabled}>
        {label}
      </Button>
    );
  }

  return (
    // Escape handler lives on the wrapper only so it can be scoped to the confirmation; the buttons inside are the interactive elements.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div className={styles.confirming} role="group" aria-label={label} onKeyDown={handleKeyDown}>
      <span className={styles.message} role="alert">
        {message}
      </span>
      <Button ref={cancelRef} type="button" variant="secondary" onClick={() => updateConfirming(false)} disabled={disabled}>
        Cancel
      </Button>
      <Button type="button" variant="danger-text" onClick={onConfirm} disabled={disabled}>
        {confirmLabel}
      </Button>
    </div>
  );
}
