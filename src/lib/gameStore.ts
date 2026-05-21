'use client';

import { create } from 'zustand';
import { Chess, Move, Square } from 'chess.js';
import { Difficulty } from './stockfish';
import { rtdb } from './firebase';
import { ref, set as setDb, onValue, get as getDb, update as updateDb, off } from 'firebase/database';
import { PUZZLES } from './gameData';
import { ENDGAME_DRILLS, EndgameDrill } from './endgameDrills';
import { OPENINGS } from './openings';
import { pickWizardLine } from './wizardVoice';
import { calculateTerritory } from './territory';
import { classifyMove, MoveQuality } from './moveQuality';
import { detectMotif, Motif } from './motifs';
import { getDailyPuzzleId, getTodayDateStr, nextStreak } from './daily';
import { playMove, playCapture, playCheck, playCheckmate, playLoss, playBadge, playCoins, playSelect } from './sounds';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

export type GamePhase = 'home' | 'tutorial' | 'playing' | 'gameover';
export type GameMode  = 'vs-ai' | 'vs-friend' | 'puzzle' | 'endgame' | 'opening';
export type PlayerColor = 'w' | 'b';

export interface CapturedPieces {
  w: string[];  // pieces captured BY white (i.e. black pieces that white took)
  b: string[];  // pieces captured BY black
}

export interface GameState {
  // Core chess
  chess: Chess;
  fen: string;
  history: string[];   // array of FENs for takeback
  moveHistory: Move[]; // SAN moves list

  // Selection
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;

  // Game config
  phase: GamePhase;
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  
  // Multiplayer
  isMultiplayer: boolean;
  roomId: string | null;

  // AI state
  aiThinking: boolean;

  // Captured
  capturedPieces: CapturedPieces;

  // Coins & badges
  goldCoins: number;
  badges: Badge[];

  // Cosmetics & shop
  unlockedThemes: string[];
  currentTheme: string;
  unlockedSkins: string[];
  currentSkin: string;

  // Puzzle progress
  puzzleProgress: Record<string, boolean>;
  activePuzzleId: string | null;
  puzzleSolved: boolean;
  puzzleHintsUsed: number;

  // Wizard coach
  wizardMessage: string | null;
  wizardEmotion: 'happy' | 'warning' | 'sad' | 'excited' | 'idle';

  // Promotion
  pendingPromotion: { from: Square; to: Square } | null;

  // Heatmap & Time Spells
  showHeatmap: boolean;
  timeSpellsRemaining: number;
  pendingTimeSpell: {
    playerMove: { from: Square; to: Square; promotion?: string };
    opponentMove: Move;
  } | null;

  // Move-quality feedback (transient — set on player move, cleared on next move/new game)
  lastMoveQuality: MoveQuality | null;
  lastMoveQualityAt: number; // ms timestamp so re-renders can re-trigger the badge animation

  // Tactical motif detected on the last player move (informs wizard commentary)
  lastMoveMotif: Motif | null;

  // Endgame Drill mode
  activeEndgameId: string | null;
  endgameMoveCount: number; // tracks moves played in current drill

  // Opening Trainer mode
  activeOpeningId: string | null;
  openingStep: number;

  // Daily Quest tracking
  dailyStreak: number;
  dailyBestStreak: number;
  lastDailyDate: string | null;

  // Adaptive Difficulty — track last 5 results per AI level and a current suggestion.
  aiRecord: Record<Difficulty, ('w' | 'l' | 'd')[]>;
  suggestedDifficulty: Difficulty | null;

  // Actions
  selectSquare:       (square: Square) => void;
  makeMove:           (from: Square, to: Square, promotion?: string) => boolean;
  setDifficulty:      (d: Difficulty) => void;
  setMode:            (m: GameMode) => void;
  setPlayerColor:     (c: PlayerColor) => void;
  takeback:           () => void;
  newGame:            () => void;
  setPhase:           (p: GamePhase) => void;
  setAiThinking:      (v: boolean) => void;
  setWizardMessage:   (msg: string | null, emotion?: GameState['wizardEmotion']) => void;
  earnBadge:          (id: string) => void;
  addCoins:           (n: number) => void;
  setPendingPromotion:(p: { from: Square; to: Square } | null) => void;
  resetWizard:        () => void;

  // Cosmetics & Puzzle actions
  buyTheme:           (themeId: string, cost: number) => boolean;
  equipTheme:         (themeId: string) => void;
  buySkin:            (skinId: string, cost: number) => boolean;
  equipSkin:          (skinId: string) => void;
  startPuzzle:        (puzzleId: string) => void;
  resetActivePuzzle:  () => void;
  exitPuzzleMode:     () => void;
  usePuzzleHint:      () => void;
  startEndgame:       (endgameId: string) => void;
  exitEndgameMode:    () => void;
  startOpening:       (openingId: string) => void;
  exitOpeningMode:    () => void;
  recordAiResult:     (result: 'w' | 'l' | 'd') => void;
  acceptSuggestedDifficulty: () => void;
  dismissSuggestion:  () => void;
  toggleHeatmap:      () => void;
  castTimeSpell:      () => void;
  declineTimeSpell:   () => void;
  resetTimeSpells:    () => void;
  loadSavedData:      () => void;

  // Multiplayer Actions
  createMultiplayerRoom: () => Promise<string>;
  joinMultiplayerRoom: (roomId: string) => Promise<boolean>;
  leaveMultiplayerRoom: () => void;
}

// ──────────────────────────────────────────────
// Initial badges catalog
// ──────────────────────────────────────────────
const INITIAL_BADGES: Badge[] = [
  { id: 'first_move',      name: 'First Step',     description: 'Made your first move!',                icon: '👣', earned: false },
  { id: 'first_capture',   name: 'Brave Knight',   description: 'Captured your first piece!',           icon: '⚔️', earned: false },
  { id: 'queen_capture',   name: 'Dragon Slayer',  description: 'Captured the enemy Queen!',            icon: '🐉', earned: false },
  { id: 'first_castle',    name: 'Castle Builder', description: 'Performed your first castling!',       icon: '🏰', earned: false },
  { id: 'first_check',     name: 'Royal Threat',   description: 'Put the opponent King in check!',      icon: '👑', earned: false },
  { id: 'first_checkmate', name: 'Grand Master',   description: 'Checkmated the opponent!',             icon: '🏆', earned: false },
  { id: 'scholar_mate',    name: 'Scholar\'s Sword', description: 'Won in 4 moves or fewer!',           icon: '📚', earned: false },
  { id: 'pawn_promote',    name: 'Royal Ascension', description: 'Promoted a pawn to a new piece!',    icon: '✨', earned: false },
  { id: 'survive_10',      name: 'Steadfast Shield', description: 'Made 10 moves in a single game!',   icon: '🛡️', earned: false },
  { id: 'beat_ai_squire',  name: 'Squire Slayer',  description: 'Defeated the Squire AI!',             icon: '🗡️', earned: false },
  { id: 'beat_ai_knight',  name: 'Knight Vanquisher', description: 'Defeated the Knight AI!',          icon: '🦄', earned: false },
  { id: 'beat_ai_bishop',  name: 'Bishop Bane',    description: 'Defeated the Bishop AI!',             icon: '⛪', earned: false },
  { id: 'beat_ai_king',    name: 'King\'s Conqueror', description: 'Defeated the King AI — the ultimate triumph!', icon: '👑', earned: false },
];

// Module-level handle for the active multiplayer subscription so we can clean it up on leave.
let multiplayerUnsubscribe: (() => void) | null = null;

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────
interface LocalStoragePayload {
  goldCoins: number;
  unlockedThemes: string[];
  currentTheme: string;
  unlockedSkins: string[];
  currentSkin: string;
  puzzleProgress: Record<string, boolean>;
  badges: Badge[];
  dailyStreak?: number;
  dailyBestStreak?: number;
  lastDailyDate?: string | null;
  aiRecord?: Record<string, ('w' | 'l' | 'd')[]>;
}

const saveToLocalStorage = (state: LocalStoragePayload) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('chess_kids_saved_data', JSON.stringify({
        goldCoins: state.goldCoins,
        unlockedThemes: state.unlockedThemes,
        currentTheme: state.currentTheme,
        unlockedSkins: state.unlockedSkins,
        currentSkin: state.currentSkin,
        puzzleProgress: state.puzzleProgress,
        badges: state.badges.map((b: Badge) => ({ id: b.id, earned: b.earned, earnedAt: b.earnedAt })),
        dailyStreak: state.dailyStreak ?? 0,
        dailyBestStreak: state.dailyBestStreak ?? 0,
        lastDailyDate: state.lastDailyDate ?? null,
        aiRecord: state.aiRecord ?? {},
      }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  chess: new Chess(),
  fen: new Chess().fen(),
  history: [new Chess().fen()],
  moveHistory: [],

  selectedSquare: null,
  validMoves: [],
  lastMove: null,

  phase: 'home',
  mode: 'vs-ai',
  difficulty: 'squire',
  playerColor: 'w',

  isMultiplayer: false,
  roomId: null,

  aiThinking: false,

  capturedPieces: { w: [], b: [] },

  goldCoins: 0,
  badges: INITIAL_BADGES,

  // Cosmetics & shop
  unlockedThemes: ['classic'],
  currentTheme: 'classic',
  unlockedSkins: ['classic'],
  currentSkin: 'classic',

  // Puzzle progress
  puzzleProgress: {},
  activePuzzleId: null,
  puzzleSolved: false,
  puzzleHintsUsed: 0,

  wizardMessage: null,
  wizardEmotion: 'idle',

  pendingPromotion: null,

  showHeatmap: false,
  timeSpellsRemaining: 3,
  pendingTimeSpell: null,

  lastMoveQuality: null,
  lastMoveQualityAt: 0,

  lastMoveMotif: null,

  activeEndgameId: null,
  endgameMoveCount: 0,

  activeOpeningId: null,
  openingStep: 0,

  dailyStreak: 0,
  dailyBestStreak: 0,
  lastDailyDate: null,

  aiRecord: { squire: [], knight: [], bishop: [], king: [] },
  suggestedDifficulty: null,

  // ── Select / click square ──────────────────
  selectSquare: (square) => {
    const { chess, selectedSquare, validMoves, aiThinking, playerColor, isMultiplayer } = get();
    if (aiThinking) return;

    if (isMultiplayer && chess.turn() !== playerColor) {
      get().setWizardMessage("It's not your turn!", 'warning');
      return;
    }

    // Deselect if clicking the already selected square
    if (selectedSquare === square) {
      set({ selectedSquare: null, validMoves: [] });
      return;
    }

    // If a square was already selected and this is a valid destination — make the move
    if (selectedSquare && validMoves.includes(square)) {
      get().makeMove(selectedSquare, square);
      return;
    }

    // Otherwise, try to select the clicked square if it has our piece
    const piece = chess.get(square);
    if (!piece || piece.color !== playerColor) {
      set({ selectedSquare: null, validMoves: [] });
      return;
    }

    const moves = chess.moves({ square, verbose: true }) as Move[];
    const destinations = moves.map(m => m.to as Square);
    set({ selectedSquare: square, validMoves: destinations });
    playSelect();
  },

  // ── Make a move ────────────────────────────
  makeMove: (from, to, promotion) => {
    const { chess, history, moveHistory, playerColor, difficulty } = get();

    // ─── Opening Trainer interception ──────────────────────────────
    // Validate the player's intended move against the canonical book move BEFORE applying.
    if (get().mode === 'opening' && get().activeOpeningId) {
      const opening = OPENINGS.find(o => o.id === get().activeOpeningId);
      if (opening) {
        const step = opening.steps[get().openingStep];
        // Only validate when it's the player's turn in the script.
        if (step && step.color === chess.turn() && step.color === playerColor) {
          let expectedMove: Move | null = null;
          try {
            const tempChess = new Chess(chess.fen());
            expectedMove = tempChess.move(step.san);
          } catch {
            expectedMove = null;
          }
          if (expectedMove && (expectedMove.from !== from || expectedMove.to !== to)) {
            // Wrong move — coach the player and refuse to apply.
            get().setWizardMessage(
              `✋ Not quite! In the ${opening.name}, the book move here is ${step.san.toUpperCase()}. Try again!`,
              'warning'
            );
            return false;
          }
        }
      }
    }

    // Snapshot the position BEFORE the move so we can detect tactical motifs.
    const fenBefore = chess.fen();

    // Check if promotion needed
    const piece = chess.get(from);
    if (piece?.type === 'p') {
      const targetRank = playerColor === 'w' ? '8' : '1';
      if (to[1] === targetRank && !promotion) {
        set({ pendingPromotion: { from, to } });
        return false;
      }
    }

    let move: Move | null = null;
    try {
      move = chess.move({ from, to, promotion: promotion || 'q' });
    } catch {
      return false;
    }

    if (!move) return false;

    // Update captured pieces
    const captured = { ...get().capturedPieces };
    if (move.captured) {
      const capturingColor = move.color; // 'w' or 'b'
      captured[capturingColor] = [...captured[capturingColor], move.captured];
    }

    const newFen = chess.fen();
    const newHistory = [...history, newFen];
    const newMoveHistory = [...moveHistory, move];

    // Classify the move for instant coaching feedback (player moves only).
    const isPlayerMoveForQuality = move.color === playerColor;
    const newQuality = isPlayerMoveForQuality ? classifyMove(chess, move, playerColor) : null;

    // Detect tactical motif (fork/pin/skewer/discovered) for player moves only.
    let newMotif: Motif | null = null;
    if (isPlayerMoveForQuality) {
      try {
        const chessBefore = new Chess(fenBefore);
        newMotif = detectMotif(chessBefore, chess, move, playerColor);
      } catch {
        newMotif = null;
      }
    }

    set({
      fen: newFen,
      history: newHistory,
      moveHistory: newMoveHistory,
      selectedSquare: null,
      validMoves: [],
      lastMove: { from, to },
      capturedPieces: captured,
      pendingPromotion: null,
      lastMoveQuality: newQuality,
      lastMoveQualityAt: Date.now(),
      lastMoveMotif: newMotif,
    });

    // If we detected a tactical motif, surface it through the wizard so the kid
    // learns the name of the pattern they just executed.
    if (newMotif && !chess.isGameOver()) {
      get().setWizardMessage(`${newMotif.icon} ${newMotif.title} ${newMotif.explanation}`, 'excited');
    }

    // ── Sound effects (procedural, fire-and-forget) ─────────────────────
    if (chess.isCheckmate()) {
      // Winner is the side that just moved.
      if (move.color === playerColor) playCheckmate(); else playLoss();
    } else if (chess.isCheck()) {
      playCheck();
    } else if (move.captured) {
      playCapture();
    } else {
      playMove();
    }

    // ── Opening Trainer post-move handling ──────────────────────────────
    if (get().mode === 'opening' && get().activeOpeningId) {
      const opening = OPENINGS.find(o => o.id === get().activeOpeningId);
      if (opening) {
        const stepIdx = get().openingStep;
        const justPlayed = opening.steps[stepIdx];
        if (justPlayed && justPlayed.color === move.color) {
          // Show this move's commentary.
          get().setWizardMessage(
            `${justPlayed.icon || '📖'} ${justPlayed.commentary}`,
            move.color === playerColor ? 'happy' : 'idle'
          );
          const nextIdx = stepIdx + 1;
          set({ openingStep: nextIdx });

          const nextStep = opening.steps[nextIdx];
          if (!nextStep) {
            // Opening complete — reward the player.
            get().addCoins(opening.reward);
            setTimeout(() => {
              get().setWizardMessage(
                `🎓 ${opening.name} mastered! +${opening.reward} gold. Try another opening to grow your repertoire!`,
                'excited'
              );
            }, 1400);
          } else if (nextStep.color !== playerColor) {
            // Auto-play the opponent's book reply after a short pause.
            setTimeout(() => {
              const cur = get();
              if (cur.mode !== 'opening' || cur.activeOpeningId !== opening.id) return;
              let bookMove: Move | null = null;
              try {
                const tmp = new Chess(cur.chess.fen());
                bookMove = tmp.move(nextStep.san);
              } catch {
                bookMove = null;
              }
              if (bookMove) {
                cur.makeMove(bookMove.from as Square, bookMove.to as Square, bookMove.promotion);
              }
            }, 1200);
          }
        }
      }
      return true; // skip the rest of makeMove flow (no badges/endgame/etc. while training)
    }

    // Intercept Puzzle Mode moves
    if (get().mode === 'puzzle') {
      const { activePuzzleId, puzzleSolved } = get();
      const puzzle = PUZZLES.find(p => p.id === activePuzzleId);
      if (puzzle && !puzzleSolved) {
        const playerMoveStr = from + to;
        const matchesSolution = puzzle.solution.includes(playerMoveStr);
        if (matchesSolution) {
          // Check if this is today's Daily Quest — bonus reward + streak update.
          const today = getTodayDateStr();
          const isDaily =
            puzzle.id === getDailyPuzzleId(today) &&
            get().lastDailyDate !== today;
          const bonus = isDaily ? puzzle.reward : 0;
          const totalReward = puzzle.reward + bonus;

          set((state) => {
            const updatedProgress = { ...state.puzzleProgress, [puzzle.id]: true };
            const newStreak = isDaily
              ? nextStreak(state.dailyStreak, state.lastDailyDate, today)
              : state.dailyStreak;
            const newBest = isDaily ? Math.max(state.dailyBestStreak, newStreak) : state.dailyBestStreak;
            const newState = {
              ...state,
              goldCoins: state.goldCoins + totalReward,
              puzzleProgress: updatedProgress,
              puzzleSolved: true,
              dailyStreak: newStreak,
              dailyBestStreak: newBest,
              lastDailyDate: isDaily ? today : state.lastDailyDate,
            };
            saveToLocalStorage(newState);
            return newState;
          });
          playCheckmate();
          playCoins(isDaily ? 4 : 2);
          if (isDaily) {
            get().setWizardMessage(
              `🔥 Daily Quest complete! Streak: ${get().dailyStreak}. Bonus ${bonus} gold — total ${totalReward}!`,
              'excited'
            );
          } else {
            get().setWizardMessage(`🏆 Quest Complete! Excellent move! You earned ${totalReward} gold coins!`, 'excited');
          }
        } else {
          get().setWizardMessage('❌ Not quite! That was not the winning move. Try again!', 'warning');
          setTimeout(() => {
            if (get().mode === 'puzzle' && get().activePuzzleId === puzzle.id && !get().puzzleSolved) {
              get().resetActivePuzzle();
            }
          }, 1500);
        }
      }
      return true;
    }

    // Multiplayer sync
    const { isMultiplayer, roomId } = get();
    if (isMultiplayer && roomId) {
      const gameRef = ref(rtdb, `games/${roomId}`);
      updateDb(gameRef, {
        fen: newFen,
        lastMove: { from, to },
        lastSan: move.san,
        lastCaptured: move.captured || null,
        turn: chess.turn(),
        timestamp: Date.now()
      }).catch(e => console.error("Firebase sync error:", e));
    }

    // ── Badge triggers ────────────────
    const { earnBadge, addCoins, setWizardMessage, badges } = get();

    if (newMoveHistory.length === 1 && !badges.find(b => b.id === 'first_move')?.earned) {
      earnBadge('first_move');
      addCoins(5);
    }
    if (move.captured && !badges.find(b => b.id === 'first_capture')?.earned) {
      earnBadge('first_capture');
      addCoins(10);
      setWizardMessage(pickWizardLine('first_capture') || '⚔️ First blood! You captured your first piece!', 'excited');
    }
    if (move.captured === 'q' && !badges.find(b => b.id === 'queen_capture')?.earned) {
      earnBadge('queen_capture');
      addCoins(50);
      setWizardMessage(pickWizardLine('queen_capture') || '🐉 You slew the Dragon Queen! LEGENDARY move!', 'excited');
    }
    if (move.flags.includes('k') || move.flags.includes('q')) {
      if (!badges.find(b => b.id === 'first_castle')?.earned) {
        earnBadge('first_castle');
        addCoins(15);
        setWizardMessage(pickWizardLine('first_castle') || '🏰 Brilliant! Your castle walls grow stronger!', 'excited');
      }
    }
    if (chess.isCheck() && !badges.find(b => b.id === 'first_check')?.earned) {
      earnBadge('first_check');
      addCoins(20);
      setWizardMessage(pickWizardLine('first_check') || '👑 The enemy King trembles before you!', 'excited');
    }
    if (move.flags.includes('p') && !badges.find(b => b.id === 'pawn_promote')?.earned) {
      earnBadge('pawn_promote');
      addCoins(30);
      setWizardMessage(pickWizardLine('pawn_promote') || '✨ Your brave pawn ascends to royalty!', 'excited');
    }
    if (newMoveHistory.length >= 10 && !badges.find(b => b.id === 'survive_10')?.earned) {
      earnBadge('survive_10');
      addCoins(10);
    }
    if (chess.isCheckmate() && !badges.find(b => b.id === 'first_checkmate')?.earned) {
      earnBadge('first_checkmate');
      addCoins(100);
      setWizardMessage(pickWizardLine('first_checkmate') || '🏆 CHECKMATE! You are a true Grand Master!', 'excited');
      // Scholar's mate check — 4 moves or fewer for current player
      const playerMoves = newMoveHistory.filter(m => m.color === playerColor);
      if (playerMoves.length <= 4 && !badges.find(b => b.id === 'scholar_mate')?.earned) {
        earnBadge('scholar_mate');
        addCoins(75);
      }
      // Beat AI badges
      if (get().mode === 'vs-ai') {
        const aiId =
          difficulty === 'squire' ? 'beat_ai_squire' :
          difficulty === 'knight' ? 'beat_ai_knight' :
          difficulty === 'bishop' ? 'beat_ai_bishop' :
          difficulty === 'king'   ? 'beat_ai_king'   : null;
        if (aiId && !badges.find(b => b.id === aiId)?.earned) {
          earnBadge(aiId);
          addCoins(50);
        }
      }

      // Endgame drill completion reward
      if (get().mode === 'endgame' && get().activeEndgameId) {
        const drill = ENDGAME_DRILLS.find(d => d.id === get().activeEndgameId);
        if (drill) {
          const playerMovesUsed = newMoveHistory.filter(m => m.color === playerColor).length;
          const onPar = playerMovesUsed <= drill.parMoves;
          const reward = onPar ? drill.reward * 2 : drill.reward;
          addCoins(reward);
          setWizardMessage(
            onPar
              ? `${drill.icon} Perfect! Completed in ${playerMovesUsed} moves (par ${drill.parMoves}) — bonus 2× gold: ${reward} coins!`
              : `${drill.icon} Drill complete in ${playerMovesUsed} moves — ${reward} gold earned!`,
            'excited'
          );
        }
      }

      // Adaptive Difficulty — record W/L on vs-AI games for the suggestion engine.
      if (get().mode === 'vs-ai') {
        const playerWon = move.color === playerColor;
        get().recordAiResult(playerWon ? 'w' : 'l');
      }

      set({ phase: 'gameover' });
    }

    if (chess.isDraw()) {
      setWizardMessage(pickWizardLine('draw') || '🤝 A valiant draw! Both armies fought with honour.', 'happy');
      if (get().mode === 'vs-ai') {
        get().recordAiResult('d');
      }
      set({ phase: 'gameover' });
    }

    // Soft wizard hints
    if (chess.isCheck() && !chess.isCheckmate()) {
      if (chess.turn() === playerColor) {
        setWizardMessage(pickWizardLine('check_warning') || '⚠️ Watch out! Your King is in check! Defend quickly!', 'warning');
      }
    }

    // ── Time Spell blunder warning trigger ──
    const isPlayerMove = move.color === playerColor;
    if (get().mode === 'vs-ai' && isPlayerMove && get().timeSpellsRemaining > 0 && !get().pendingTimeSpell) {
      const nextMoves = chess.moves({ verbose: true }) as Move[];
      const territory = calculateTerritory(chess);
      const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

      const heavyThreat = nextMoves.find(m => {
        // 1. Opponent can capture a piece worth >= 3 (knight or up) that is undefended.
        if (m.captured && (PIECE_VALUES[m.captured] ?? 0) >= 3) {
          const sqControl = territory[m.to];
          if (sqControl) {
            const friendlyControls = playerColor === 'w' ? sqControl.whiteControls : sqControl.blackControls;
            if (friendlyControls === 0) return true;
          }
        }

        // 2. Opponent can deliver immediate checkmate.
        const clone = new Chess(chess.fen());
        try {
          clone.move(m.san);
          if (clone.isCheckmate()) return true;
        } catch {}

        return false;
      });

      if (heavyThreat) {
        set({
          pendingTimeSpell: {
            playerMove: { from, to, promotion },
            opponentMove: heavyThreat
          }
        });
      }
    }

    return true;
  },

  // ── Takeback ──────────────────────────────
  takeback: () => {
    const { history, moveHistory } = get();
    if (history.length <= 1) return;
    // Pop the last 2 entries (player's move + AI's move) or just 1 if at start
    const newHistory = history.length > 2 ? history.slice(0, -2) : history.slice(0, -1);
    const newMoveHistory = history.length > 2 ? moveHistory.slice(0, -2) : moveHistory.slice(0, -1);
    const prevFen = newHistory[newHistory.length - 1];
    const chess = new Chess(prevFen);
    set({
      chess,
      fen: prevFen,
      history: newHistory,
      moveHistory: newMoveHistory,
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      aiThinking: false,
    });
  },

  // ── New game ──────────────────────────────
  newGame: () => {
    const chess = new Chess();
    set({
      chess,
      fen: chess.fen(),
      history: [chess.fen()],
      moveHistory: [],
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      aiThinking: false,
      capturedPieces: { w: [], b: [] },
      wizardMessage: null,
      wizardEmotion: 'idle',
      pendingPromotion: null,
      phase: 'playing',
      isMultiplayer: false,
      roomId: null,
      timeSpellsRemaining: 3,
      pendingTimeSpell: null,
      lastMoveQuality: null,
      lastMoveQualityAt: 0,
      lastMoveMotif: null,
      // Reset mode to vs-ai (clears any lingering puzzle/endgame state)
      mode: 'vs-ai',
      activePuzzleId: null,
      puzzleSolved: false,
      puzzleHintsUsed: 0,
      activeEndgameId: null,
      endgameMoveCount: 0,
      activeOpeningId: null,
      openingStep: 0,
      suggestedDifficulty: null,
    });
  },

  // ── Setters ───────────────────────────────
  setDifficulty:    (d) => set({ difficulty: d }),
  setMode:          (m) => set({ mode: m }),
  setPlayerColor:   (c) => set({ playerColor: c }),
  setPhase:         (p) => set({ phase: p }),
  setAiThinking:    (v) => set({ aiThinking: v }),
  setPendingPromotion: (p) => set({ pendingPromotion: p }),

  setWizardMessage: (msg, emotion = 'happy') =>
    set({ wizardMessage: msg, wizardEmotion: emotion }),

  resetWizard: () =>
    set({ wizardMessage: null, wizardEmotion: 'idle' }),

  earnBadge: (id) =>
    set((state) => {
      // Only award if not already earned
      if (state.badges.find(b => b.id === id)?.earned) return state;
      const updatedBadges = state.badges.map(b =>
        b.id === id ? { ...b, earned: true, earnedAt: Date.now() } : b
      );
      // Persist immediately — kids close the tab right after winning.
      saveToLocalStorage({ ...state, badges: updatedBadges });
      playBadge();
      return { badges: updatedBadges };
    }),

  addCoins: (n) =>
    set((state) => {
      const newCoins = state.goldCoins + n;
      saveToLocalStorage({ ...state, goldCoins: newCoins });
      if (n > 0) playCoins(Math.min(4, Math.ceil(n / 20)));
      return { goldCoins: newCoins };
    }),

  // ── Multiplayer Logic ────────────────────────
  createMultiplayerRoom: async () => {
    // Clean up any prior subscription before creating a new room
    if (multiplayerUnsubscribe) {
      multiplayerUnsubscribe();
      multiplayerUnsubscribe = null;
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const chess = new Chess();
    const initialFen = chess.fen();

    set({
      isMultiplayer: true,
      roomId,
      mode: 'vs-friend',
      playerColor: 'w',
      chess,
      fen: initialFen,
      history: [initialFen],
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      phase: 'playing',
      wizardMessage: `Room created! Invite code: ${roomId}`,
      wizardEmotion: 'happy',
    });

    const gameRef = ref(rtdb, `games/${roomId}`);
    await setDb(gameRef, {
      fen: initialFen,
      turn: 'w',
      timestamp: Date.now(),
      status: 'waiting'
    });

    // Listen for opponent moves and sync history + captured pieces locally.
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      const state = get();
      if (data && data.fen && data.fen !== state.fen) {
        const newChess = new Chess(data.fen);
        const newHistory = [...state.history, data.fen];
        const newCaptured = { w: [...state.capturedPieces.w], b: [...state.capturedPieces.b] };
        if (data.lastCaptured) {
          // After the move, `newChess.turn()` is the side to move NEXT, so the capturer is the opposite color.
          const capColor: PlayerColor = newChess.turn() === 'w' ? 'b' : 'w';
          newCaptured[capColor].push(data.lastCaptured);
        }
        set({
          fen: data.fen,
          chess: newChess,
          history: newHistory,
          lastMove: data.lastMove || null,
          capturedPieces: newCaptured,
          selectedSquare: null,
          validMoves: [],
        });
      }
    });
    multiplayerUnsubscribe = () => {
      off(gameRef);
    };

    return roomId;
  },

  joinMultiplayerRoom: async (roomId: string) => {
    if (multiplayerUnsubscribe) {
      multiplayerUnsubscribe();
      multiplayerUnsubscribe = null;
    }

    roomId = roomId.toUpperCase();
    const gameRef = ref(rtdb, `games/${roomId}`);
    const snapshot = await getDb(gameRef);

    if (!snapshot.exists()) {
      get().setWizardMessage(`Room ${roomId} not found!`, 'sad');
      return false;
    }

    const data = snapshot.val();
    const newChess = new Chess(data.fen);

    set({
      isMultiplayer: true,
      roomId,
      mode: 'vs-friend',
      playerColor: 'b', // Joiner is black
      chess: newChess,
      fen: data.fen,
      history: [data.fen],
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      lastMove: data.lastMove || null,
      phase: 'playing',
      wizardMessage: 'Joined successfully! You are playing as Black.',
      wizardEmotion: 'excited'
    });

    // Mark as joined without clobbering room metadata.
    await updateDb(gameRef, { status: 'playing' });

    // Listen for moves
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      const state = get();
      if (data && data.fen && data.fen !== state.fen) {
        const chessRemote = new Chess(data.fen);
        const newHistory = [...state.history, data.fen];
        const newCaptured = { w: [...state.capturedPieces.w], b: [...state.capturedPieces.b] };
        if (data.lastCaptured) {
          const capColor: PlayerColor = chessRemote.turn() === 'w' ? 'b' : 'w';
          newCaptured[capColor].push(data.lastCaptured);
        }
        set({
          fen: data.fen,
          chess: chessRemote,
          history: newHistory,
          lastMove: data.lastMove || null,
          capturedPieces: newCaptured,
          selectedSquare: null,
          validMoves: [],
        });
      }
    });
    multiplayerUnsubscribe = () => {
      off(gameRef);
    };

    return true;
  },

  leaveMultiplayerRoom: () => {
    if (multiplayerUnsubscribe) {
      multiplayerUnsubscribe();
      multiplayerUnsubscribe = null;
    }
    set({
      isMultiplayer: false,
      roomId: null,
      mode: 'vs-ai'
    });
    get().newGame();
  },

  buyTheme: (themeId, cost) => {
    const { goldCoins, unlockedThemes } = get();
    if (goldCoins < cost || unlockedThemes.includes(themeId)) {
      return false;
    }
    set((state) => {
      const newState = {
        ...state,
        goldCoins: state.goldCoins - cost,
        unlockedThemes: [...state.unlockedThemes, themeId],
        currentTheme: themeId,
      };
      saveToLocalStorage(newState);
      return newState;
    });
    get().setWizardMessage('🎉 Theme unlocked and equipped! Enjoy the magic!', 'excited');
    return true;
  },

  equipTheme: (themeId) => {
    const { unlockedThemes } = get();
    if (!unlockedThemes.includes(themeId)) return;
    set((state) => {
      const newState = { ...state, currentTheme: themeId };
      saveToLocalStorage(newState);
      return newState;
    });
  },

  buySkin: (skinId, cost) => {
    const { goldCoins, unlockedSkins } = get();
    if (goldCoins < cost || unlockedSkins.includes(skinId)) {
      return false;
    }
    set((state) => {
      const newState = {
        ...state,
        goldCoins: state.goldCoins - cost,
        unlockedSkins: [...state.unlockedSkins, skinId],
        currentSkin: skinId,
      };
      saveToLocalStorage(newState);
      return newState;
    });
    get().setWizardMessage('🎉 Wizard skin unlocked! Say hello to your new mentor!', 'excited');
    return true;
  },

  equipSkin: (skinId) => {
    const { unlockedSkins } = get();
    if (!unlockedSkins.includes(skinId)) return;
    set((state) => {
      const newState = { ...state, currentSkin: skinId };
      saveToLocalStorage(newState);
      return newState;
    });
  },

  startPuzzle: (puzzleId) => {
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (!puzzle) return;

    const chess = new Chess(puzzle.fen);
    set({
      mode: 'puzzle',
      activePuzzleId: puzzleId,
      chess,
      fen: chess.fen(),
      history: [chess.fen()],
      moveHistory: [],
      // Make sure the player gets to move the side whose turn it is in the puzzle FEN.
      // Otherwise (e.g., a user who toggled "Play as Black") pieces become unselectable.
      playerColor: chess.turn(),
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      aiThinking: false,
      capturedPieces: { w: [], b: [] },
      pendingPromotion: null,
      pendingTimeSpell: null,
      phase: 'playing',
      puzzleSolved: false,
      puzzleHintsUsed: 0,
      wizardMessage: `Quest: ${puzzle.title}. ${puzzle.description}`,
      wizardEmotion: 'happy',
    });
  },

  resetActivePuzzle: () => {
    const { activePuzzleId } = get();
    if (!activePuzzleId) return;
    get().startPuzzle(activePuzzleId);
  },

  exitPuzzleMode: () => {
    set({
      mode: 'vs-ai',
      activePuzzleId: null,
      puzzleSolved: false,
      puzzleHintsUsed: 0,
    });
    get().newGame();
  },

  // ── Endgame drill mode ────────────────────────
  startEndgame: (endgameId: string) => {
    const drill: EndgameDrill | undefined = ENDGAME_DRILLS.find(d => d.id === endgameId);
    if (!drill) return;
    const chess = new Chess(drill.fen);
    set({
      mode: 'endgame',
      activeEndgameId: endgameId,
      activePuzzleId: null,
      puzzleSolved: false,
      chess,
      fen: chess.fen(),
      history: [chess.fen()],
      moveHistory: [],
      playerColor: chess.turn(),  // play whichever side has to move (always white in our drills)
      // Easiest AI for kids — Squire = semi-random king shuffling.
      difficulty: 'squire',
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      aiThinking: false,
      capturedPieces: { w: [], b: [] },
      pendingPromotion: null,
      pendingTimeSpell: null,
      timeSpellsRemaining: 3,
      lastMoveQuality: null,
      lastMoveQualityAt: 0,
      lastMoveMotif: null,
      endgameMoveCount: 0,
      phase: 'playing',
      wizardMessage: `${drill.icon} ${drill.title}: ${drill.description}`,
      wizardEmotion: 'happy',
    });
  },

  exitEndgameMode: () => {
    set({
      mode: 'vs-ai',
      activeEndgameId: null,
      endgameMoveCount: 0,
    });
    get().newGame();
  },

  // ── Opening Trainer mode ─────────────────────
  startOpening: (openingId: string) => {
    const opening = OPENINGS.find(o => o.id === openingId);
    if (!opening) return;
    // Openings always start from the standard initial position with the player as White.
    const chess = new Chess();
    set({
      mode: 'opening',
      activeOpeningId: openingId,
      openingStep: 0,
      activePuzzleId: null,
      puzzleSolved: false,
      activeEndgameId: null,
      chess,
      fen: chess.fen(),
      history: [chess.fen()],
      moveHistory: [],
      playerColor: 'w',
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      aiThinking: false,
      capturedPieces: { w: [], b: [] },
      pendingPromotion: null,
      pendingTimeSpell: null,
      lastMoveQuality: null,
      lastMoveQualityAt: 0,
      lastMoveMotif: null,
      phase: 'playing',
      wizardMessage: `📚 Welcome to the ${opening.name}! ${opening.description} Play the suggested moves to learn the opening!`,
      wizardEmotion: 'happy',
    });
  },

  exitOpeningMode: () => {
    set({
      mode: 'vs-ai',
      activeOpeningId: null,
      openingStep: 0,
    });
    get().newGame();
  },

  // ── Adaptive Difficulty ──────────────────────
  recordAiResult: (result) => {
    set((state) => {
      // Only record in vs-AI mode (not endgame/puzzle/opening).
      if (state.mode !== 'vs-ai') return state;

      const cur = state.aiRecord[state.difficulty] ?? [];
      const updated = [...cur, result].slice(-5); // keep last 5

      // Look at the last 3 results to compute a suggestion.
      const last3 = updated.slice(-3);
      const wins = last3.filter(r => r === 'w').length;
      const losses = last3.filter(r => r === 'l').length;

      const order: Difficulty[] = ['squire', 'knight', 'bishop', 'king'];
      const idx = order.indexOf(state.difficulty);

      let suggested: Difficulty | null = null;
      if (last3.length === 3 && wins === 3 && idx < order.length - 1) {
        suggested = order[idx + 1];
      } else if (last3.length >= 2 && losses >= 2 && idx > 0) {
        // Gentler trigger for step-down — kids need it sooner.
        suggested = order[idx - 1];
      }

      const newAiRecord = { ...state.aiRecord, [state.difficulty]: updated };
      const newState = { ...state, aiRecord: newAiRecord, suggestedDifficulty: suggested };
      saveToLocalStorage(newState);
      return { aiRecord: newAiRecord, suggestedDifficulty: suggested };
    });
  },

  acceptSuggestedDifficulty: () => {
    const { suggestedDifficulty } = get();
    if (!suggestedDifficulty) return;
    set({ difficulty: suggestedDifficulty, suggestedDifficulty: null });
    get().newGame();
  },

  dismissSuggestion: () => set({ suggestedDifficulty: null }),

  usePuzzleHint: () => {
    const { activePuzzleId, puzzleHintsUsed } = get();
    if (!activePuzzleId) return;
    const puzzle = PUZZLES.find(p => p.id === activePuzzleId);
    if (!puzzle || !puzzle.hints) return;

    if (puzzleHintsUsed < puzzle.hints.length) {
      const nextHint = puzzle.hints[puzzleHintsUsed];
      set({ puzzleHintsUsed: puzzleHintsUsed + 1 });
      get().setWizardMessage(`💡 Hint: ${nextHint}`, 'happy');
    } else {
      get().setWizardMessage('No more hints available! You can do this! ⚔️', 'warning');
    }
  },

  toggleHeatmap: () => {
    set({ showHeatmap: !get().showHeatmap });
  },

  castTimeSpell: () => {
    const { pendingTimeSpell, timeSpellsRemaining, chess } = get();
    if (!pendingTimeSpell || timeSpellsRemaining <= 0) return;

    // Immediately lock further interaction: close the modal, mark AI as "thinking" so
    // the player can't double-click and the board click handler ignores input,
    // and consume the spell charge up-front.
    set({
      pendingTimeSpell: null,
      aiThinking: true,
      timeSpellsRemaining: timeSpellsRemaining - 1,
    });

    // 1. Temporarily play the AI's threatening move so the player sees the consequence.
    const tempChess = new Chess(chess.fen());
    try {
      tempChess.move(pendingTimeSpell.opponentMove.san);
      set({
        chess: tempChess,
        fen: tempChess.fen(),
        wizardMessage: `🔮 Future Revealed: The opponent will play ${pendingTimeSpell.opponentMove.san.toUpperCase()}! Rewinding timeline…`,
        wizardEmotion: 'warning'
      });
    } catch {}

    // 2. Wait 2 seconds, then undo the player's blundered move and restore the board.
    setTimeout(() => {
      const { history, moveHistory } = get();
      if (history.length > 1) {
        const restoredHistory = history.slice(0, -1);
        const restoredMoveHistory = moveHistory.slice(0, -1);
        const restoredFen = restoredHistory[restoredHistory.length - 1];
        const restoredChess = new Chess(restoredFen);

        set({
          chess: restoredChess,
          fen: restoredFen,
          history: restoredHistory,
          moveHistory: restoredMoveHistory,
          aiThinking: false,
          wizardMessage: `⌛ Timeline Restored! Merlin saved you. Choose a different move!`,
          wizardEmotion: 'happy',
          selectedSquare: null,
          validMoves: [],
          lastMove: null,
        });
      } else {
        set({ aiThinking: false });
      }
    }, 2000);
  },

  declineTimeSpell: () => {
    // The player is brave (or stubborn) — force the AI to actually play the move
    // Merlin warned about, otherwise Stockfish might pick a different reply and the
    // earlier warning would feel like a lie.
    const { pendingTimeSpell, chess } = get();
    if (!pendingTimeSpell) {
      set({ pendingTimeSpell: null });
      return;
    }

    set({ pendingTimeSpell: null, aiThinking: true });

    // Tiny delay so the modal animates out before the AI's "punishment" lands.
    setTimeout(() => {
      const opp = pendingTimeSpell.opponentMove;
      try {
        // Reuse makeMove so badges, captured pieces, history, and game-over all wire up.
        const ok = get().makeMove(opp.from as Square, opp.to as Square, opp.promotion);
        if (!ok) {
          // Fallback: legality changed somehow — let Stockfish take over next tick.
          const fresh = new Chess(chess.fen());
          const legal = fresh.moves({ verbose: true }) as Move[];
          if (legal.length > 0) {
            const m = legal[0];
            get().makeMove(m.from as Square, m.to as Square);
          }
        }
      } catch {}
      set({ aiThinking: false });
    }, 350);
  },

  resetTimeSpells: () => {
    set({ timeSpellsRemaining: 3, pendingTimeSpell: null });
  },

  loadSavedData: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('chess_kids_saved_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        set((state) => {
          const updatedBadges = state.badges.map(b => {
            const savedB = parsed.badges?.find((x: Badge) => x.id === b.id);
            if (savedB) {
              return { ...b, earned: savedB.earned, earnedAt: savedB.earnedAt };
            }
            return b;
          });

          return {
            goldCoins: typeof parsed.goldCoins === 'number' ? parsed.goldCoins : state.goldCoins,
            unlockedThemes: parsed.unlockedThemes || state.unlockedThemes,
            currentTheme: parsed.currentTheme || state.currentTheme,
            unlockedSkins: parsed.unlockedSkins || state.unlockedSkins,
            currentSkin: parsed.currentSkin || state.currentSkin,
            puzzleProgress: parsed.puzzleProgress || state.puzzleProgress,
            badges: updatedBadges,
            dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : state.dailyStreak,
            dailyBestStreak: typeof parsed.dailyBestStreak === 'number' ? parsed.dailyBestStreak : state.dailyBestStreak,
            lastDailyDate: parsed.lastDailyDate ?? state.lastDailyDate,
            aiRecord: parsed.aiRecord
              ? { ...state.aiRecord, ...parsed.aiRecord }
              : state.aiRecord,
          };
        });
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
  }
}));
