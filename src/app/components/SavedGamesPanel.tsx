'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './SavedGamesPanel.module.css';

function formatRelative(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  const d = new Date(ts);
  return d.toLocaleDateString();
}

const RESULT_BADGE: Record<string, { icon: string; label: string; color: string }> = {
  win:           { icon: '🏆', label: 'Win',          color: '#4ade80' },
  loss:          { icon: '💔', label: 'Loss',         color: '#f87171' },
  draw:          { icon: '🤝', label: 'Draw',         color: '#a78bfa' },
  'in-progress': { icon: '⏳', label: 'In Progress',  color: '#fbbf24' },
};

interface SavedGamesPanelProps {
  onResume?: () => void;
}

export default function SavedGamesPanel({ onResume }: SavedGamesPanelProps) {
  const { savedGames, loadSavedGame, deleteSavedGame, saveCurrentGame, playerProfile, moveHistory, phase } = useGameStore();
  const [nameInput, setNameInput] = useState('');

  const canSave = moveHistory.length > 0 && phase !== 'home';

  const handleSave = () => {
    const id = saveCurrentGame(nameInput.trim() || undefined);
    setNameInput('');
    return id;
  };

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>💾 Saved Games</h2>
        <p className={styles.subtitle}>
          {playerProfile
            ? `Hello, ${playerProfile.name}! Resume an old battle or save your current one.`
            : 'Save your games and resume them anytime on this device.'}
        </p>
      </header>

      {/* Save current game */}
      <div className={styles.saveRow}>
        <input
          id="save-game-name"
          type="text"
          className={styles.input}
          placeholder="Name this game (optional)"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          maxLength={48}
          disabled={!canSave}
        />
        <button
          id="btn-save-current-game"
          type="button"
          className={`btn btn-gold ${styles.saveBtn}`}
          onClick={handleSave}
          disabled={!canSave}
          title={canSave ? 'Save current game' : 'Make at least one move first'}
        >
          💾 Save Current Game
        </button>
      </div>

      {/* List */}
      {savedGames.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📜</span>
          <p>No saved games yet. Play a game and click <strong>Save Current Game</strong> to keep it for later!</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {savedGames.map((g) => {
            const badge = RESULT_BADGE[g.result ?? 'in-progress'];
            return (
              <li key={g.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitleRow}>
                    <span
                      className={styles.resultPill}
                      style={{ backgroundColor: `${badge.color}22`, color: badge.color, borderColor: `${badge.color}55` }}
                    >
                      {badge.icon} {badge.label}
                    </span>
                    <strong className={styles.itemName}>{g.name}</strong>
                  </div>
                  <div className={styles.itemMeta}>
                    <span>♟ {g.moveCount} moves</span>
                    <span>· {g.mode === 'vs-ai' ? `vs AI (${g.difficulty})` : g.mode}</span>
                    <span>· {g.playerColor === 'w' ? 'White' : 'Black'}</span>
                    <span>· {formatRelative(g.savedAt)}</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const ok = loadSavedGame(g.id);
                      if (ok && onResume) onResume();
                    }}
                  >
                    ▶ Resume
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      if (confirm(`Delete "${g.name}"? This cannot be undone.`)) {
                        deleteSavedGame(g.id);
                      }
                    }}
                    aria-label="Delete saved game"
                  >
                    🗑
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
