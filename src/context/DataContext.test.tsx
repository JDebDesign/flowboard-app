import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as api from '../lib/api';
import { DataProvider } from './DataContext';
import { useData } from './useData';
import { useAuth } from './useAuth';
import { makeCard, makeState } from '../test/fixtures';

vi.mock('../lib/api');
vi.mock('./useAuth');

const wrapper = ({ children }: { children: ReactNode }) => <DataProvider>{children}</DataProvider>;

function signedIn(userId: string | null = 'u1') {
  vi.mocked(useAuth).mockReturnValue({ user: userId ? { id: userId } : null } as never);
}

async function setup() {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  signedIn();
  vi.mocked(api.fetchAllData).mockResolvedValue(makeState());
  const hook = renderHook(() => useData(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

const colIds = (r: { current: ReturnType<typeof useData> }, col: string) =>
  r.current.getBoard('b1')!.columns.find((c) => c.id === col)!.cardIds;

describe('loading', () => {
  it('loads data for the signed-in user', async () => {
    const { result } = await setup();
    expect(api.fetchAllData).toHaveBeenCalledWith('u1');
    expect(result.current.state.boards).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('exposes a friendly error when loading fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    signedIn();
    vi.mocked(api.fetchAllData).mockRejectedValue(new Error('relation "boards" does not exist'));
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load your boards. Please refresh and try again.');
  });

  it('resets to empty state when signed out', async () => {
    signedIn(null);
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.state).toEqual({ boards: [], cards: {} });
    expect(api.fetchAllData).not.toHaveBeenCalled();
  });
});

describe('createBoard', () => {
  it('rejects when not signed in', async () => {
    signedIn(null);
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(result.current.createBoard('x')).rejects.toThrow('Not signed in');
  });
});

describe('addCard (create)', () => {
  it('appends the new card to the end of the column', async () => {
    const { result } = await setup();
    vi.mocked(api.addCard).mockResolvedValue(makeCard({ id: 'new', title: 'New' }));
    await act(() =>
      result.current.addCard('b1', 'col1', { title: 'New', assignee: '', priority: 'Medium', dueDate: '' }),
    );
    expect(api.addCard).toHaveBeenCalledWith('col1', 2, expect.objectContaining({ title: 'New' }));
    expect(colIds(result, 'col1')).toEqual(['c1', 'c2', 'new']);
    expect(result.current.state.cards.new.title).toBe('New');
  });

  it('leaves state unchanged when the API rejects', async () => {
    const { result } = await setup();
    vi.mocked(api.addCard).mockRejectedValue(new Error('fail'));
    await act(async () => {
      await expect(
        result.current.addCard('b1', 'col1', { title: 'N', assignee: '', priority: 'Low', dueDate: '' }),
      ).rejects.toThrow('fail');
    });
    expect(colIds(result, 'col1')).toEqual(['c1', 'c2']);
  });
});

describe('updateCard (edit)', () => {
  it('saves and updates local state', async () => {
    const { result } = await setup();
    vi.mocked(api.updateCard).mockResolvedValue();
    const edited = makeCard({ id: 'c1', title: 'Edited' });
    await act(() => result.current.updateCard(edited));
    expect(api.updateCard).toHaveBeenCalledWith(edited);
    expect(result.current.state.cards.c1.title).toBe('Edited');
  });

  it('keeps the old card when the API rejects', async () => {
    const { result } = await setup();
    vi.mocked(api.updateCard).mockRejectedValue(new Error('fail'));
    await act(async () => {
      await expect(result.current.updateCard(makeCard({ id: 'c1', title: 'Edited' }))).rejects.toThrow();
    });
    expect(result.current.state.cards.c1.title).toBe('One');
  });
});

describe('deleteCard', () => {
  it('removes the card from its column and from the card map', async () => {
    const { result } = await setup();
    vi.mocked(api.deleteCard).mockResolvedValue();
    await act(() => result.current.deleteCard('b1', 'c1'));
    expect(api.deleteCard).toHaveBeenCalledWith('c1');
    expect(colIds(result, 'col1')).toEqual(['c2']);
    expect(result.current.state.cards.c1).toBeUndefined();
  });

  it('keeps the card when the API rejects', async () => {
    const { result } = await setup();
    vi.mocked(api.deleteCard).mockRejectedValue(new Error('fail'));
    await act(async () => {
      await expect(result.current.deleteCard('b1', 'c1')).rejects.toThrow();
    });
    expect(colIds(result, 'col1')).toContain('c1');
  });
});

describe('moveCard', () => {
  beforeEach(() => {
    vi.mocked(api.reorderCards).mockResolvedValue();
  });

  it('reorders within a column and persists only that column', async () => {
    const { result } = await setup();
    await act(() => result.current.moveCard('b1', 'c1', 'col1', 1));
    expect(colIds(result, 'col1')).toEqual(['c2', 'c1']);
    expect(api.reorderCards).toHaveBeenCalledWith([{ columnId: 'col1', cardIds: ['c2', 'c1'] }]);
  });

  it('moves across columns and persists both affected columns', async () => {
    const { result } = await setup();
    await act(() => result.current.moveCard('b1', 'c1', 'col2', 0));
    expect(colIds(result, 'col1')).toEqual(['c2']);
    expect(colIds(result, 'col2')).toEqual(['c1', 'c3']);
    expect(api.reorderCards).toHaveBeenCalledWith([
      { columnId: 'col1', cardIds: ['c2'] },
      { columnId: 'col2', cardIds: ['c1', 'c3'] },
    ]);
  });

  it('moves into an empty column', async () => {
    const { result } = await setup();
    await act(() => result.current.moveCard('b1', 'c3', 'col3', 0));
    expect(colIds(result, 'col3')).toEqual(['c3']);
    expect(colIds(result, 'col2')).toEqual([]);
  });

  it('clamps an out-of-range index to the end', async () => {
    const { result } = await setup();
    await act(() => result.current.moveCard('b1', 'c1', 'col2', 99));
    expect(colIds(result, 'col2')).toEqual(['c3', 'c1']);
    await act(() => result.current.moveCard('b1', 'c3', 'col1', -5));
    expect(colIds(result, 'col1')[0]).toBe('c3');
  });

  it('does nothing for an unknown board or column', async () => {
    const { result } = await setup();
    await act(() => result.current.moveCard('nope', 'c1', 'col2', 0));
    await act(() => result.current.moveCard('b1', 'c1', 'nope', 0));
    expect(api.reorderCards).not.toHaveBeenCalled();
    expect(colIds(result, 'col1')).toEqual(['c1', 'c2']);
  });

  it('leaves state unchanged when persisting fails', async () => {
    const { result } = await setup();
    vi.mocked(api.reorderCards).mockRejectedValue(new Error('fail'));
    await act(async () => {
      await expect(result.current.moveCard('b1', 'c1', 'col2', 0)).rejects.toThrow();
    });
    expect(colIds(result, 'col1')).toEqual(['c1', 'c2']);
  });
});

describe('boards', () => {
  it('renames and deletes only after the API succeeds', async () => {
    const { result } = await setup();
    vi.mocked(api.renameBoard).mockResolvedValue();
    vi.mocked(api.deleteBoard).mockResolvedValue();
    await act(() => result.current.renameBoard('b1', 'Renamed'));
    expect(result.current.getBoard('b1')!.name).toBe('Renamed');
    await act(() => result.current.deleteBoard('b1'));
    expect(result.current.getBoard('b1')).toBeUndefined();
  });

  it('keeps the old name when rename fails', async () => {
    const { result } = await setup();
    vi.mocked(api.renameBoard).mockRejectedValue(new Error('fail'));
    await act(async () => {
      await expect(result.current.renameBoard('b1', 'X')).rejects.toThrow();
    });
    expect(result.current.getBoard('b1')!.name).toBe('Roadmap');
  });
});
