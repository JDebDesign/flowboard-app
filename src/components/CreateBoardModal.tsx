import { MAX_NAME_LENGTH } from '../lib/errors';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import fields from './formFields.module.css';

interface CreateBoardModalProps {
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
  error?: string | null;
}

export function CreateBoardModal({ onClose, onCreate, error }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onCreate(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create board" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className={fields.field}>
          <label className={fields.label} htmlFor="board-name">
            Board name
          </label>
          <input
            id="board-name"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'board-name-error' : undefined}
            maxLength={MAX_NAME_LENGTH}
            className={fields.input}
            placeholder="e.g. Product Roadmap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          {error && (
            <span id="board-name-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: 14 }}>
              {error}
            </span>
          )}
        </div>
        <div className={fields.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
