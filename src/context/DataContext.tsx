import { friendlyError } from '../lib/errors';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from '../lib/api';
import { useAuth } from './useAuth';
import type { Board, Card, DataState } from '../types';

export interface DataContextValue {
  state: DataState;
  loading: boolean;
  error: string | null;
  createBoard: (name: string) => Promise<Board>;
  renameBoard: (boardId: string, name: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  addCard: (boardId: string, columnId: string, input: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (boardId: string, cardId: string) => Promise<void>;
  moveCard: (boardId: string, cardId: string, toColumnId: string, toIndex: number) => Promise<void>;
  getBoard: (boardId: string) => Board | undefined;
}

const emptyState: DataState = { boards: [], cards: {} };

export const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<DataState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setState(emptyState);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .fetchAllData(user.id)
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(friendlyError(err, 'Could not load your boards. Please refresh and try again.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const createBoard = useCallback(
    async (name: string): Promise<Board> => {
      if (!user) throw new Error('Not signed in');
      const board = await api.createBoard(user.id, name);
      setState((prev) => ({ ...prev, boards: [...prev.boards, board] }));
      return board;
    },
    [user],
  );

  const renameBoard = useCallback(async (boardId: string, name: string) => {
    await api.renameBoard(boardId, name);
    setState((prev) => ({ ...prev, boards: prev.boards.map((b) => (b.id !== boardId ? b : { ...b, name })) }));
  }, []);

  const deleteBoard = useCallback(async (boardId: string) => {
    await api.deleteBoard(boardId);
    setState((prev) => ({ ...prev, boards: prev.boards.filter((b) => b.id !== boardId) }));
  }, []);

  const addCard = useCallback(
    async (boardId: string, columnId: string, input: Omit<Card, 'id'>) => {
      const board = state.boards.find((b) => b.id === boardId);
      const column = board?.columns.find((c) => c.id === columnId);
      const position = column?.cardIds.length ?? 0;
      const card = await api.addCard(columnId, position, input);
      setState((prev) => ({
        boards: prev.boards.map((b) =>
          b.id !== boardId
            ? b
            : {
                ...b,
                columns: b.columns.map((c) =>
                  c.id !== columnId ? c : { ...c, cardIds: [...c.cardIds, card.id] },
                ),
              },
        ),
        cards: { ...prev.cards, [card.id]: card },
      }));
    },
    [state.boards],
  );

  const updateCard = useCallback(async (card: Card) => {
    await api.updateCard(card);
    setState((prev) => ({ ...prev, cards: { ...prev.cards, [card.id]: card } }));
  }, []);

  const deleteCard = useCallback(async (boardId: string, cardId: string) => {
    await api.deleteCard(cardId);
    setState((prev) => {
      const boards = prev.boards.map((b) =>
        b.id !== boardId
          ? b
          : { ...b, columns: b.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((id) => id !== cardId) })) },
      );
      const cards = { ...prev.cards };
      delete cards[cardId];
      return { boards, cards };
    });
  }, []);

  const moveCard = useCallback(
    async (boardId: string, cardId: string, toColumnId: string, toIndex: number) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;

      const columns = board.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((id) => id !== cardId) }));
      const targetIndex = columns.findIndex((c) => c.id === toColumnId);
      if (targetIndex === -1) return;
      const cardIds = [...columns[targetIndex].cardIds];
      const clampedIndex = Math.max(0, Math.min(toIndex, cardIds.length));
      cardIds.splice(clampedIndex, 0, cardId);
      columns[targetIndex] = { ...columns[targetIndex], cardIds };

      const changedColumns = columns.filter((c, i) => c.cardIds.join(',') !== board.columns[i].cardIds.join(','));
      await api.reorderCards(changedColumns.map((c) => ({ columnId: c.id, cardIds: c.cardIds })));

      setState((prev) => ({ ...prev, boards: prev.boards.map((b) => (b.id !== boardId ? b : { ...b, columns })) }));
    },
    [state.boards],
  );

  const getBoard = useCallback((boardId: string) => state.boards.find((b) => b.id === boardId), [state.boards]);

  const value = useMemo<DataContextValue>(
    () => ({
      state,
      loading,
      error,
      createBoard,
      renameBoard,
      deleteBoard,
      addCard,
      updateCard,
      deleteCard,
      moveCard,
      getBoard,
    }),
    [state, loading, error, createBoard, renameBoard, deleteBoard, addCard, updateCard, deleteCard, moveCard, getBoard],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
