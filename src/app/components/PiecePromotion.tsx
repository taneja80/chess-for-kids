'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './PiecePromotion.module.css';

const PROMOTION_PIECES = [
  { type: 'q', name: 'Queen',  icon: '♛' },
  { type: 'r', name: 'Rook',   icon: '♜' },
  { type: 'b', name: 'Bishop', icon: '♝' },
  { type: 'n', name: 'Knight', icon: '♞' },
];

export default function PiecePromotion() {
  const { pendingPromotion, makeMove, playerColor } = useGameStore();

  if (!pendingPromotion) return null;

  const handleSelect = (type: string) => {
    makeMove(pendingPromotion.from, pendingPromotion.to, type);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Pawn Promotion">
      <div className={styles.modal}>
        <div className={styles.title}>
          <span>✨</span>
          <span>Pawn Promotion!</span>
          <span>✨</span>
        </div>
        <p className={styles.subtitle}>
          Your brave pawn has reached the end! Choose its new power:
        </p>
        <div className={styles.choices}>
          {PROMOTION_PIECES.map(piece => (
            <button
              key={piece.type}
              id={`promote-${piece.type}`}
              className={styles.choiceBtn}
              onClick={() => handleSelect(piece.type)}
              aria-label={`Promote to ${piece.name}`}
            >
              <span className={[
                styles.pieceIcon,
                playerColor === 'w' ? styles.whitePiece : styles.blackPiece
              ].join(' ')}>
                {piece.icon}
              </span>
              <span className={styles.pieceName}>{piece.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
