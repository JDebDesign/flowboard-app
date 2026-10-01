import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/useAuth';

vi.mock('../context/useAuth');

const renderRoute = (auth: object) => {
  vi.mocked(useAuth).mockReturnValue(auth as never);
  render(
    <MemoryRouter initialEntries={['/boards']}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/boards" element={<ProtectedRoute><p>secret</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute', () => {
  it('REGRESSION: shows a loading status (not a blank page) while auth loads', () => {
    renderRoute({ user: null, loading: true, slowLoading: false });
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('REGRESSION: explains when loading is slow', () => {
    renderRoute({ user: null, loading: true, slowLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('taking longer than usual');
  });

  it('redirects signed-out users to /login', () => {
    renderRoute({ user: null, loading: false, slowLoading: false });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children for signed-in users', () => {
    renderRoute({ user: { id: 'u1' }, loading: false, slowLoading: false });
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
