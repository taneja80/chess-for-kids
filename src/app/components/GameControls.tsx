'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import { Difficulty } from '../../lib/stockfish';
import MultiplayerMenu from './MultiplayerMenu';
import styles from './GameControls.module.css';

const DIFFICULTIES: { id: Difficulty; label: string; icon: string; description: string }[] = [
  { id: 'squire',  label: 'Squire',  icon: '🗡️', description: 'Easy — random moves' },
  { id: 'knight',  label: 'Knight',  icon: '🦄', description: 'Medium — thinks a bit' },
  { id: 'bishop',  label: 'Bishop',  icon: '⛪', description: 'Hard — strategic play' },
  { id: 'king',    label: 'King',    icon: '👑', description: 'Expert — full power' },
];

export default function GameControls() {
  const {
    difficulty, setDifficulty,
    playerColor, setPlayerColor,
    moveHistory, takeback,
    newGame, aiThinking, phase,
    goldCoins, isMultiplayer,
    chess,
    showHeatmap, toggleHeatmap,
    timeSpellsRemaining, mode,
  } = useGameStore();

  const canTakeback = moveHistory.length >= 2 && !aiThinking && phase === 'playing' && !isMultiplayer;

  return (
    <div className={styles.controls}>
      {/* Gold coins display */}
      <div className={styles.coinsDisplay}>
        <span className={styles.coinIcon}>🪙</span>
        <span className={styles.coinCount}>{goldCoins}</span>
        <span className={styles.coinLabel}>Gold Coins</span>
      </div>

      <MultiplayerMenu />

      {/* Difficulty selector (hidden in multiplayer) */}
      {!isMultiplayer && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⚔️ AI Difficulty</h3>
        <div className={styles.difficultyGrid}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              id={`difficulty-${d.id}`}
              className={[
                styles.diffBtn,
                difficulty === d.id ? styles.diffBtnActive : '',
              ].join(' ')}
              onClick={() => setDifficulty(d.id)}
              title={d.description}
              aria-pressed={difficulty === d.id}
            >
              <span className={styles.diffIcon}>{d.icon}</span>
              <span className={styles.diffLabel}>{d.label}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Color picker */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🎨 Play As</h3>
        <div className={styles.colorPicker}>
          <button
            id="play-as-white"
            className={[styles.colorBtn, playerColor === 'w' ? styles.colorBtnActive : ''].join(' ')}
            onClick={() => setPlayerColor('w')}
            aria-pressed={playerColor === 'w'}
          >
            ♔ White
          </button>
          <button
            id="play-as-black"
            className={[styles.colorBtn, playerColor === 'b' ? styles.colorBtnActive : ''].join(' ')}
            onClick={() => setPlayerColor('b')}
            aria-pressed={playerColor === 'b'}
          >
            ♚ Black
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏰 Actions</h3>
        <div className={styles.actionBtns}>
          <button
            id="btn-new-game"
            className={`btn btn-gold ${styles.actionBtn}`}
            onClick={newGame}
            title="Start a new game"
          >
            ⚔️ New Game
          </button>
          <button
            id="btn-takeback"
            className={`btn btn-ghost ${styles.actionBtn}`}
            onClick={takeback}
            disabled={!canTakeback}
            title="Take back your last move"
          >
            ↩️ Takeback
          </button>
        </div>
      </div>

      {/* Spells & Vision */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🧙‍♂️ Spells & Vision</h3>
        <div className={styles.magicGrid}>
          {/* Territory Heatmap Toggle */}
          <button
            id="btn-toggle-heatmap"
            className={[
              styles.magicBtn,
              showHeatmap ? styles.magicBtnActive : '',
            ].join(' ')}
            onClick={toggleHeatmap}
            title="Reveal who controls each square on the chessboard!"
            aria-pressed={showHeatmap}
          >
            <span className={styles.magicIcon}>🔮</span>
            <span className={styles.magicLabel}>Territory Map</span>
          </button>

          {/* Time Spells remaining indicator */}
          {mode === 'vs-ai' && (
            <div className={styles.spellStatus} title="Time Spells warn you of blunders and let you rewind time!">
              <div className={styles.spellHeader}>
                <span className={styles.spellLabel}>⏳ Spells</span>
                <span className={styles.spellCount}>{timeSpellsRemaining}/3</span>
              </div>
              <div className={styles.crystalContainer}>
                {[1, 2, 3].map((slot) => {
                  const isActive = slot <= timeSpellsRemaining;
                  return (
                    <span
                      key={slot}
                      className={[
                        styles.crystal,
                        isActive ? styles.crystalActive : styles.crystalSpent,
                      ].join(' ')}
                    >
                      {isActive ? '⚡' : '⚫'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Turn indicator */}
      <div className={styles.turnIndicator}>
        <div className={styles.turnDot} data-turn={chess.turn()} />
        <span>
          {chess.turn() === 'w' ? '♔ White' : '♚ Black'}&apos;s turn
        </span>
      </div>
    </div>
  );
}
