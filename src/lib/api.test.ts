import { supabase } from './supabaseClient';
import * as api from './api';

type Result = { data?: unknown; error?: unknown };

/** Chainable, awaitable stand-in for a Supabase query builder. Records every call. */
function builder(result: Result) {
  const calls: [string, unknown[]][] = [];
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'single']) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, args]);
      return b;
    };
  }
  b.then = (resolve: (r: Result) => unknown) => resolve({ data: null, error: null, ...result });
  return { b, calls };
}

function mockFrom(...results: Result[]) {
  const builders = results.map(builder);
  let i = 0;
  vi.mocked(supabase.from).mockImplementation(((table: string) => {
    const entry = builders[i++];
    entry.calls.unshift(['from', [table]]);
    return entry.b;
  }) as never);
  return builders.map((x) => x.calls);
}

const cardRow = {
  id: 'c1',
  column_id: 'col1',
  title: 'T',
  description: null,
  assignee: null,
  priority: 'Low',
  due_date: null,
  position: 0,
};

describe('addCard', () => {
  it('inserts the card with position and returns a mapped card', async () => {
    const [calls] = mockFrom({ data: cardRow });
    const card = await api.addCard('col1', 3, {
      title: 'T',
      description: '',
      assignee: '',
      priority: 'Low',
      dueDate: '',
    });
    expect(calls[0]).toEqual(['from', ['cards']]);
    expect(calls[1][0]).toBe('insert');
    expect(calls[1][1][0]).toEqual({
      column_id: 'col1',
      title: 'T',
      description: null,
      assignee: null,
      priority: 'Low',
      due_date: null,
      position: 3,
    });
    expect(card).toEqual({ id: 'c1', title: 'T', description: undefined, assignee: '', priority: 'Low', dueDate: '' });
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ error: new Error('boom') });
    await expect(
      api.addCard('col1', 0, { title: 'T', assignee: '', priority: 'Low', dueDate: '' }),
    ).rejects.toThrow('boom');
  });
});

describe('updateCard', () => {
  it('updates editable fields only, by id', async () => {
    const [calls] = mockFrom({});
    await api.updateCard({ id: 'c1', title: 'New', description: '', assignee: 'Al', priority: 'High', dueDate: '2026-01-02' });
    expect(calls).toContainEqual([
      'update',
      [{ title: 'New', description: null, assignee: 'Al', priority: 'High', due_date: '2026-01-02' }],
    ]);
    expect(calls).toContainEqual(['eq', ['id', 'c1']]);
  });

  it('throws on error', async () => {
    mockFrom({ error: new Error('nope') });
    await expect(
      api.updateCard({ id: 'c1', title: 'x', assignee: '', priority: 'Low', dueDate: '' }),
    ).rejects.toThrow('nope');
  });
});

describe('deleteCard', () => {
  it('deletes by id', async () => {
    const [calls] = mockFrom({});
    await api.deleteCard('c9');
    expect(calls).toEqual([['from', ['cards']], ['delete', []], ['eq', ['id', 'c9']]]);
  });

  it('throws on error', async () => {
    mockFrom({ error: new Error('x') });
    await expect(api.deleteCard('c9')).rejects.toThrow('x');
  });
});

describe('reorderCards', () => {
  it('issues one update per card with its new column and position', async () => {
    const calls = mockFrom({}, {}, {});
    await api.reorderCards([
      { columnId: 'colA', cardIds: ['a', 'b'] },
      { columnId: 'colB', cardIds: ['c'] },
    ]);
    expect(calls).toHaveLength(3);
    expect(calls[0]).toContainEqual(['update', [{ column_id: 'colA', position: 0 }]]);
    expect(calls[1]).toContainEqual(['update', [{ column_id: 'colA', position: 1 }]]);
    expect(calls[2]).toContainEqual(['update', [{ column_id: 'colB', position: 0 }]]);
    expect(calls[2]).toContainEqual(['eq', ['id', 'c']]);
  });

  it('throws if any update fails', async () => {
    mockFrom({}, { error: new Error('fail') });
    await expect(api.reorderCards([{ columnId: 'x', cardIds: ['a', 'b'] }])).rejects.toThrow('fail');
  });
});

describe('boards', () => {
  it('createBoard seeds the four default columns in order', async () => {
    const calls = mockFrom(
      { data: { id: 'b1', name: 'Mine', created_at: 'now' } },
      {
        data: [
          { id: 'k2', name: 'In Progress', position: 1 },
          { id: 'k1', name: 'Backlog', position: 0 },
        ],
      },
    );
    const board = await api.createBoard('u1', 'Mine');
    expect(calls[0]).toContainEqual(['insert', [{ user_id: 'u1', name: 'Mine' }]]);
    const inserted = calls[1].find(([m]) => m === 'insert')![1][0] as { name: string; position: number }[];
    expect(inserted.map((c) => c.name)).toEqual(['Backlog', 'In Progress', 'In Review', 'Done']);
    expect(board.columns.map((c) => c.id)).toEqual(['k1', 'k2']);
    expect(board.columns[0].cardIds).toEqual([]);
  });

  it('renameBoard and deleteBoard target the board id', async () => {
    const [r] = mockFrom({});
    await api.renameBoard('b1', 'New');
    expect(r).toContainEqual(['update', [{ name: 'New' }]]);
    expect(r).toContainEqual(['eq', ['id', 'b1']]);
    const [d] = mockFrom({});
    await api.deleteBoard('b1');
    expect(d).toContainEqual(['delete', []]);
  });
});

describe('fetchAllData', () => {
  it('skips column and card queries when there are no boards', async () => {
    mockFrom({ data: [] });
    const data = await api.fetchAllData('u1');
    expect(data).toEqual({ boards: [], cards: {} });
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('skips the cards query when there are no columns', async () => {
    mockFrom({ data: [{ id: 'b1', name: 'B', created_at: 't' }] }, { data: [] });
    const data = await api.fetchAllData('u1');
    expect(supabase.from).toHaveBeenCalledTimes(2);
    expect(data.boards[0].columns).toEqual([]);
  });

  it('assembles boards, columns and cards, scoped to the user', async () => {
    const calls = mockFrom(
      { data: [{ id: 'b1', name: 'B', created_at: 't' }] },
      { data: [{ id: 'col1', board_id: 'b1', name: 'Backlog', position: 0 }] },
      { data: [{ ...cardRow, description: 'd', assignee: 'Zed', due_date: '2026-02-03' }] },
    );
    const data = await api.fetchAllData('u1');
    expect(calls[0]).toContainEqual(['eq', ['user_id', 'u1']]);
    expect(data.boards[0].columns[0].cardIds).toEqual(['c1']);
    expect(data.cards.c1).toMatchObject({ description: 'd', assignee: 'Zed', dueDate: '2026-02-03' });
  });

  it('throws when a query errors', async () => {
    mockFrom({ error: new Error('db down') });
    await expect(api.fetchAllData('u1')).rejects.toThrow('db down');
  });
});
