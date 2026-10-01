import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardModal } from './CardModal';
import { makeCard } from '../test/fixtures';

const columns = [
  { id: 'col1', name: 'Backlog' },
  { id: 'col2', name: 'Done' },
];

describe('CardModal – create', () => {
  it('saves trimmed title with defaults', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CardModal onClose={vi.fn()} onSave={onSave} />);
    await user.type(screen.getByLabelText('Name'), '  Ship it  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Ship it', priority: 'Medium', description: '' }));
  });

  it('does not save a blank title', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CardModal onClose={vi.fn()} onSave={onSave} />);
    await user.type(screen.getByLabelText('Name'), '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('has no Column picker and no Delete when creating', () => {
    render(<CardModal onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByLabelText('Column')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete card' })).toBeNull();
  });

  it('limits field lengths', () => {
    render(<CardModal onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('maxlength', '100');
    expect(screen.getByLabelText('Assignee')).toHaveAttribute('maxlength', '100');
    expect(screen.getByLabelText('Description')).toHaveAttribute('maxlength', '5000');
  });
});

describe('CardModal – edit', () => {
  const renderEdit = (over = {}) => {
    const props = { onSave: vi.fn(), onDelete: vi.fn(), onClose: vi.fn() };
    render(
      <CardModal initialValues={makeCard()} columns={columns} currentColumnId="col1" {...props} {...over} />,
    );
    return { ...props, user: userEvent.setup() };
  };

  it('prefills values and the current column', () => {
    renderEdit();
    expect(screen.getByLabelText('Name')).toHaveValue('Write tests');
    expect(screen.getByLabelText('Column')).toHaveValue('col1');
  });

  it('REGRESSION: lets users move a card without dragging via the Column select', async () => {
    const { onSave, user } = renderEdit();
    await user.selectOptions(screen.getByLabelText('Column'), 'col2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ columnId: 'col2' }));
  });

  it('edits fields', async () => {
    const { onSave, user } = renderEdit();
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Renamed');
    await user.selectOptions(screen.getByLabelText('Priority'), 'High');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Renamed', priority: 'High' }));
  });

  it('REGRESSION: delete needs confirmation and hides Save/Cancel while confirming', async () => {
    const { onDelete, user } = renderEdit();
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('cancelling the delete confirmation restores Save', async () => {
    const { user } = renderEdit();
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
