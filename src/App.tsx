import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InstallInstructions from './pages/InstallInstructions';
import AdminLayout from './layouts/AdminLayout';
import RosterManagement from './pages/admin/RosterManagement';
import ScoringRules from './pages/admin/ScoringRules';
import GameSetup from './pages/admin/GameSetup';
import Draft from './pages/Draft';
import StatPad from './pages/StatPad';
import Leaderboard from './pages/Leaderboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isCommissioner = user?.is_commissioner || false;

  if (!user) return <Navigate to="/login" />;
  if (!isCommissioner) return <Navigate to="/" />;

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/install" element={<InstallInstructions />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/game/:gameId/draft" element={
        <ProtectedRoute>
          <Draft />
        </ProtectedRoute>
      } />

      <Route path="/game/:gameId/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route path="roster" element={<RosterManagement />} />
        <Route path="rules" element={<ScoringRules />} />
        <Route path="game-setup" element={<GameSetup />} />
        <Route path="stat-pad/:gameId" element={<StatPad />} />
      </Route>
    </Routes>
  );
}

export default App;
