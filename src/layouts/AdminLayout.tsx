import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <span className="text-sm text-gray-600">{user?.username}</span>
          </div>

          <nav className="mt-4 flex gap-4 overflow-x-auto">
            <Link
              to="/admin/roster"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 whitespace-nowrap"
            >
              Roster
            </Link>
            <Link
              to="/admin/rules"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 whitespace-nowrap"
            >
              Scoring Rules
            </Link>
            <Link
              to="/admin/game-setup"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 whitespace-nowrap"
            >
              Game Setup
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
