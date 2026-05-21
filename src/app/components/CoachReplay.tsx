'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { useGameStore } from '../../lib/gameStore';
import { classifyMove } from '../../lib/moveQuality';
import { detectMotif } from '../../lib/motifs';
import styles from './CoachReplay.module.css';

interface CoachReplayProps {
  open: boolean;
  onClose: () => void;
}

interface ReplayFrame {
  ply: number;        // 1-based ply number
  san: string;
  from: string;
  to: string;
  color: 'w' | 'b';
  fenAfter: string;
  qualityLabel: string;
  qualityColor: string;
  qualityIcon: string;
  motifTitle: string | null;
  motifExplanation: string | null;
}

/**
 * Render a tiny 8×8 board preview for a given FEN snapshot.
 * Lightweight — we just paint divs with chess unicode glyphs.
 */
function MiniBoard({ fen, lastFrom, lastTo, playerColor }: { fen: string; lastFrom?: string; lastTo?: string; playerColor: 'w' | 'b' }) {
  const PIECE_UNI: Record<string, string> = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
  };
  const c = new Chess(fen);
  const board = c.board();
  const rows = playerColor === 'b' ? [...board].reverse() : board;
  return (
    <div className={styles.mini}>
      {rows.map((row, rIdx) => {
        const cells = playerColor === 'b' ? [...row].reverse() : row;
        return cells.map((cell, cIdx) => {
          // Reconstruct algebraic square based on orientation
          const file = playerColor === 'b' ? String.fromCharCode(104 - cIdx) : String.fromCharCode(97 + cIdx);
          const rank = playerColor === 'b' ? String(rIdx + 1) : String(8 - rIdx);
          const sq = file + rank;
          const isLight = (rIdx + cIdx) % 2 === 0;
          const highlight = sq === lastFrom || sq === lastTo;
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={[
                styles.miniSq,
                isLight ? styles.miniLight : styles.miniDark,
                highlight ? styles.miniHighlight : '',
              ].join(' ')}
            >
              {cell ? PIECE_UNI[cell.color + cell.type] : ''}
            </div>
          );
        });
      })}
    </div>
  );
}

export default function CoachReplay({ open, onClose }: CoachReplayProps) {
  const { moveHistory, history, playerColor } = useGameStore();
  const [idx, setIdx] = useState(0);

  // Re-derive the replay frames whenever the modal opens.
  const frames: ReplayFrame[] = useMemo(() => {
    if (!open || moveHistory.length === 0) return [];
    const result: ReplayFrame[] = [];
    // Start from the initial FEN (history[0])
    const cursor = new Chess(history[0]);
    moveHistory.forEach((mv, i) => {
      const fenBefore = cursor.fen();
      let movedMv: Move | null = null;
      try {
        movedMv = cursor.move(mv.san);
      } catch {
        return;
      }
      if (!movedMv) return;

      // Re-create temporary "after" chess to feed motif/quality detectors
      const chessAfter = new Chess(cursor.fen());
      const chessBeforeForMotif = new Chess(fenBefore);
      const quality = movedMv.color === playerColor ? classifyMove(chessAfter, movedMv, playerColor) : null;
      const motif = movedMv.color === playerColor ? detectMotif(chessBeforeForMotif, chessAfter, movedMv, playerColor) : null;

      result.push({
        ply: i + 1,
        san: movedMv.san.toUpperCase(),
        from: movedMv.from,
        to: movedMv.to,
        color: movedMv.color as 'w' | 'b',
        fenAfter: cursor.fen(),
        qualityLabel: quality?.label || (movedMv.color === playerColor ? 'Ok Move' : 'AI Reply'),
        qualityColor: quality?.color || (movedMv.color === playerColor ? '#94a3b8' : '#a78bfa'),
        qualityIcon: quality?.icon || (movedMv.color === playerColor ? '♟️' : '🤖'),
        motifTitle: motif?.title || null,
        motifExplanation: motif?.explanation || null,
      });
    });
    return result;
  }, [open, moveHistory, history, playerColor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setIdx(0);
  }, [open]);

  if (!open) return null;

  if (frames.length === 0) {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles.title}>📜 Game Review</h2>
          <p className={styles.empty}>No moves were played in this game.</p>
          <button className={`btn btn-gold ${styles.closeBtn}`} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const frame = frames[idx];
  const turnLabel = frame.color === playerColor ? 'YOUR MOVE' : "WIZARD'S REPLY";

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>📜 Game Review</h2>
          <button type="button" className={styles.dismiss} onClick={onClose} aria-label="Close replay">✕</button>
        </header>

        <div className={styles.body}>
          <MiniBoard
            fen={frame.fenAfter}
            lastFrom={frame.from}
            lastTo={frame.to}
            playerColor={playerColor}
          />

          <div className={styles.commentary}>
            <div className={styles.metaRow}>
              <span className={styles.plyNum}>Move {Math.ceil(frame.ply / 2)}{frame.color === 'w' ? '.' : '…'}</span>
              <span className={styles.turnLabel}>{turnLabel}</span>
            </div>
            <div className={styles.sanRow}>
              <code className={styles.san}>{frame.san}</code>
              <span
                className={styles.qBadge}
                style={{ backgroundColor: frame.qualityColor }}
              >
                <span>{frame.qualityIcon}</span>
                <span>{frame.qualityLabel}</span>
              </span>
            </div>

            {frame.motifTitle && frame.motifExplanation && (
              <div className={styles.motifBox}>
                <div className={styles.motifTitle}>💡 {frame.motifTitle}</div>
                <div className={styles.motifText}>{frame.motifExplanation}</div>
              </div>
            )}

            {!frame.motifTitle && frame.color === playerColor && (
              <p className={styles.helperText}>
                {frame.qualityLabel === 'Blunder!'
                  ? '⚠️ Try to spot squares where your piece would be attacked with no defenders.'
                  : frame.qualityLabel === 'Risky'
                  ? '🤔 Look for moves where you have more defenders than enemies attack.'
                  : '✨ Solid! Keep developing your pieces toward the centre.'}
              </p>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={`btn btn-ghost ${styles.navBtn}`}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            ← Prev
          </button>
          <span className={styles.progress}>{idx + 1} / {frames.length}</span>
          <button
            type="button"
            className={`btn btn-gold ${styles.navBtn}`}
            onClick={() => setIdx((i) => Math.min(frames.length - 1, i + 1))}
            disabled={idx === frames.length - 1}
          >
            Next →
          </button>
        </footer>
      </div>
    </div>
  );
}
