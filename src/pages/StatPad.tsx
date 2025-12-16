import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Player, ScoringRule, GameLog } from '../types';

export default function StatPad() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [recentLogs, setRecentLogs] = useState<(GameLog & { player: Player; rule: ScoringRule })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!gameId) return;

    try {
      const [playersRes, rulesRes] = await Promise.all([
        supabase
          .from('game_attendance')
          .select('player_id, players(*)')
          .eq('game_id', gameId),
        supabase
          .from('scoring_rules')
          .select('*')
          .eq('is_active', true)
          .order('position_context')
          .order('action_name'),
      ]);

      if (playersRes.data) {
        setPlayers((playersRes.data as unknown as { players: Player }[]).map((pa) => pa.players));
      }

      if (rulesRes.data) {
        setScoringRules(rulesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const loadRecentLogs = useCallback(async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('game_logs')
      .select('*, players(*), scoring_rules(*)')
      .eq('game_id', gameId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (!error && data) {
      setRecentLogs(
        (data as unknown as (GameLog & { players: Player; scoring_rules: ScoringRule })[]).map((log) => ({
          ...log,
          player: log.players,
          rule: log.scoring_rules,
        }))
      );
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    loadData();
    loadRecentLogs();

    const subscription = supabase
      .channel(`game-logs-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_logs',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadRecentLogs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, loadData, loadRecentLogs]);

  const handleRecordAction = async (ruleId: number) => {
    if (!gameId || !selectedPlayer) return;

    const { error } = await supabase.from('game_logs').insert({
      game_id: gameId,
      player_id: selectedPlayer.id,
      rule_id: ruleId,
    });

    if (error) {
      alert('Error recording action: ' + error.message);
    } else {
      const rule = scoringRules.find((r) => r.id === ruleId);
      showToast(`${rule?.action_name} recorded for ${selectedPlayer.name}`);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Delete this log entry?')) return;

    const { error } = await supabase.from('game_logs').delete().eq('id', logId);

    if (!error) {
      showToast('Log entry deleted');
    }
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const groupedRules = scoringRules.reduce((acc, rule) => {
    if (!acc[rule.position_context]) {
      acc[rule.position_context] = [];
    }
    acc[rule.position_context].push(rule);
    return acc;
  }, {} as Record<string, ScoringRule[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Stat Pad</h1>
          <p className="text-sm text-gray-600">Record live game actions</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!selectedPlayer ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Select a Player</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="card hover:shadow-lg hover:border-primary-300 transition-all border-2 border-transparent text-left"
                >
                  <h3 className="font-semibold">{player.name}</h3>
                  <p className="text-sm text-gray-600">
                    {player.type === 'kid' ? 'Player' : 'Coach'}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="card flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold">{log.player.name}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span>{log.rule.action_name}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span
                        className={
                          log.rule.points > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {log.rule.points > 0 ? '+' : ''}
                        {log.rule.points} pts
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {recentLogs.length === 0 && (
                  <div className="card text-center text-gray-500">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Back to players
              </button>
              <div className="card bg-primary-50 border-2 border-primary-200">
                <h2 className="text-xl font-bold text-primary-900">
                  {selectedPlayer.name}
                </h2>
                <p className="text-sm text-primary-700">
                  {selectedPlayer.type === 'kid' ? 'Player' : 'Coach'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedRules).map(([context, rules]) => (
                <div key={context}>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    {context === 'General' ? 'General Actions' : `As ${context}`}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {rules.map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => handleRecordAction(rule.id)}
                        className={`card text-left hover:shadow-lg transition-all ${
                          rule.points > 0
                            ? 'hover:border-green-300 border-2 border-transparent'
                            : 'hover:border-red-300 border-2 border-transparent'
                        }`}
                      >
                        <div className="font-semibold">{rule.action_name}</div>
                        <div
                          className={`text-lg font-bold ${
                            rule.points > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {rule.points > 0 ? '+' : ''}
                          {rule.points} pt{Math.abs(rule.points) !== 1 ? 's' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
