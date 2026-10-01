import { MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH } from '../lib/errors';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Card, Priority } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { ConfirmAction } from './ConfirmAction';
import fields from './formFields.module.css';

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export interface CardFormValues {
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
  columnId?: string;
}

interface CardModalProps {
  initialValues?: Card;
  columns?: { id: string; name: string }[];
  currentColumnId?: string;
  onClose: () => void;
  onSave: (values: CardFormValues) => void;
  onDelete?: () => void;
}

const emptyValues: CardFormValues = {
  title: '',
  description: '',
  assignee: '',
  priority: 'Medium',
  dueDate: '',
};

export function CardModal({ initialValues, columns, currentColumnId, onClose, onSave, onDelete }: CardModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [values, setValues] = useState<CardFormValues>(
    initialValues
      ? {
          title: initialValues.title,
          description: initialValues.description ?? '',
          assignee: initialValues.assignee,
          priority: initialValues.priority,
          dueDate: initialValues.dueDate,
          columnId: currentColumnId,
        }
      : emptyValues,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) return;
    onSave({ ...values, title: values.title.trim() });
  };

  return (
    <Modal title="Card" onClose={onClose} maxWidth={512}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={fields.field}>
          <label className={fields.label} htmlFor="card-title">
            Name
          </label>
          <input
            id="card-title"
            maxLength={MAX_NAME_LENGTH}
            className={fields.input}
            placeholder="Enter card name..."
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            autoFocus
            required
          />
        </div>

        <div className={fields.field}>
          <label className={fields.labelMuted} htmlFor="card-description">
            Description
          </label>
          <textarea
            id="card-description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            className={fields.textarea}
            placeholder="Add a description..."
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </div>

        <div className={fields.field}>
          <label className={fields.labelMuted} htmlFor="card-assignee">
            Assignee
          </label>
          <input
            id="card-assignee"
            maxLength={MAX_NAME_LENGTH}
            className={fields.input}
            placeholder="Who's this for?"
            value={values.assignee}
            onChange={(e) => setValues((v) => ({ ...v, assignee: e.target.value }))}
          />
        </div>

        {columns && columns.length > 0 && (
          <div className={fields.field}>
            <label className={fields.labelMuted} htmlFor="card-column">
              Column
            </label>
            <select
              id="card-column"
              className={fields.select}
              value={values.columnId}
              onChange={(e) => setValues((v) => ({ ...v, columnId: e.target.value }))}
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={fields.row}>
          <div className={fields.field}>
            <label className={fields.labelMuted} htmlFor="card-priority">
              Priority
            </label>
            <select
              id="card-priority"
              className={fields.select}
              value={values.priority}
              onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value as Priority }))}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div className={fields.field}>
            <label className={fields.labelMuted} htmlFor="card-due-date">
              Due Date
            </label>
            <input
              id="card-due-date"
              className={fields.input}
              type="date"
              value={values.dueDate}
              onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
            />
          </div>
        </div>

        <div className={fields.actionsSplit}>
          {onDelete ? (
            <ConfirmAction
              label="Delete card"
              message="Delete this card?"
              onConfirm={onDelete}
              onConfirmingChange={setConfirmingDelete}
            />
          ) : (
            <span />
          )}
          {!confirmingDelete && (
            <div className={fields.actions}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
