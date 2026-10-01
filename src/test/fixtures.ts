import type { Board, Card, DataState } from '../types';

export const makeCard = (over: Partial<Card> = {}): Card => ({
  id: 'c1',
  title: 'Write tests',
  description: 'desc',
  assignee: 'Jo',
  priority: 'Medium',
  dueDate: '2026-10-05',
  ...over,
});

export const makeBoard = (): Board => ({
  id: 'b1',
  name: 'Roadmap',
  createdAt: '2026-10-01T00:00:00Z',
  columns: [
    { id: 'col1', name: 'Backlog', cardIds: ['c1', 'c2'] },
    { id: 'col2', name: 'In Progress', cardIds: ['c3'] },
    { id: 'col3', name: 'Done', cardIds: [] },
  ],
});

export const makeState = (): DataState => ({
  boards: [makeBoard()],
  cards: {
    c1: makeCard({ id: 'c1', title: 'One' }),
    c2: makeCard({ id: 'c2', title: 'Two' }),
    c3: makeCard({ id: 'c3', title: 'Three' }),
  },
});
