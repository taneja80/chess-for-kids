'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import { ENDGAME_DRILLS } from '../../lib/endgameDrills';
import styles from './EndgameTrainer.module.css';

interface EndgameTrainerProps {
  onEnterDrill: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#38bdf8',
  advanced: '#fbbf24',
};

export default function EndgameTrainer({ onEnterDrill }: EndgameTrainerProps) {
  const { startEndgame } = useGameStore();

  const handleStart = (id: string) => {
    startEndgame(id);
    onEnterDrill();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>🛡️ Endgame Trainer</h2>
        <p className={styles.subtitle}>
          Practice the four mating patterns every chess player must know. The lone enemy King will dodge —
          chase it down and deliver checkmate before the par-move count to earn a 2× gold bonus!
        </p>
      </header>

      <div className={styles.grid}>
        {ENDGAME_DRILLS.map((drill) => (
          <article key={drill.id} className={styles.card} data-difficulty={drill.difficulty}>
            <div className={styles.cardTop}>
              <span className={styles.cardIcon}>{drill.icon}</span>
              <span
                className={styles.cardDifficulty}
                style={{ color: DIFFICULTY_COLORS[drill.difficulty] }}
              >
                {drill.difficulty.toUpperCase()}
              </span>
            </div>
            <h3 className={styles.cardTitle}>{drill.title}</h3>
            <p className={styles.cardDesc}>{drill.description}</p>
            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>🎯 Par: {drill.parMoves} moves</span>
              <span className={styles.metaItem}>🪙 {drill.reward} gold ({drill.reward * 2} bonus)</span>
            </div>
            <button
              type="button"
              id={`btn-start-drill-${drill.id}`}
              className={`btn btn-gold ${styles.startBtn}`}
              onClick={() => handleStart(drill.id)}
            >
              ⚔️ Start Drill
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
