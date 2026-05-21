'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import { PUZZLES } from '../../lib/gameData';
import styles from './PuzzleControls.module.css';

interface PuzzleControlsProps {
  onBackToMap: () => void;
}

const DIFFICULTY_LABELS = {
  squire: { text: 'Squire Challenge', color: '#4ade80' },
  knight: { text: 'Knight Challenge', color: '#38bdf8' },
  bishop: { text: 'Bishop Challenge', color: '#fbbf24' },
};

export default function PuzzleControls({ onBackToMap }: PuzzleControlsProps) {
  const {
    activePuzzleId,
    puzzleSolved,
    puzzleHintsUsed,
    resetActivePuzzle,
    exitPuzzleMode,
    usePuzzleHint,
    startPuzzle,
  } = useGameStore();

  const puzzle = PUZZLES.find((p) => p.id === activePuzzleId);

  if (!puzzle) {
    return (
      <div className={styles.container}>
        <p className={styles.noActive}>No active quest details loaded.</p>
        <button className="btn btn-ghost btn-full" onClick={onBackToMap}>
          🗺️ Return to Map
        </button>
      </div>
    );
  }

  const currentIdx = PUZZLES.findIndex((p) => p.id === puzzle.id);
  const nextPuzzle = currentIdx < PUZZLES.length - 1 ? PUZZLES[currentIdx + 1] : null;

  const handleNextQuest = () => {
    if (nextPuzzle) {
      startPuzzle(nextPuzzle.id);
    }
  };

  const handleLeaveQuest = () => {
    exitPuzzleMode();
    onBackToMap();
  };

  const diff = DIFFICULTY_LABELS[puzzle.difficulty] || DIFFICULTY_LABELS.squire;

  return (
    <div className={styles.container}>
      {/* Active Header */}
      <div className={styles.header}>
        <span className={styles.category}>🛡️ active quest 🛡️</span>
        <h3 className={styles.title}>{puzzle.title}</h3>
        <span className={styles.difficulty} style={{ color: diff.color }}>
          {diff.text}
        </span>
      </div>

      {/* solved success card */}
      {puzzleSolved ? (
        <div className={styles.victoryCard}>
          <div className={styles.victoryEmoji}>🏆</div>
          <h4 className={styles.victoryTitle}>Quest Solved!</h4>
          <p className={styles.victoryDesc}>Fantastic! You found the correct combination.</p>
          <div className={styles.rewardBadge}>🪙 +{puzzle.reward} Gold awarded!</div>

          <div className={styles.victoryActions}>
            {nextPuzzle ? (
              <button className="btn btn-primary btn-full" onClick={handleNextQuest}>
                ⚔️ Next Quest!
              </button>
            ) : (
              <div className={styles.finalVictory}>🎉 You have solved all quests on the map!</div>
            )}
            <button className="btn btn-secondary btn-full" onClick={handleLeaveQuest}>
              🗺️ Map Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quest story info */}
          <div className={styles.questDetails}>
            <p className={styles.desc}>{puzzle.description}</p>
            <div className={styles.goldBounty}>Bounty: 🪙 {puzzle.reward} Gold Coins</div>
          </div>

          {/* progressive hints section */}
          <div className={styles.hintsSection}>
            <h4 className={styles.sectionTitle}>💡 Spell Hints</h4>
            {puzzleHintsUsed === 0 ? (
              <p className={styles.noHints}>Need magic assistance? Unlock a hint below!</p>
            ) : (
              <div className={styles.hintsList}>
                {puzzle.hints.slice(0, puzzleHintsUsed).map((hint, idx) => (
                  <div key={idx} className={styles.hintItem}>
                    <span className={styles.hintBullet}>✨</span>
                    <p className={styles.hintText}>{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {puzzleHintsUsed < puzzle.hints.length && (
              <button className={styles.unlockHintBtn} onClick={usePuzzleHint}>
                🔮 Reveal Hint ({puzzleHintsUsed}/{puzzle.hints.length})
              </button>
            )}
          </div>

          {/* standard control buttons */}
          <div className={styles.controlsActions}>
            <button className="btn btn-ghost btn-full" onClick={resetActivePuzzle}>
              🔄 Restart Quest
            </button>
            <button className="btn btn-danger btn-full" onClick={handleLeaveQuest}>
              🏳️ Retreat to Map
            </button>
          </div>
        </>
      )}
    </div>
  );
}
