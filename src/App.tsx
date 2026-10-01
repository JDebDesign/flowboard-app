import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { LoadingScreen } from './components/LoadingScreen';
import { NotFoundPage } from './pages/NotFoundPage';

const BoardsPage = lazy(() => import('./pages/BoardsPage').then((m) => ({ default: m.BoardsPage })));
const BoardPage = lazy(() => import('./pages/BoardPage').then((m) => ({ default: m.BoardPage })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })));

function App() {
  return (
    <AuthProvider>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <DataProvider>
        <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <BoardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
