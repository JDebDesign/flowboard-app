import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import { makeCard } from '../test/fixtures';

const renderCard = (over = {}) =>
  render(<Card card={makeCard(over)} onClick={vi.fn()} onDragStart={vi.fn()} onDragEnd={vi.fn()} isDragging={false} />);

describe('Card', () => {
  it('shows title, priority, formatted due date and assignee with screen-reader labels', () => {
    renderCard({ priority: 'High', dueDate: '2026-10-05', assignee: 'jo' });
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Write tests');
    expect(btn).toHaveTextContent('Priority: High');
    expect(btn).toHaveTextContent('Due Oct 5');
    expect(btn).toHaveTextContent('Assignee: jo');
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('omits due date and assignee when empty', () => {
    renderCard({ dueDate: '', assignee: '' });
    expect(screen.queryByText(/Due/)).toBeNull();
    expect(screen.queryByText(/Assignee/)).toBeNull();
  });

  it('renders an unparseable due date as-is', () => {
    renderCard({ dueDate: 'soon' });
    expect(screen.getByRole('button')).toHaveTextContent('Due soon');
  });
});
