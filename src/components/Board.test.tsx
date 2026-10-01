import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Board } from './Board';
import { useData } from '../context/useData';
import { makeBoard, makeState } from '../test/fixtures';

vi.mock('../context/useData');

function setup(overrides: Record<string, unknown> = {}) {
  const state = makeState();
  const data = {
    state,
    getBoard: (id: string) => state.boards.find((b) => b.id === id),
    addCard: vi.fn().mockResolvedValue(undefined),
    updateCard: vi.fn().mockResolvedValue(undefined),
    deleteCard: vi.fn().mockResolvedValue(undefined),
    moveCard: vi.fn().mockResolvedValue(undefined),
    renameBoard: vi.fn().mockResolvedValue(undefined),
    deleteBoard: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  vi.mocked(useData).mockReturnValue(data as never);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <MemoryRouter initialEntries={['/boards/b1']}>
      <Routes>
        <Route path="/boards" element={<p>boards list</p>} />
        <Route path="/boards/:id" element={<Board boardId={makeBoard().id} />} />
      </Routes>
    </MemoryRouter>,
  );
  return { ...data, user: userEvent.setup() };
}

const column = (name: string) => screen.getByRole('region', { name });

describe('Board – cards', () => {
  it('renders columns and cards', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Roadmap' })).toBeInTheDocument();
    expect(within(column('Backlog')).getByText('One')).toBeInTheDocument();
    expect(within(column('In Progress')).getByText('Three')).toBeInTheDocument();
  });

  it('creates a card in the clicked column', async () => {
    const { user, addCard } = setup();
    await user.click(within(column('Done')).getByRole('button', { name: 'Add card' }));
    await user.type(screen.getByLabelText('Name'), 'Fresh');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(addCard).toHaveBeenCalledWith('b1', 'col3', expect.objectContaining({ title: 'Fresh' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('edits a card without moving it when the column is unchanged', async () => {
    const { user, updateCard, moveCard } = setup();
    await user.click(screen.getByRole('button', { name: /One/ }));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'One edited');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(updateCard).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', title: 'One edited' }));
    expect(moveCard).not.toHaveBeenCalled();
  });

  it('REGRESSION: moves a card to another column from the edit dialog (no drag needed)', async () => {
    const { user, updateCard, moveCard } = setup();
    await user.click(screen.getByRole('button', { name: /One/ }));
    await user.selectOptions(screen.getByLabelText('Column'), 'col2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(updateCard).toHaveBeenCalled();
    // appended to the end of the target column (which has 1 card)
    expect(moveCard).toHaveBeenCalledWith('b1', 'c1', 'col2', 1);
  });

  it('REGRESSION: deleting a card needs confirmation', async () => {
    const { user, deleteCard } = setup();
    await user.click(screen.getByRole('button', { name: /Two/ }));
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(deleteCard).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(deleteCard).toHaveBeenCalledWith('b1', 'c2');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([
    ['save', 'addCard', 'Could not save the card.'],
    ['delete', 'deleteCard', 'Could not delete the card.'],
  ])('REGRESSION: shows a friendly alert when card %s fails', async (kind, fn, message) => {
    const { user } = setup({ [fn]: vi.fn().mockRejectedValue(new Error('relation "cards" violates rls')) });
    if (kind === 'save') {
      await user.click(within(column('Done')).getByRole('button', { name: 'Add card' }));
      await user.type(screen.getByLabelText('Name'), 'X');
      await user.click(screen.getByRole('button', { name: 'Save' }));
    } else {
      await user.click(screen.getByRole('button', { name: /One/ }));
      await user.click(screen.getByRole('button', { name: 'Delete card' }));
      await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    }
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText(/relation/)).toBeNull();
  });
});

describe('Board – rename and delete', () => {
  it('REGRESSION: renames with a trimmed value and returns focus to the Rename button', async () => {
    const { user, renameBoard } = setup();
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const input = screen.getByLabelText('Board name');
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, '  New name  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(renameBoard).toHaveBeenCalledWith('b1', 'New name');
    expect(screen.getByRole('button', { name: 'Rename' })).toHaveFocus();
  });

  it('skips the API when the name is unchanged', async () => {
    const { user, renameBoard } = setup();
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(renameBoard).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Board name')).toBeNull();
  });

  it('Escape cancels renaming', async () => {
    const { user, renameBoard } = setup();
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.type(screen.getByLabelText('Board name'), 'zzz{Escape}');
    expect(screen.queryByLabelText('Board name')).toBeNull();
    expect(renameBoard).not.toHaveBeenCalled();
  });

  it('shows an alert when rename fails and keeps the form open', async () => {
    const { user } = setup({ renameBoard: vi.fn().mockRejectedValue(new Error('x')) });
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.type(screen.getByLabelText('Board name'), '2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not rename the board.');
    expect(screen.getByLabelText('Board name')).toBeInTheDocument();
  });

  it('REGRESSION: deleting the board needs confirmation, then goes back to /boards', async () => {
    const { user, deleteBoard } = setup();
    await user.click(screen.getByRole('button', { name: 'Delete board' }));
    expect(deleteBoard).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Delete this board and all its cards?');
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(deleteBoard).toHaveBeenCalledWith('b1');
    expect(await screen.findByText('boards list')).toBeInTheDocument();
  });

  it('stays on the board with an alert when delete fails', async () => {
    const { user } = setup({ deleteBoard: vi.fn().mockRejectedValue(new Error('x')) });
    await user.click(screen.getByRole('button', { name: 'Delete board' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(await screen.findByText('Could not delete the board.')).toBeInTheDocument();
    expect(screen.queryByText('boards list')).toBeNull();
  });
});

describe('Board – missing', () => {
  it('shows a not-found message with a link back', () => {
    vi.mocked(useData).mockReturnValue({ getBoard: () => undefined, state: { boards: [], cards: {} } } as never);
    render(<MemoryRouter><Board boardId="nope" /></MemoryRouter>);
    expect(screen.getByText('Board not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to boards' })).toHaveAttribute('href', '/boards');
  });
});
