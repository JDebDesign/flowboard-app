import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BoardsPage } from './BoardsPage';
import { useData } from '../context/useData';
import { useAuth } from '../context/useAuth';
import { makeBoard } from '../test/fixtures';

vi.mock('../context/useData');
vi.mock('../context/useAuth');

function setup(data: Record<string, unknown> = {}) {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(useAuth).mockReturnValue({ user: { email: 'a@b.co' }, signOut: vi.fn() } as never);
  const value = {
    state: { boards: [], cards: {} },
    loading: false,
    error: null,
    createBoard: vi.fn().mockResolvedValue({ id: 'new1' }),
    ...data,
  };
  vi.mocked(useData).mockReturnValue(value as never);
  render(
    <MemoryRouter initialEntries={['/boards']}>
      <Routes>
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<p>board page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return { ...value, user: userEvent.setup() };
}

describe('BoardsPage', () => {
  it('shows loading, empty, error and list states', () => {
    setup({ loading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading boards…');
  });

  it('shows the empty state', () => {
    setup();
    expect(screen.getByText(/No boards yet/)).toBeInTheDocument();
  });

  it('shows an error alert', () => {
    setup({ error: 'Could not load your boards. Please refresh and try again.' });
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your boards");
  });

  it('lists boards as links', () => {
    setup({ state: { boards: [makeBoard()], cards: {} } });
    expect(screen.getByRole('link', { name: /Roadmap/ })).toHaveAttribute('href', '/boards/b1');
  });

  it('creates a board and navigates to it', async () => {
    const { user, createBoard } = setup();
    await user.click(screen.getByRole('button', { name: 'New Board' }));
    await user.type(screen.getByLabelText('Board name'), '  Plans ');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(createBoard).toHaveBeenCalledWith('Plans');
    expect(await screen.findByText('board page')).toBeInTheDocument();
  });

  it('REGRESSION: a failed create shows a friendly error inside the modal and keeps it open', async () => {
    const { user } = setup({ createBoard: vi.fn().mockRejectedValue(new Error('violates foreign key constraint')) });
    await user.click(screen.getByRole('button', { name: 'New Board' }));
    await user.type(screen.getByLabelText('Board name'), 'Plans');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not create the board.');
    expect(screen.getByLabelText('Board name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
