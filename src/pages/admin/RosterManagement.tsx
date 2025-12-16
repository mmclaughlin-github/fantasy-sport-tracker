import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Player, Profile, PlayerType } from '../../types';

export default function RosterManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [restrictions, setRestrictions] = useState<Record<string, string[]>>({});
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState<{ name: string; type: PlayerType }>({
    name: '',
    type: 'kid'
  });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [playersRes, profilesRes, restrictionsRes] = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('profiles').select('*').order('username'),
      supabase.from('parent_player_restrictions').select('*'),
    ]);

    if (playersRes.data) setPlayers(playersRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);

    if (restrictionsRes.data) {
      const grouped: Record<string, string[]> = {};
      restrictionsRes.data.forEach((r) => {
        if (!grouped[r.parent_id]) grouped[r.parent_id] = [];
        grouped[r.parent_id].push(r.player_id);
      });
      setRestrictions(grouped);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) return;

    const { error } = await supabase.from('players').insert({
      name: newPlayer.name,
      type: newPlayer.type,
    });

    if (!error) {
      setNewPlayer({ name: '', type: 'kid' });
      setShowAddPlayer(false);
      loadData();
    }
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;

    const { error } = await supabase
      .from('players')
      .update({
        name: editingPlayer.name,
        type: editingPlayer.type,
        is_active: editingPlayer.is_active,
      })
      .eq('id', editingPlayer.id);

    if (!error) {
      setEditingPlayer(null);
      loadData();
    }
  };

  const handleToggleRestriction = async (parentId: string, playerId: string) => {
    const hasRestriction = restrictions[parentId]?.includes(playerId);

    if (hasRestriction) {
      await supabase
        .from('parent_player_restrictions')
        .delete()
        .eq('parent_id', parentId)
        .eq('player_id', playerId);
    } else {
      await supabase
        .from('parent_player_restrictions')
        .insert({ parent_id: parentId, player_id: playerId });
    }

    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Player Roster</h2>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="btn-primary"
          >
            Add Player
          </button>
        </div>

        {showAddPlayer && (
          <div className="card mb-4">
            <h3 className="font-semibold mb-4">Add New Player</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Player name"
                value={newPlayer.name}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
                className="input flex-1"
              />
              <select
                value={newPlayer.type}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    type: e.target.value as 'kid' | 'coach',
                  })
                }
                className="input"
              >
                <option value="kid">Kid</option>
                <option value="coach">Coach</option>
              </select>
              <button onClick={handleAddPlayer} className="btn-primary">
                Add
              </button>
              <button
                onClick={() => setShowAddPlayer(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {players.map((player) => (
            <div key={player.id} className="card">
              {editingPlayer?.id === player.id ? (
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={editingPlayer.name}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, name: e.target.value })
                    }
                    className="input flex-1"
                  />
                  <select
                    value={editingPlayer.type}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        type: e.target.value as 'kid' | 'coach',
                      })
                    }
                    className="input"
                  >
                    <option value="kid">Kid</option>
                    <option value="coach">Coach</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPlayer.is_active}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    Active
                  </label>
                  <button onClick={handleUpdatePlayer} className="btn-primary">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPlayer(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-600">
                      {player.type === 'kid' ? 'Player' : 'Coach'}
                      {!player.is_active && ' (Inactive)'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPlayer(player)}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Parent Restrictions</h2>
        <p className="text-sm text-gray-600 mb-4">
          Parents cannot draft players marked below (typically their own children)
        </p>

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="card">
              <h3 className="font-semibold mb-3">{profile.username}</h3>
              <div className="flex flex-wrap gap-2">
                {players.map((player) => {
                  const isRestricted = restrictions[profile.id]?.includes(
                    player.id
                  );
                  return (
                    <button
                      key={player.id}
                      onClick={() =>
                        handleToggleRestriction(profile.id, player.id)
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isRestricted
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {player.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
