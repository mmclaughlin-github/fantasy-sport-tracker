import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Game } from '../types';

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-gray-200 text-gray-800',
      drafting: 'bg-blue-200 text-blue-800',
      live: 'bg-green-200 text-green-800',
      completed: 'bg-purple-200 text-purple-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Fantasy Sports
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username}
              {user?.is_commissioner && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  ADMIN
                </span>
              )}
            </span>
            <button onClick={() => signOut()} className="btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/install"
          className="block mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Install on Your Phone</h3>
              <p className="text-sm text-blue-100">
                Add this app to your home screen for quick access
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Games</h2>
          {user?.is_commissioner && (
            <Link to="/admin/game-setup" className="btn-primary">
              Create Game
            </Link>
          )}
        </div>

        {user?.is_commissioner && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link to="/admin/roster" className="card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">Manage Roster</h3>
              <p className="text-sm text-gray-600">
                Add/edit players and parent restrictions
              </p>
            </Link>
            <Link to="/admin/rules" className="card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">Scoring Rules</h3>
              <p className="text-sm text-gray-600">
                Configure point values for actions
              </p>
            </Link>
            <Link to="/admin/game-setup" className="card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">Game Setup</h3>
              <p className="text-sm text-gray-600">
                Create games and set draft orders
              </p>
            </Link>
          </div>
        )}

        {games.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No games scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      vs {game.opponent_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(game.date)}
                    </p>
                  </div>
                  {getStatusBadge(game.status)}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {game.status === 'drafting' && (
                    <Link
                      to={`/game/${game.id}/draft`}
                      className="btn-primary text-sm"
                    >
                      Join Draft
                    </Link>
                  )}

                  {(game.status === 'live' || game.status === 'completed') && (
                    <Link
                      to={`/game/${game.id}/leaderboard`}
                      className="btn-primary text-sm"
                    >
                      View Leaderboard
                    </Link>
                  )}

                  {user?.is_commissioner && game.status === 'live' && (
                    <Link
                      to={`/admin/stat-pad/${game.id}`}
                      className="btn-secondary text-sm"
                    >
                      Stat Pad
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
