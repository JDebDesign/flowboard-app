import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { Column } from './Column';
import { makeCard } from '../test/fixtures';

const column = { id: 'col1', name: 'Backlog', cardIds: ['c1', 'c2'] };
const cards = [makeCard({ id: 'c1', title: 'One' }), makeCard({ id: 'c2', title: 'Two' })];

function setup(cardList = cards) {
  const props = {
    onAddCard: vi.fn(),
    onCardClick: vi.fn(),
    onDropCard: vi.fn(),
    onDragStartCard: vi.fn(),
    onDragEndCard: vi.fn(),
  };
  render(<Column column={column} cards={cardList} draggingCardId={null} {...props} />);
  return props;
}

// jsdom has no DragEvent, so clientY must be attached by hand.
function drop(el: Element, dt: object, clientY = 0) {
  const event = createEvent.drop(el, { dataTransfer: dt });
  Object.defineProperty(event, 'clientY', { value: clientY });
  fireEvent(el, event);
}

const dataTransfer = (payload?: object) => ({
  getData: () => (payload ? JSON.stringify(payload) : ''),
  setData: vi.fn(),
  effectAllowed: '',
});

describe('Column', () => {
  it('is a labelled region with a card count', () => {
    setup();
    expect(screen.getByRole('region', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByText('cards')).toBeInTheDocument();
  });

  it('shows an empty drop zone when there are no cards', () => {
    setup([]);
    expect(screen.getByText('Drop a card here or add one below')).toBeInTheDocument();
  });

  it('opens a card and adds a card via callbacks', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: /Two/ }));
    expect(p.onCardClick).toHaveBeenCalledWith('c2');
    fireEvent.click(screen.getByRole('button', { name: 'Add card' }));
    expect(p.onAddCard).toHaveBeenCalled();
  });

  it('starts a drag with the card payload', () => {
    const p = setup();
    const dt = dataTransfer();
    fireEvent.dragStart(screen.getByRole('button', { name: /One/ }), { dataTransfer: dt });
    expect(dt.setData).toHaveBeenCalledWith('application/json', JSON.stringify({ cardId: 'c1', fromColumnId: 'col1' }));
    expect(p.onDragStartCard).toHaveBeenCalledWith({ cardId: 'c1', fromColumnId: 'col1' });
  });

  it('drops a card at the index computed from the pointer position', () => {
    const p = setup();
    const items = document.querySelectorAll('[data-card-index]');
    items.forEach((el, i) => {
      el.getBoundingClientRect = () => ({ top: i * 100, height: 100 }) as DOMRect;
    });
    const payload = { cardId: 'x', fromColumnId: 'other' };
    const section = screen.getByRole('region');
    drop(section, dataTransfer(payload), 120);
    expect(p.onDropCard).toHaveBeenLastCalledWith(payload, 'col1', 1);
    drop(section, dataTransfer(payload), 10);
    expect(p.onDropCard).toHaveBeenLastCalledWith(payload, 'col1', 0);
    drop(section, dataTransfer(payload), 999);
    expect(p.onDropCard).toHaveBeenLastCalledWith(payload, 'col1', 2);
  });

  it('ignores drops without a payload and allows dragover', () => {
    const p = setup();
    const section = screen.getByRole('region');
    fireEvent.drop(section, { dataTransfer: dataTransfer() });
    expect(p.onDropCard).not.toHaveBeenCalled();
    const over = createEvent.dragOver(section);
    fireEvent(section, over);
    expect(over.defaultPrevented).toBe(true);
  });
});
