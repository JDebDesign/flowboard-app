import { useId, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { Card as CardType, Column as ColumnType } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { PlusIcon, UploadIcon } from './icons';
import styles from './Column.module.css';

export interface DragPayload {
  cardId: string;
  fromColumnId: string;
}

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: () => void;
  onCardClick: (cardId: string) => void;
  onDropCard: (payload: DragPayload, toColumnId: string, toIndex: number) => void;
  draggingCardId: string | null;
  onDragStartCard: (payload: DragPayload) => void;
  onDragEndCard: () => void;
}

export function Column({
  column,
  cards,
  onAddCard,
  onCardClick,
  onDropCard,
  draggingCardId,
  onDragStartCard,
  onDragEndCard,
}: ColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const headingId = useId();

  const computeDropIndex = (clientY: number): number => {
    const container = listRef.current;
    if (!container) return cards.length;
    const cardEls = Array.from(container.querySelectorAll<HTMLElement>('[data-card-index]'));
    for (const el of cardEls) {
      const rect = el.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        return Number(el.dataset.cardIndex);
      }
    }
    return cards.length;
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
    const raw = event.dataTransfer.getData('application/json');
    if (!raw) return;
    const payload = JSON.parse(raw) as DragPayload;
    const index = computeDropIndex(event.clientY);
    onDropCard(payload, column.id, index);
  };

  return (
    // Drop target for mouse drag; keyboard users move cards via the Column select in the card dialog.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      aria-labelledby={headingId}
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <div className={styles.header}>
        <h2 id={headingId} className={styles.name}>
          {column.name}
        </h2>
        <span className={styles.count}>
          {cards.length}
          <span className="visually-hidden"> {cards.length === 1 ? 'card' : 'cards'}</span>
        </span>
      </div>
      {cards.length === 0 && (
        <div className={styles.emptyDropZone}>
          <UploadIcon size={24} />
          <span className={styles.emptyDropZoneText}>Drop a card here or add one below</span>
        </div>
      )}
      <ul className={styles.cardList} ref={listRef}>
        {cards.map((card, index) => (
            <li key={card.id} data-card-index={index} className={styles.cardItem}>
              <Card
                card={card}
                isDragging={draggingCardId === card.id}
                onClick={() => onCardClick(card.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({ cardId: card.id, fromColumnId: column.id }),
                  );
                  event.dataTransfer.effectAllowed = 'move';
                  onDragStartCard({ cardId: card.id, fromColumnId: column.id });
                }}
                onDragEnd={onDragEndCard}
              />
            </li>
        ))}
      </ul>
      <Button variant="ghost-muted" className={styles.addCard} icon={<PlusIcon size={16} />} onClick={onAddCard}>
        Add card
      </Button>
    </section>
  );
}
