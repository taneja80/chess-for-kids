'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './TimeSpellModal.module.css';

export default function TimeSpellModal() {
  const {
    pendingTimeSpell,
    timeSpellsRemaining,
    castTimeSpell,
    declineTimeSpell,
  } = useGameStore();

  if (!pendingTimeSpell) return null;

  // Display the move in uppercase like a chess scoresheet (KIDS prefer big letters).
  const opponentMoveSan = (pendingTimeSpell.opponentMove?.san || 'a strong move').toUpperCase();

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalCard}>
        <div className={styles.wizardSection}>
          <span className={styles.wizardEmoji}>🧙‍♂️</span>
          <div className={styles.speechBubble}>
            <p className={styles.bubbleText}>
              &ldquo;Halt, young Apprentice! 🧙‍♂️ Merlin sees a dark rift in the timeline! If you leave your piece here, the opponent can retaliate immediately with <strong className={styles.highlightMove}>{opponentMoveSan}</strong>!&rdquo;
            </p>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2 id="modal-title" className={styles.title}>🔮 Temporal Foresight Warning</h2>
          <p className={styles.description}>
            You made an impulsive move. You have <strong className={styles.highlightCount}>{timeSpellsRemaining}</strong> Time Spell{timeSpellsRemaining !== 1 ? 's' : ''} left. Do you want to cast a spell to peek into the future and rewind the board?
          </p>
        </div>

        <div className={styles.buttonContainer}>
          <button
            onClick={castTimeSpell}
            className={`${styles.modalBtn} ${styles.btnSpell}`}
            title="Use one Time Spell to play the AI move, see the outcome, and automatically rewind back to your turn!"
          >
            <span className={styles.btnIcon}>⏳</span>
            <div className={styles.btnTextContent}>
              <span className={styles.btnTitle}>Cast Time Spell</span>
              <span className={styles.btnSubtitle}>Consumes 1 Charge ({timeSpellsRemaining} left)</span>
            </div>
          </button>

          <button
            onClick={declineTimeSpell}
            className={`${styles.modalBtn} ${styles.btnProceed}`}
            title="Let the AI play its move and face the consequences"
          >
            <span className={styles.btnIcon}>⚔️</span>
            <div className={styles.btnTextContent}>
              <span className={styles.btnTitle}>No, I am Brave!</span>
              <span className={styles.btnSubtitle}>Proceed and let AI take its turn</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
