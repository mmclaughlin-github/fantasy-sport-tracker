import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Player, Profile, Game, GameStatus } from '../../types';

export default function GameSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gameData, setGameData] = useState<{
    opponent_name: string;
    date: string;
    status: GameStatus;
  }>({
    opponent_name: '',
    date: '',
    status: 'scheduled',
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [draftOrder, setDraftOrder] = useState<Record<string, number>>({});
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [playersRes, profilesRes] = await Promise.all([
      supabase.from('players').select('*').eq('is_active', true).order('name'),
      supabase.from('profiles').select('*').order('username'),
    ]);

    if (playersRes.data) setPlayers(playersRes.data);
    if (profilesRes.data) {
      setProfiles(profilesRes.data);
      const initialOrder: Record<string, number> = {};
      profilesRes.data.forEach((p, i) => {
        initialOrder[p.id] = i + 1;
      });
      setDraftOrder(initialOrder);
    }
  };

  const handleCreateGame = async () => {
    const { data, error } = await supabase
      .from('games')
      .insert({
        opponent_name: gameData.opponent_name,
        date: gameData.date,
        status: gameData.status,
      })
      .select()
      .single();

    if (error) {
      alert('Error creating game: ' + error.message);
      return;
    }

    setCreatedGameId(data.id);
    setStep(2);
  };

  const handleSetAttendance = async () => {
    if (!createdGameId) return;

    const attendanceRecords = Array.from(selectedPlayers).map((playerId) => ({
      game_id: createdGameId,
      player_id: playerId,
    }));

    const { error } = await supabase
      .from('game_attendance')
      .insert(attendanceRecords);

    if (error) {
      alert('Error setting attendance: ' + error.message);
      return;
    }

    setStep(3);
  };

  const handleSetDraftOrder = async () => {
    if (!createdGameId) return;

    const draftOrderRecords = Object.entries(draftOrder).map(
      ([profileId, order]) => ({
        game_id: createdGameId,
        profile_id: profileId,
        pick_order: order,
      })
    );

    const { error } = await supabase
      .from('game_draft_order')
      .insert(draftOrderRecords);

    if (error) {
      alert('Error setting draft order: ' + error.message);
      return;
    }

    alert('Game created successfully!');
    navigate('/');
  };

  const togglePlayerSelection = (playerId: string) => {
    const newSet = new Set(selectedPlayers);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedPlayers(newSet);
  };

  const updateDraftOrder = (profileId: string, newOrder: number) => {
    setDraftOrder({ ...draftOrder, [profileId]: newOrder });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create New Game</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                s <= step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Game Details</span>
          <span>Attendance</span>
          <span>Draft Order</span>
        </div>
      </div>

      {step === 1 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Step 1: Game Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Opponent Name
              </label>
              <input
                type="text"
                value={gameData.opponent_name}
                onChange={(e) =>
                  setGameData({ ...gameData, opponent_name: e.target.value })
                }
                className="input"
                placeholder="e.g., Blue Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Game Date & Time
              </label>
              <input
                type="datetime-local"
                value={gameData.date}
                onChange={(e) =>
                  setGameData({ ...gameData, date: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={gameData.status}
                onChange={(e) =>
                  setGameData({
                    ...gameData,
                    status: e.target.value as Game['status'],
                  })
                }
                className="input"
              >
                <option value="scheduled">Scheduled</option>
                <option value="drafting">Drafting</option>
                <option value="live">Live</option>
              </select>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={!gameData.opponent_name || !gameData.date}
              className="btn-primary w-full disabled:opacity-50"
            >
              Next: Set Attendance
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Step 2: Player Attendance
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select which players will be available for drafting
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => togglePlayerSelection(player.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedPlayers.has(player.id)
                    ? 'border-primary-600 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-gray-500">
                  {player.type === 'kid' ? 'Player' : 'Coach'}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Back
            </button>
            <button
              onClick={handleSetAttendance}
              disabled={selectedPlayers.size === 0}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Next: Set Draft Order
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Step 3: Draft Order</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set the order in which parents will draft (1st, 2nd, 3rd, etc.)
          </p>

          <div className="space-y-2 mb-6">
            {profiles
              .sort(
                (a, b) => (draftOrder[a.id] || 0) - (draftOrder[b.id] || 0)
              )
              .map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="number"
                    min="1"
                    value={draftOrder[profile.id] || 1}
                    onChange={(e) =>
                      updateDraftOrder(profile.id, parseInt(e.target.value))
                    }
                    className="input w-20"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{profile.username}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleSetDraftOrder} className="btn-primary flex-1">
              Complete Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
