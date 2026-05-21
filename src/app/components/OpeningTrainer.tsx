'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import { OPENINGS } from '../../lib/openings';
import styles from './OpeningTrainer.module.css';

interface OpeningTrainerProps {
  onEnterOpening: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#38bdf8',
  advanced: '#fbbf24',
};

export default function OpeningTrainer({ onEnterOpening }: OpeningTrainerProps) {
  const { startOpening } = useGameStore();

  const handleStart = (id: string) => {
    startOpening(id);
    onEnterOpening();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>📚 Opening Trainer</h2>
        <p className={styles.subtitle}>
          Learn the five most famous chess openings the way the masters did — one move at a time.
          The wizard will guide you through each book move and explain WHY it works.
        </p>
      </header>

      <div className={styles.grid}>
        {OPENINGS.map((op) => (
          <article key={op.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.eraTag}>{op.era}</div>
              <span
                className={styles.diffTag}
                style={{ color: DIFFICULTY_COLORS[op.difficulty] }}
              >
                {op.difficulty.toUpperCase()}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{op.name}</h3>
            <p className={styles.cardDesc}>{op.description}</p>

            <div className={styles.movesPreview}>
              {op.steps.slice(0, 3).map((s, i) => (
                <span key={i} className={styles.moveChip}>{s.san.toUpperCase()}</span>
              ))}
              <span className={styles.moveDots}>…</span>
            </div>

            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>📖 {op.steps.length} moves</span>
              <span className={styles.metaItem}>🪙 {op.reward} gold</span>
            </div>

            <button
              type="button"
              id={`btn-start-opening-${op.id}`}
              className={`btn btn-gold ${styles.startBtn}`}
              onClick={() => handleStart(op.id)}
            >
              📖 Learn This Opening
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
