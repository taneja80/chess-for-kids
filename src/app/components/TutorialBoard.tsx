'use client';

import React, { useState, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import styles from './TutorialBoard.module.css';

// ──────────────────────────────────────────────
// Types & Constants
// ──────────────────────────────────────────────
export interface QuestConfig {
  id: string;
  mode: 'click_sequence' | 'move_piece';
  fen: string;
  instruction: string;
  targets: string[]; // Squares they need to click or pieces to capture in order
}

interface TutorialBoardProps {
  quest: QuestConfig;
  onSuccess: () => void;
}

const PIECE_UNICODE: Record<string, string> = {
  wk: '♚', wq: '♛', wr: '♜', wb: '♝', wn: '♞', wp: '♟',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const PIECE_NAMES: Record<string, string> = {
  k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function TutorialBoard({ quest, onSuccess }: TutorialBoardProps) {
  // Lazily initialize local Chess engine instance based on quest FEN
  // Since parent keys this component with quest.id, state resets automatically on lesson change
  const [chess] = useState(() => new Chess(quest.fen));
  const [fen, setFen] = useState(() => chess.fen());
  
  // Selection state (only used in move_piece mode)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Quest tracking state
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [clickedSquares, setClickedSquares] = useState<string[]>([]);
  const [questSuccess, setQuestSuccess] = useState<boolean>(false);
  const [wizardHint, setWizardHint] = useState<string | null>(null);

  // Handle successful completion
  const handleSuccess = useCallback(() => {
    setQuestSuccess(true);
    // Slight delay before unlocking to let the success animation play
    const timer = setTimeout(() => {
      onSuccess();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onSuccess]);

  // Click Sequence Mode (Board lesson)
  const handleClickSequence = useCallback((square: string) => {
    const expected = quest.targets[progressIndex];
    if (square === expected) {
      const nextProgress = progressIndex + 1;
      setClickedSquares((prev) => [...prev, square]);
      setProgressIndex(nextProgress);
      setWizardHint(`🌟 Brilliant! You found ${square.toUpperCase()}!`);

      if (nextProgress === quest.targets.length) {
        handleSuccess();
      }
    } else {
      // Mistake: reset sequence
      setClickedSquares([]);
      setProgressIndex(0);
      setWizardHint(`❌ Oops! That was ${square.toUpperCase()}. Try to find ${expected.toUpperCase()}!`);
    }
  }, [quest.targets, progressIndex, handleSuccess]);

  // Piece Move Mode (All other lessons)
  const handleMovePiece = useCallback((square: Square) => {
    // 1. If clicking already selected square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // 2. If a square was selected and clicked square is in valid moves - make the move!
    if (selectedSquare && validMoves.includes(square)) {
      // Determine if a promotion is needed
      const piece = chess.get(selectedSquare);
      let promotionPiece: string | undefined;
      if (piece?.type === 'p') {
        const targetRank = square[1];
        if (targetRank === '8' || targetRank === '1') {
          promotionPiece = 'q'; // Auto-promote to Queen for tutorial simplicity
        }
      }

      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: promotionPiece,
        }) as Move;

        if (move) {
          // Update game engine state
          setFen(chess.fen());
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setValidMoves([]);

          // Validate quest progress
          const expectedTarget = quest.targets[progressIndex];

          if (quest.id === 'check') {
            // Checkmate lesson expects a move resulting in checkmate
            if (chess.isCheckmate()) {
              setProgressIndex(1);
              setWizardHint('🏆 Incredible! Checkmate delivered!');
              handleSuccess();
            } else {
              // Undo move if it doesn't solve checkmate
              chess.undo();
              setFen(chess.fen());
              setLastMove(null);
              setWizardHint('⚠️ Nice try, but the King can still escape! Try to cover all escape routes.');
            }
          } else {
            // Standard piece tutorials check if they captured/visited the expected target
            const visitedExpected = square === expectedTarget;
            
            if (visitedExpected) {
              const nextProgress = progressIndex + 1;
              setProgressIndex(nextProgress);
              setWizardHint(`⚔️ Splendid move! Captured/landed on ${square.toUpperCase()}!`);

              if (nextProgress === quest.targets.length) {
                handleSuccess();
              }
            } else {
              // If they made a move that didn't capture/visit the target
              // For pawn promotion, let's check if the final target is met
              if (quest.id === 'pawn' && progressIndex === 1 && square === 'c8') {
                setProgressIndex(2);
                handleSuccess();
              } else {
                // If it's a random move, alert them
                setWizardHint(`🤔 Good move, but try targeting the piece on ${expectedTarget.toUpperCase()} next!`);
              }
            }
          }
        }
      } catch {
        setSelectedSquare(null);
        setValidMoves([]);
        setWizardHint('⚠️ That is not a legal move! Try again.');
      }
      return;
    }

    // 3. Otherwise, select the piece if it is White
    const piece = chess.get(square);
    if (piece && piece.color === 'w') {
      const moves = chess.moves({ square, verbose: true }) as Move[];
      const destinations = moves.map(m => m.to as Square);
      setSelectedSquare(square);
      setValidMoves(destinations);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [selectedSquare, validMoves, chess, quest, progressIndex, handleSuccess]);

  const handleSquareClick = useCallback((square: Square) => {
    if (questSuccess) return;

    if (quest.mode === 'click_sequence') {
      handleClickSequence(square);
    } else {
      handleMovePiece(square);
    }
  }, [quest.mode, questSuccess, handleClickSequence, handleMovePiece]);

  return (
    <div className={styles.boardWrapper}>
      {/* Target coordinates helper text */}
      <div className={styles.questInstruction}>
        🧙‍♂️ <span>{wizardHint || quest.instruction}</span>
        {quest.mode === 'click_sequence' && (
          <div className={styles.questProgress}>
            🎯 Targets found: {progressIndex} / {quest.targets.length}
          </div>
        )}
        {quest.mode === 'move_piece' && quest.id !== 'check' && (
          <div className={styles.questProgress}>
            🎯 Targets remaining: {quest.targets.length - progressIndex}
          </div>
        )}
      </div>

      <div className={styles.boardContainer}>
        {/* We key the grid container by fen to trigger re-renders & animations when FEN changes */}
        <div className={styles.board} key={fen}>
          {RANKS.map((rank, ri) =>
            FILES.map((file, fi) => {
              const square = `${file}${rank}` as Square;
              const isLight = (ri + fi) % 2 === 0;
              const piece = chess.get(square);
              
              const isSelected = selectedSquare === square;
              const isValidMove = validMoves.includes(square);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isInCheck = chess.isCheck() && piece?.type === 'k' && piece?.color === 'w';

              // Quest visuals
              const isNextTarget = quest.mode === 'click_sequence' && quest.targets[progressIndex] === square;
              const isVisited = quest.mode === 'click_sequence' && clickedSquares.includes(square);

              const squareClasses = [
                styles.square,
                isLight ? styles.light : styles.dark,
                isSelected ? styles.selected : '',
                isLastMoveFrom || isLastMoveTo ? styles.lastMove : '',
                isInCheck ? styles.inCheck : '',
                isNextTarget ? styles.targetHighlight : '',
                isVisited ? styles.visited : '',
              ].filter(Boolean).join(' ');

              const pieceKey = piece && quest.mode !== 'click_sequence' ? `${piece.color}${piece.type}` : null;

              return (
                <div
                  key={square}
                  id={`tutorial-square-${square}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(square)}
                  role="button"
                  aria-label={`${square}${piece ? ` ${PIECE_NAMES[piece.type]} ${piece.color === 'w' ? 'white' : 'black'}` : ''}`}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleSquareClick(square)}
                >
                  {/* Valid move indicator */}
                  {isValidMove && (
                    <div className={piece ? styles.captureRing : styles.validDot} />
                  )}

                  {/* Chess piece */}
                  {pieceKey && (
                    <span
                      className={[
                        styles.piece,
                        piece?.color === 'w' ? styles.whitePiece : styles.blackPiece,
                        isSelected ? styles.pieceSelected : '',
                      ].filter(Boolean).join(' ')}
                      aria-hidden="true"
                    >
                      {PIECE_UNICODE[pieceKey]}
                    </span>
                  )}

                  {/* Row/File Labels */}
                  {fi === 0 && (
                    <span className={styles.cornerRank}>{rank}</span>
                  )}
                  {ri === 7 && (
                    <span className={styles.cornerFile}>{file}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quest Success Screen */}
        {questSuccess && (
          <div className={styles.successOverlay}>
            <span className={styles.goldStar}>⭐</span>
            <h3 className={styles.successTitle}>Quest Complete!</h3>
            <p className={styles.successDesc}>Excellent play, Squire! You are mastering the royal game!</p>
          </div>
        )}
      </div>
    </div>
  );
}
