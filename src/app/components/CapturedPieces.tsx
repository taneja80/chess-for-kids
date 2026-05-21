'use client';

import React from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './CapturedPieces.module.css';

const PIECE_UNICODE: Record<string, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

// Order pieces top-to-bottom by value so the stack reads big-to-small.
const PIECE_ORDER: Record<string, number> = { q: 0, r: 1, b: 2, n: 3, p: 4, k: 5 };

const PIECE_VALUES: Record<string, number> = {
  q: 9, r: 5, b: 3, n: 3, p: 1, k: 0,
};

const PIECE_NAMES: Record<string, string> = {
  q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn', k: 'King',
};

interface StackProps {
  pieces: string[];
  pieceClass: string;
  emptyText: string;
}

function PieceStack({ pieces, pieceClass, emptyText }: StackProps) {
  if (pieces.length === 0) {
    return <span className={styles.empty}>{emptyText}</span>;
  }
  // Sort largest-first so the stack reads visually like a trophy pile.
  const sorted = [...pieces].sort((a, b) => (PIECE_ORDER[a] ?? 9) - (PIECE_ORDER[b] ?? 9));
  return (
    <div className={styles.stack}>
      {sorted.map((p, i) => (
        <span
          key={`${p}-${i}`}
          className={`${styles.stackPiece} ${pieceClass}`}
          style={{ marginLeft: i === 0 ? 0 : '-9px', zIndex: 20 - i }}
          title={PIECE_NAMES[p]}
        >
          {PIECE_UNICODE[p]}
        </span>
      ))}
    </div>
  );
}

export default function CapturedPieces() {
  const { capturedPieces, playerColor } = useGameStore();

  const myCaptures = capturedPieces[playerColor];
  const aiCaptures = capturedPieces[playerColor === 'w' ? 'b' : 'w'];

  const score = (pieces: string[]) =>
    pieces.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);

  const myScore = score(myCaptures);
  const aiScore = score(aiCaptures);
  const advantage = myScore - aiScore;

  const myPieceClass = playerColor === 'w' ? styles.pieceDark : styles.pieceLight;
  const aiPieceClass = playerColor === 'w' ? styles.pieceLight : styles.pieceDark;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={styles.headerLabel}>BATTLE TROPHIES</span>
        {advantage !== 0 && (
          <span
            className={[
              styles.materialBadge,
              advantage > 0 ? styles.materialPositive : styles.materialNegative,
            ].join(' ')}
            title={`Material advantage: ${advantage > 0 ? '+' : ''}${advantage}`}
          >
            {advantage > 0 ? `+${advantage}` : advantage}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <span className={styles.label}>YOU</span>
        <PieceStack pieces={myCaptures} pieceClass={myPieceClass} emptyText="No trophies yet" />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>AI</span>
        <PieceStack pieces={aiCaptures} pieceClass={aiPieceClass} emptyText="No trophies yet" />
      </div>
    </div>
  );
}
