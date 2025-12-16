import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ParentScore, PlayerScore, Profile, Game } from '../types';

export default function Leaderboard() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [scores, setScores] = useState<ParentScore[]>([]);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGame = useCallback(async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!error && data) {
      setGame(data);
    }
  }, [gameId]);

  const loadScores = useCallback(async () => {
    if (!gameId) return;

    try {
      const [picksRes, logsRes, profilesRes] = await Promise.all([
        supabase
          .from('draft_picks')
          .select('*, players(*)')
          .eq('game_id', gameId),
        supabase
          .from('game_logs')
          .select('*, scoring_rules(*)')
          .eq('game_id', gameId),
        supabase.from('profiles').select('*'),
      ]);

      if (!picksRes.data || !logsRes.data || !profilesRes.data) {
        setLoading(false);
        return;
      }

      const profilesMap: Record<string, Profile> = {};
      profilesRes.data.forEach((p) => {
        profilesMap[p.id] = p;
      });

      const parentPicks: Record<
        string,
        { playerId: string; playerName: string }[]
      > = {};
      (picksRes.data as unknown as { picked_by_profile_id: string; player_id: string; players: { name: string } }[]).forEach((pick) => {
        if (!parentPicks[pick.picked_by_profile_id]) {
          parentPicks[pick.picked_by_profile_id] = [];
        }
        parentPicks[pick.picked_by_profile_id].push({
          playerId: pick.player_id,
          playerName: pick.players.name,
        });
      });

      const playerPoints: Record<string, number> = {};
      (logsRes.data as unknown as { player_id: string; scoring_rules: { points: number } | null }[]).forEach((log) => {
        if (!playerPoints[log.player_id]) {
          playerPoints[log.player_id] = 0;
        }
        playerPoints[log.player_id] += log.scoring_rules?.points || 0;
      });

      const parentScores: ParentScore[] = Object.entries(parentPicks).map(
        ([profileId, picks]) => {
          const playerScores: PlayerScore[] = picks.map((pick) => ({
            player_id: pick.playerId,
            player_name: pick.playerName,
            points: playerPoints[pick.playerId] || 0,
          }));

          const total = playerScores.reduce((sum, ps) => sum + ps.points, 0);

          return {
            profile_id: profileId,
            username: profilesMap[profileId]?.username || 'Unknown',
            total_points: total,
            players: playerScores,
          };
        }
      );

      parentScores.sort((a, b) => b.total_points - a.total_points);

      setScores(parentScores);
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    loadGame();
    loadScores();

    const subscription = supabase
      .channel(`leaderboard-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_logs',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadScores();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, loadGame, loadScores]);

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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              {game && (
                <p className="text-sm text-gray-600">vs {game.opponent_name}</p>
              )}
            </div>
            {game && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.status === 'live'
                    ? 'bg-green-100 text-green-800 animate-pulse'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {game.status === 'live' ? 'LIVE' : game.status.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {scores.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              No scores yet. Draft hasn't started or no stats recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((parent, index) => {
              const isExpanded = expandedParent === parent.profile_id;
              const medal =
                index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

              return (
                <div key={parent.profile_id} className="card">
                  <button
                    onClick={() =>
                      setExpandedParent(isExpanded ? null : parent.profile_id)
                    }
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-400 w-8">
                          {medal || `#${index + 1}`}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {parent.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {parent.players.length} player
                            {parent.players.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {parent.total_points}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Player Breakdown
                      </h4>
                      <div className="space-y-2">
                        {parent.players
                          .sort((a, b) => b.points - a.points)
                          .map((player) => (
                            <div
                              key={player.player_id}
                              className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                            >
                              <span className="font-medium">
                                {player.player_name}
                              </span>
                              <span
                                className={`font-semibold ${
                                  player.points > 0
                                    ? 'text-green-600'
                                    : player.points < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {player.points > 0 ? '+' : ''}
                                {player.points}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
