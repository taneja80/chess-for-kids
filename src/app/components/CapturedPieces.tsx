'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './CapturedPieces.module.css';

const PIECE_UNICODE: Record<string, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

// Piece values for score calculation
const PIECE_VALUES: Record<string, number> = {
  q: 9, r: 5, b: 3, n: 3, p: 1, k: 0,
};

export default function CapturedPieces() {
  const { capturedPieces, playerColor } = useGameStore();

  // capturedPieces.w = pieces captured BY white (opponent's pieces that white took)
  const myCaptures  = capturedPieces[playerColor];
  const aiCaptures  = capturedPieces[playerColor === 'w' ? 'b' : 'w'];

  const score = (pieces: string[]) =>
    pieces.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);

  const myScore = score(myCaptures);
  const aiScore = score(aiCaptures);
  const advantage = myScore - aiScore;

  // Pieces I captured are the OPPONENT's color, and vice-versa.
  // (`pieceLight` renders glyphs in white, `pieceDark` in dark — match to actual piece color.)
  const myPieceClass = playerColor === 'w' ? styles.pieceDark : styles.pieceLight;
  const aiPieceClass = playerColor === 'w' ? styles.pieceLight : styles.pieceDark;

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <span className={styles.label}>You captured:</span>
        <div className={styles.pieces}>
          {myCaptures.length === 0
            ? <span className={styles.empty}>—</span>
            : myCaptures.map((p, i) => (
                <span key={i} className={`${styles.piece} ${myPieceClass}`}>
                  {PIECE_UNICODE[p]}
                </span>
              ))
          }
        </div>
        <span className={styles.score}>+{myScore}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>AI captured:</span>
        <div className={styles.pieces}>
          {aiCaptures.length === 0
            ? <span className={styles.empty}>—</span>
            : aiCaptures.map((p, i) => (
                <span key={i} className={`${styles.piece} ${aiPieceClass}`}>
                  {PIECE_UNICODE[p]}
                </span>
              ))
          }
        </div>
        <span className={styles.score}>+{aiScore}</span>
      </div>
      {advantage !== 0 && (
        <div className={styles.advantage}>
          {advantage > 0
            ? <span className={styles.advantagePositive}>▲ You lead by {advantage}</span>
            : <span className={styles.advantageNegative}>▼ AI leads by {Math.abs(advantage)}</span>
          }
        </div>
      )}
    </div>
  );
}
