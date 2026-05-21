'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../lib/gameStore';
import { Square } from 'chess.js';
import { initStockfish, getStockfishMove, terminateStockfish } from '../../lib/stockfish';
import ChessBoard from '../components/ChessBoard';
import WizardCoach from '../components/WizardCoach';
import GameControls from '../components/GameControls';
import BadgesPanel from '../components/BadgesPanel';
import CapturedPieces from '../components/CapturedPieces';
import PiecePromotion from '../components/PiecePromotion';
import TimeSpellModal from '../components/TimeSpellModal';
import ArmouryShop from '../components/ArmouryShop';
import QuestMap from '../components/QuestMap';
import PuzzleControls from '../components/PuzzleControls';
import styles from './page.module.css';

export default function GamePage() {
  const router = useRouter();
  const stockfishReady = useRef(false);
  const [activeTab, setActiveTab] = useState<'arena' | 'quests' | 'armoury'>('arena');

  const {
    chess, fen, phase, mode, playerColor,
    aiThinking, difficulty,
    setAiThinking, makeMove, newGame,
    setWizardMessage,
    moveHistory,
    loadSavedData,
    pendingTimeSpell,
  } = useGameStore();

  // ── Load saved progress & cosmetics on client mount ──
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // ── Init Stockfish on mount ────────────────
  useEffect(() => {
    initStockfish()
      .then(() => { stockfishReady.current = true; })
      .catch(() => {
        // Stockfish WASM not available — graceful fallback (random moves)
        stockfishReady.current = false;
      });
    return () => terminateStockfish();
  }, []);

  // ── Ensure we're in playing state ─────────
  useEffect(() => {
    if (phase === 'home') {
      newGame();
    }
  }, [phase, newGame]);

  // ── AI move trigger ────────────────────────
  const triggerAiMove = useCallback(async () => {
    if (!chess || chess.isGameOver()) return;
    if (chess.turn() === playerColor) return; // it's the player's turn

    setAiThinking(true);

    try {
      const move = await getStockfishMove(chess.fen(), difficulty);
      // Parse 'e2e4' or 'e7e8q' format
      const from = move.slice(0, 2);
      const to   = move.slice(2, 4);
      const promo = move.length === 5 ? move[4] : undefined;
      makeMove(from as Square, to as Square, promo);
    } catch {
      setWizardMessage('The Wizard had trouble thinking. It\'s your turn!', 'warning');
    } finally {
      setAiThinking(false);
    }
  }, [chess, playerColor, difficulty, setAiThinking, makeMove, setWizardMessage]);

  // Watch for turn changes to trigger AI
  useEffect(() => {
    if (phase !== 'playing') return;
    if (mode !== 'vs-ai') return;
    if (pendingTimeSpell) return; // Pause AI when Time Spell warning is active
    if (chess.turn() !== playerColor && !aiThinking) {
      // Small delay for natural feel
      const timer = setTimeout(triggerAiMove, 400);
      return () => clearTimeout(timer);
    }
  }, [fen, phase, mode, chess, playerColor, aiThinking, triggerAiMove, pendingTimeSpell]);

  const isGameOver = phase === 'gameover';

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={`btn btn-ghost ${styles.backBtn}`}
          onClick={() => router.push('/')}
          id="btn-back-home"
        >
          ← Home
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.headerCrown}>♟</span>
          <h1 className={styles.headerText}>Chess for Kids</h1>
          <span className={styles.headerCrown}>♟</span>
        </div>
        <div className={styles.moveCount}>
          <span className={styles.moveLabel}>Moves</span>
          <span className={styles.moveNum}>{moveHistory.length}</span>
        </div>
      </header>

      {/* Tab Navbar */}
      <nav className={styles.tabNavbar}>
        <button
          className={activeTab === 'arena' ? styles.tabNavActive : styles.tabNavBtn}
          onClick={() => setActiveTab('arena')}
        >
          ⚔️ Battle Arena
        </button>
        <button
          className={activeTab === 'quests' ? styles.tabNavActive : styles.tabNavBtn}
          onClick={() => setActiveTab('quests')}
        >
          🗺️ Quest Map
        </button>
        <button
          className={activeTab === 'armoury' ? styles.tabNavActive : styles.tabNavBtn}
          onClick={() => setActiveTab('armoury')}
        >
          🪙 The Armoury
        </button>
      </nav>

      {/* Main layout */}
      <main className={styles.main}>
        {activeTab === 'quests' && (
          <QuestMap onAttemptQuest={() => setActiveTab('arena')} />
        )}
        {activeTab === 'armoury' && (
          <ArmouryShop />
        )}
        {activeTab === 'arena' && (
          <>
            {/* Left panel */}
            <aside className={styles.leftPanel}>
              <WizardCoach />
              <CapturedPieces />
              <BadgesPanel />
            </aside>

            {/* Board area */}
            <div className={styles.boardArea}>
              {mode === 'puzzle' && (
                <div className={styles.puzzleIndicator}>
                  🎯 Active Quest: Solve the Puzzle to Win!
                </div>
              )}
              <ChessBoard />
            </div>

            {/* Right panel */}
            <aside className={styles.rightPanel}>
              {mode === 'puzzle' ? (
                <PuzzleControls onBackToMap={() => setActiveTab('quests')} />
              ) : (
                <GameControls />
              )}
            </aside>
          </>
        )}
      </main>

      {/* Pawn promotion modal */}
      <PiecePromotion />

      {/* Time Spell warn modal */}
      <TimeSpellModal />

      {/* Game Over overlay */}
      {isGameOver && (
        <div className={styles.gameOverlay}>
          <div className={styles.gameOverModal}>
            <div className={styles.gameOverEmoji}>
              {chess.isCheckmate()
                ? (chess.turn() !== playerColor ? '🏆' : '😔')
                : '🤝'}
            </div>
            <h2 className={styles.gameOverTitle}>
              {chess.isCheckmate()
                ? (chess.turn() !== playerColor ? 'You Win!' : 'You Lose!')
                : chess.isDraw() ? 'It\'s a Draw!' : 'Game Over'}
            </h2>
            <p className={styles.gameOverSub}>
              {chess.isCheckmate()
                ? (chess.turn() !== playerColor
                    ? 'Amazing! The kingdom is yours! 🎉'
                    : 'The Wizard wins this time. Keep practicing!')
                : 'A hard-fought battle. Well played!'}
            </p>
            <div className={styles.gameOverBtns}>
              <button
                id="btn-play-again"
                className="btn btn-gold"
                onClick={newGame}
              >
                ⚔️ Play Again
              </button>
              <button
                id="btn-go-home"
                className="btn btn-ghost"
                onClick={() => { router.push('/'); }}
              >
                🏰 Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
