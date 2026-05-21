'use client';

import React, { useCallback, useMemo } from 'react';
import { Square } from 'chess.js';
import { motion } from 'framer-motion';
import { useGameStore } from '../../lib/gameStore';
import { calculateTerritory } from '../../lib/territory';
import styles from './ChessBoard.module.css';

// ──────────────────────────────────────────────
// Chess Piece SVG Unicode renderer
// ──────────────────────────────────────────────
const PIECE_UNICODE: Record<string, string> = {
  wk: '♚', wq: '♛', wr: '♜', wb: '♝', wn: '♞', wp: '♟',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const PIECE_NAMES: Record<string, string> = {
  k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function ChessBoard() {
  const {
    chess,
    fen,
    selectedSquare,
    validMoves,
    lastMove,
    playerColor,
    aiThinking,
    selectSquare,
    currentTheme,
    showHeatmap,
    lastMoveQuality,
    lastMoveQualityAt,
  } = useGameStore();

  // Flip board if playing as black
  const displayRanks = playerColor === 'b' ? [...RANKS].reverse() : RANKS;
  const displayFiles = playerColor === 'b' ? [...FILES].reverse() : FILES;

  // Compute the slide offset (in board-cell percentages) for the piece on
  // `lastMove.to` so framer-motion can animate it from `lastMove.from`.
  const slideOffset = useMemo(() => {
    if (!lastMove) return null;
    const fromFileIdx = displayFiles.indexOf(lastMove.from[0]);
    const fromRankIdx = displayRanks.indexOf(lastMove.from[1]);
    const toFileIdx = displayFiles.indexOf(lastMove.to[0]);
    const toRankIdx = displayRanks.indexOf(lastMove.to[1]);
    if (fromFileIdx < 0 || toFileIdx < 0 || fromRankIdx < 0 || toRankIdx < 0) return null;
    return {
      x: `${(fromFileIdx - toFileIdx) * 100}%`,
      y: `${(fromRankIdx - toRankIdx) * 100}%`,
    };
  }, [lastMove, displayFiles, displayRanks]);

  // Calculate territory control for all squares — depend on FEN so it recomputes
  // every move (the `chess` object is mutated in place by chess.js, so depending on
  // `chess` alone would give stale memoized results).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const territory = useMemo(() => calculateTerritory(chess), [fen]);

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (aiThinking) return;
      if (chess.turn() !== playerColor) return;
      selectSquare(square);
    },
    [aiThinking, chess, playerColor, selectSquare]
  );

  return (
    <div className={styles.boardWrapper} aria-label="Chess board" data-board-theme={currentTheme}>
      {/* Rank labels (left) */}
      <div className={styles.rankLabels}>
        {displayRanks.map(rank => (
          <span key={rank} className={styles.rankLabel}>{rank}</span>
        ))}
      </div>

      <div className={styles.boardContainer}>
        <div className={styles.board}>
          {displayRanks.map((rank, ri) =>
            displayFiles.map((file, fi) => {
              const square = `${file}${rank}` as Square;
              const isLight = (ri + fi) % 2 === 0;
              const piece = chess.get(square);
              const isSelected = selectedSquare === square;
              const isValidMove = validMoves.includes(square);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isInCheck = chess.isCheck() && piece?.type === 'k' && piece?.color === chess.turn();

              const squareClasses = [
                styles.square,
                isLight ? styles.light : styles.dark,
                isSelected ? styles.selected : '',
                isLastMoveFrom || isLastMoveTo ? styles.lastMove : '',
                isInCheck ? styles.inCheck : '',
              ].filter(Boolean).join(' ');

              const pieceKey = piece ? `${piece.color}${piece.type}` : null;

              // Compute control for heatmap
              let controlClass = '';
              const sqControl = territory[square];
              if (sqControl) {
                const friendlyControls = playerColor === 'w' ? sqControl.whiteControls : sqControl.blackControls;
                const opponentControls = playerColor === 'w' ? sqControl.blackControls : sqControl.whiteControls;

                if (friendlyControls > opponentControls) {
                  controlClass = styles.controlFriendly;
                } else if (opponentControls > friendlyControls) {
                  controlClass = styles.controlOpponent;
                } else if (friendlyControls > 0 && friendlyControls === opponentControls) {
                  controlClass = styles.controlContested;
                }
              }

              // Compute custom piece protection/threat aura
              let hasShield = false;
              let hasCrosshair = false;
              if (piece && piece.color === playerColor) {
                if (sqControl) {
                  const friendlyControls = playerColor === 'w' ? sqControl.whiteControls : sqControl.blackControls;
                  const opponentControls = playerColor === 'w' ? sqControl.blackControls : sqControl.whiteControls;
                  
                  if (friendlyControls > 0) {
                    hasShield = true;
                  } else if (opponentControls > 0 && friendlyControls === 0) {
                    hasCrosshair = true;
                  }
                }
              }

              return (
                <div
                  key={square}
                  id={`square-${square}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(square)}
                  role="button"
                  aria-label={`${square}${piece ? ` ${PIECE_NAMES[piece.type]} ${piece.color === 'w' ? 'white' : 'black'}` : ''}`}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleSquareClick(square)}
                >
                  {/* Heatmap overlay */}
                  {showHeatmap && controlClass && (
                    <div className={`${styles.heatmapOverlay} ${controlClass}`} aria-hidden="true" />
                  )}

                  {/* Valid move indicator */}
                  {isValidMove && (
                    <div className={piece ? styles.captureRing : styles.validDot} />
                  )}

                  {/* Chess piece */}
                  {pieceKey && (
                    <motion.span
                      key={`${square}-${pieceKey}-${lastMoveQualityAt}`}
                      className={[
                        styles.piece,
                        piece?.color === 'w' ? styles.whitePiece : styles.blackPiece,
                        isSelected ? styles.pieceSelected : '',
                        aiThinking && piece?.color !== playerColor ? styles.pieceAi : '',
                      ].filter(Boolean).join(' ')}
                      aria-hidden="true"
                      initial={isLastMoveTo && slideOffset ? slideOffset : false}
                      animate={{ x: 0, y: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }}
                    >
                      {/* Shield or Crosshair visual overlay around the piece */}
                      {hasShield && <div className={styles.pieceShield} />}
                      {hasCrosshair && <div className={styles.pieceCrosshair} />}

                      {PIECE_UNICODE[pieceKey]}
                    </motion.span>
                  )}

                  {/* Move-quality badge — appears briefly on the destination square */}
                  {isLastMoveTo && lastMoveQuality && (
                    <motion.div
                      key={`mq-${lastMoveQualityAt}`}
                      className={styles.qualityBadge}
                      style={{ backgroundColor: lastMoveQuality.color, color: '#1a0f2e' }}
                      initial={{ opacity: 0, y: 8, scale: 0.7 }}
                      animate={{ opacity: 1, y: -34, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <span className={styles.qualityIcon}>{lastMoveQuality.icon}</span>
                      <span className={styles.qualityLabel}>{lastMoveQuality.label}</span>
                    </motion.div>
                  )}

                  {/* Corner labels for a1 rank/file (display files UPPERCASED for kids) */}
                  {fi === 0 && (
                    <span className={styles.cornerRank}>{rank}</span>
                  )}
                  {ri === 7 && (
                    <span className={styles.cornerFile}>{file.toUpperCase()}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* AI Thinking overlay */}
        {aiThinking && (
          <div className={styles.aiOverlay}>
            <div className={styles.aiThinkingBubble}>
              <span className={styles.aiSpinner}>🧙‍♂️</span>
              <span>Wizard is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* File labels (bottom) — uppercase like a real chess board ledger */}
      <div className={styles.fileLabelsRow}>
        <div className={styles.fileLabels}>
          {displayFiles.map(file => (
            <span key={file} className={styles.fileLabel}>{file.toUpperCase()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
