import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ScoringRule } from '../../types';

export default function ScoringRules() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    action_name: '',
    position_context: 'General',
    points: 1,
  });
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const { data, error } = await supabase
      .from('scoring_rules')
      .select('*')
      .order('position_context')
      .order('action_name');

    if (!error && data) {
      setRules(data);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.action_name.trim()) return;

    const { error } = await supabase.from('scoring_rules').insert({
      action_name: newRule.action_name,
      position_context: newRule.position_context,
      points: newRule.points,
    });

    if (!error) {
      setNewRule({ action_name: '', position_context: 'General', points: 1 });
      setShowAddRule(false);
      loadRules();
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    const { error } = await supabase
      .from('scoring_rules')
      .update({
        action_name: editingRule.action_name,
        position_context: editingRule.position_context,
        points: editingRule.points,
        is_active: editingRule.is_active,
      })
      .eq('id', editingRule.id);

    if (!error) {
      setEditingRule(null);
      loadRules();
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Delete this scoring rule?')) return;

    const { error } = await supabase.from('scoring_rules').delete().eq('id', id);

    if (!error) {
      loadRules();
    }
  };

  const positionContexts = ['General', 'Forward', 'Defense', 'Goalie'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Scoring Rules</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure point values for different actions and positions
          </p>
        </div>
        <button onClick={() => setShowAddRule(true)} className="btn-primary">
          Add Rule
        </button>
      </div>

      {showAddRule && (
        <div className="card">
          <h3 className="font-semibold mb-4">Add New Scoring Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Action Name
              </label>
              <input
                type="text"
                placeholder="e.g., Goal, Assist"
                value={newRule.action_name}
                onChange={(e) =>
                  setNewRule({ ...newRule, action_name: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Position Context
              </label>
              <select
                value={newRule.position_context}
                onChange={(e) =>
                  setNewRule({ ...newRule, position_context: e.target.value })
                }
                className="input"
              >
                {positionContexts.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                value={newRule.points}
                onChange={(e) =>
                  setNewRule({ ...newRule, points: parseInt(e.target.value) })
                }
                className="input"
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleAddRule} className="btn-primary">
                Add
              </button>
              <button
                onClick={() => setShowAddRule(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {positionContexts.map((context) => {
          const contextRules = rules.filter(
            (r) => r.position_context === context
          );
          if (contextRules.length === 0) return null;

          return (
            <div key={context}>
              <h3 className="font-semibold text-sm text-gray-700 mb-2 mt-4">
                {context}
              </h3>
              <div className="space-y-2">
                {contextRules.map((rule) => (
                  <div key={rule.id} className="card">
                    {editingRule?.id === rule.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input
                          type="text"
                          value={editingRule.action_name}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              action_name: e.target.value,
                            })
                          }
                          className="input"
                        />
                        <select
                          value={editingRule.position_context}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              position_context: e.target.value,
                            })
                          }
                          className="input"
                        >
                          {positionContexts.map((ctx) => (
                            <option key={ctx} value={ctx}>
                              {ctx}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={editingRule.points}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              points: parseInt(e.target.value),
                            })
                          }
                          className="input"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.is_active}
                            onChange={(e) =>
                              setEditingRule({
                                ...editingRule,
                                is_active: e.target.checked,
                              })
                            }
                          />
                          Active
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateRule}
                            className="btn-primary text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRule(null)}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">
                            {rule.action_name}
                            {!rule.is_active && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Inactive)
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {rule.points > 0 ? '+' : ''}
                            {rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="btn-secondary text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="btn-danger text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
