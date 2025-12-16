import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Player, DraftPick, Profile } from '../types';

interface DraftPlayer extends Player {
  isRestricted: boolean;
  isDrafted: boolean;
  averagePoints: number;
}

export default function Draft() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [availablePlayers, setAvailablePlayers] = useState<DraftPlayer[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [draftOrder, setDraftOrder] = useState<{ profile_id: string; pick_order: number }[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pickingFor, setPickingFor] = useState<string | null>(null);

  const loadDraftData = useCallback(async () => {
    if (!gameId || !user) return;

    try {
      const [
        playersRes,
        picksRes,
        orderRes,
        profilesRes,
        restrictionsRes,
        logsRes,
      ] = await Promise.all([
        supabase
          .from('game_attendance')
          .select('player_id, players(*)')
          .eq('game_id', gameId),
        supabase
          .from('draft_picks')
          .select('*')
          .eq('game_id', gameId)
          .order('pick_number'),
        supabase
          .from('game_draft_order')
          .select('*')
          .eq('game_id', gameId)
          .order('pick_order'),
        supabase.from('profiles').select('*'),
        supabase.from('parent_player_restrictions').select('*'),
        supabase
          .from('game_logs')
          .select('player_id, rule_id, scoring_rules(points), games(status)')
          .eq('games.status', 'completed'),
      ]);

      if (playersRes.data && picksRes.data && orderRes.data && profilesRes.data) {
        const profilesMap: Record<string, Profile> = {};
        profilesRes.data.forEach((p) => {
          profilesMap[p.id] = p;
        });
        setProfiles(profilesMap);

        const restrictions = new Set(
          restrictionsRes.data
            ?.filter((r) => r.parent_id === user.id)
            .map((r) => r.player_id) || []
        );

        const playerAverages: Record<string, number> = {};
        if (logsRes.data) {
          const playerGameScores: Record<string, number[]> = {};
          (logsRes.data as unknown as { player_id: string; scoring_rules: { points: number } | null }[]).forEach((log) => {
            if (!playerGameScores[log.player_id]) {
              playerGameScores[log.player_id] = [];
            }
            playerGameScores[log.player_id].push(log.scoring_rules?.points || 0);
          });

          Object.entries(playerGameScores).forEach(([playerId, scores]) => {
            playerAverages[playerId] = scores.reduce((a, b) => a + b, 0) / scores.length;
          });
        }

        const draftedPlayerIds = new Set(picksRes.data.map((p) => p.player_id));
        const draftCount = picksRes.data.length;
        const parentCount = orderRes.data.length;

        const shouldResetPool = parentCount > 0 &&
          availablePlayers.length > 0 &&
          availablePlayers.filter(p => !p.isDrafted).length < parentCount;

        const players: DraftPlayer[] = (playersRes.data as unknown as { player_id: string; players: Player }[]).map((pa) => ({
          ...pa.players,
          isRestricted: restrictions.has(pa.player_id),
          isDrafted: shouldResetPool ? false : draftedPlayerIds.has(pa.player_id),
          averagePoints: playerAverages[pa.player_id] || 0,
        }));

        setAvailablePlayers(players);
        setDraftPicks(picksRes.data);
        setDraftOrder(orderRes.data);

        const round = Math.floor(draftCount / parentCount) + 1;
        setCurrentRound(round);

        const positionInRound = draftCount % parentCount;
        const isSnakeBack = round % 2 === 0;
        const pickOrderIndex = isSnakeBack
          ? parentCount - 1 - positionInRound
          : positionInRound;

        if (pickOrderIndex < orderRes.data.length) {
          setCurrentPicker(orderRes.data[pickOrderIndex].profile_id);
        }
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId, user, availablePlayers]);

  useEffect(() => {
    if (!gameId) return;
    loadDraftData();

    const subscription = supabase
      .channel(`draft-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_picks',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadDraftData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, loadDraftData]);

  const handlePick = async (playerId: string, forcePickFor?: string) => {
    if (!gameId || (!user?.is_commissioner && !currentPicker)) return;

    const pickerId = forcePickFor || currentPicker || user!.id;
    const pickNumber = draftPicks.length + 1;

    const { error } = await supabase.from('draft_picks').insert({
      game_id: gameId,
      picked_by_profile_id: pickerId,
      player_id: playerId,
      round_number: currentRound,
      pick_number: pickNumber,
    });

    if (error) {
      alert('Error making pick: ' + error.message);
    }

    setPickingFor(null);
  };

  const handleAutoPick = () => {
    const available = availablePlayers.filter(
      (p) => !p.isRestricted && !p.isDrafted
    );

    if (available.length === 0) return;

    available.sort((a, b) => b.averagePoints - a.averagePoints);
    handlePick(available[0].id);
  };

  const handleForcePick = (playerId: string) => {
    if (pickingFor) {
      handlePick(playerId, pickingFor);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading draft...</div>
      </div>
    );
  }

  const isMyTurn = currentPicker === user?.id;
  const currentPickerName = currentPicker ? profiles[currentPicker]?.username : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Draft</h1>
              <p className="text-sm text-gray-600">
                Round {currentRound} • Pick {(draftPicks.length % draftOrder.length) + 1}
              </p>
            </div>
            <div className="text-right">
              {isMyTurn ? (
                <div className="text-green-600 font-semibold">Your turn!</div>
              ) : (
                <div className="text-gray-600">
                  Waiting for {currentPickerName}...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {isMyTurn && (
          <div className="card bg-primary-50 border-2 border-primary-200">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-primary-900">
                It's your turn to pick!
              </p>
              <button onClick={handleAutoPick} className="btn-secondary text-sm">
                Auto-Pick Best Player
              </button>
            </div>
          </div>
        )}

        {user?.is_commissioner && (
          <div className="card bg-yellow-50 border-2 border-yellow-200">
            <p className="font-semibold text-yellow-900 mb-2">
              Commissioner Controls
            </p>
            <select
              value={pickingFor || ''}
              onChange={(e) => setPickingFor(e.target.value || null)}
              className="input text-sm"
            >
              <option value="">Select parent to pick for...</option>
              {draftOrder.map((o) => (
                <option key={o.profile_id} value={o.profile_id}>
                  {profiles[o.profile_id]?.username}
                </option>
              ))}
            </select>
            {pickingFor && (
              <p className="text-sm text-yellow-700 mt-2">
                Click any available player to draft for{' '}
                {profiles[pickingFor]?.username}
              </p>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold mb-3">Available Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePlayers.map((player) => {
              const canPick =
                (isMyTurn || pickingFor) &&
                !player.isRestricted &&
                !player.isDrafted;

              return (
                <button
                  key={player.id}
                  onClick={() =>
                    canPick &&
                    (pickingFor
                      ? handleForcePick(player.id)
                      : handlePick(player.id))
                  }
                  disabled={!canPick}
                  className={`card text-left transition-all ${
                    player.isDrafted
                      ? 'opacity-40 cursor-not-allowed'
                      : player.isRestricted
                      ? 'opacity-60 cursor-not-allowed border-2 border-red-200'
                      : canPick
                      ? 'hover:shadow-lg hover:border-primary-300 border-2 border-transparent cursor-pointer'
                      : 'cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-gray-600">
                        {player.type === 'kid' ? 'Player' : 'Coach'}
                      </p>
                    </div>
                    {player.averagePoints > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Avg</div>
                        <div className="font-semibold text-primary-600">
                          {player.averagePoints.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                  {player.isRestricted && (
                    <div className="mt-2 text-xs text-red-600">
                      Restricted (your player)
                    </div>
                  )}
                  {player.isDrafted && (
                    <div className="mt-2 text-xs text-gray-500">Drafted</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Draft Results</h2>
          <div className="space-y-4">
            {draftOrder.map((order) => {
              const userPicks = draftPicks.filter(
                (p) => p.picked_by_profile_id === order.profile_id
              );
              const profile = profiles[order.profile_id];

              return (
                <div key={order.profile_id} className="card">
                  <h3 className="font-semibold mb-2">
                    #{order.pick_order} {profile?.username}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userPicks.map((pick) => {
                      const player = availablePlayers.find(
                        (p) => p.id === pick.player_id
                      );
                      return (
                        <div
                          key={pick.id}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {player?.name || 'Unknown'}
                        </div>
                      );
                    })}
                    {userPicks.length === 0 && (
                      <div className="text-sm text-gray-400">No picks yet</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
