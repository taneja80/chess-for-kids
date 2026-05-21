/**
 * Famous chess opening "stories" — each one is a 6–8 ply guided lesson.
 * The player plays White; the system replies with the book continuation and the wizard
 * narrates the strategic idea of each move in plain English for kids.
 */

export interface OpeningStep {
  /** The expected move in Standard Algebraic Notation (SAN). */
  san: string;
  /** Whose move this step represents. */
  color: 'w' | 'b';
  /** Kid-friendly explanation shown by the wizard AFTER the move is played. */
  commentary: string;
  /** Optional emoji to lead the commentary. */
  icon?: string;
}

export interface Opening {
  id: string;
  name: string;
  description: string;
  reward: number;
  era: string;           // narrative flavor — "Renaissance Italy", "Spanish Court", etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: OpeningStep[];
}

export const OPENINGS: Opening[] = [
  // ── 1. ITALIAN GAME ────────────────────────────────────────────────
  {
    id: 'italian',
    name: 'The Italian Game',
    description: 'The oldest recorded opening — every kid\'s first weapon. Develop quickly, attack the weak f7 square!',
    reward: 80,
    era: 'Renaissance Italy',
    difficulty: 'beginner',
    steps: [
      { san: 'e4',  color: 'w', icon: '👑', commentary: 'Push the King\'s pawn! Claim the centre and open lanes for your Bishop and Queen.' },
      { san: 'e5',  color: 'b', icon: '🛡️', commentary: 'Black mirrors — also claiming the centre. The fight is on!' },
      { san: 'Nf3', color: 'w', icon: '🐴', commentary: 'Develop your Knight — knights before bishops! It attacks Black\'s pawn on e5.' },
      { san: 'Nc6', color: 'b', icon: '🐴', commentary: 'Black defends the pawn with their own knight. Classic development.' },
      { san: 'Bc4', color: 'w', icon: '⛪', commentary: 'The "Italian Bishop"! It aims at f7 — the square only defended by the Black King.' },
      { san: 'Bc5', color: 'b', icon: '⛪', commentary: 'Black plays the same plan in reverse. Two armies face off!' },
    ],
  },

  // ── 2. RUY LOPEZ ────────────────────────────────────────────────────
  {
    id: 'ruy-lopez',
    name: 'The Ruy Lopez',
    description: 'The "Spanish Game" — a Spanish priest invented this 500 years ago. Pin the knight, control the centre.',
    reward: 100,
    era: 'Spanish Court, 1561',
    difficulty: 'intermediate',
    steps: [
      { san: 'e4',  color: 'w', icon: '👑', commentary: 'Same start as the Italian — claim the centre with your King\'s pawn.' },
      { san: 'e5',  color: 'b', icon: '🛡️', commentary: 'Black mirrors again.' },
      { san: 'Nf3', color: 'w', icon: '🐴', commentary: 'Develop the knight, threatening Black\'s pawn on e5.' },
      { san: 'Nc6', color: 'b', icon: '🐴', commentary: 'Black defends.' },
      { san: 'Bb5', color: 'w', icon: '⛪', commentary: 'The Spanish Bishop! It pins the knight — if the knight moves, you can take the pawn!' },
      { san: 'a6',  color: 'b', icon: '♟️', commentary: 'Black asks: "Why are you here, Bishop?" — preparing to chase it away.' },
    ],
  },

  // ── 3. SCANDINAVIAN DEFENSE ────────────────────────────────────────
  {
    id: 'scandinavian',
    name: 'The Scandinavian Defense',
    description: 'A Viking-style counter-punch. Black challenges the centre instantly! Played by Magnus Carlsen.',
    reward: 90,
    era: 'Viking Age',
    difficulty: 'intermediate',
    steps: [
      { san: 'e4',   color: 'w', icon: '👑', commentary: 'Push the King\'s pawn to claim the centre.' },
      { san: 'd5',   color: 'b', icon: '⚔️', commentary: 'Surprise! Black attacks your pawn immediately — the Viking strike!' },
      { san: 'exd5', color: 'w', icon: '🍴', commentary: 'Take the pawn! No reason to refuse a free trade.' },
      { san: 'Qxd5', color: 'b', icon: '👸', commentary: 'Black brings their Queen out to recapture. Looks scary — but the Queen is now exposed!' },
      { san: 'Nc3',  color: 'w', icon: '🐴', commentary: 'Develop AND attack the Queen with tempo — Black wastes a move to escape!' },
      { san: 'Qa5',  color: 'b', icon: '👸', commentary: 'The Queen retreats to a5, threatening to slide around the board later.' },
    ],
  },

  // ── 4. SICILIAN DEFENSE ────────────────────────────────────────────
  {
    id: 'sicilian',
    name: 'The Sicilian Defense',
    description: 'Black\'s sharpest answer to 1.e4. Asymmetrical, dangerous, and the favourite of world champions.',
    reward: 120,
    era: 'Sicily, 1594',
    difficulty: 'advanced',
    steps: [
      { san: 'e4',   color: 'w', icon: '👑', commentary: 'Begin with the King\'s pawn.' },
      { san: 'c5',   color: 'b', icon: '🌋', commentary: 'The Sicilian! Black ignores symmetry and attacks the centre from the SIDE.' },
      { san: 'Nf3',  color: 'w', icon: '🐴', commentary: 'Develop your knight — preparing to attack the centre.' },
      { san: 'd6',   color: 'b', icon: '🛡️', commentary: 'Black supports the future e5 push and prepares to develop pieces.' },
      { san: 'd4',   color: 'w', icon: '⚡', commentary: 'The Open Sicilian! Break open the centre with this pawn push.' },
      { san: 'cxd4', color: 'b', icon: '🍴', commentary: 'Black happily trades — they get a great pawn structure in return.' },
    ],
  },

  // ── 5. QUEEN'S GAMBIT ──────────────────────────────────────────────
  {
    id: 'queens-gambit',
    name: 'The Queen\'s Gambit',
    description: 'The classical opening from "The Queen\'s Gambit" Netflix series. Offer a pawn for huge central control!',
    reward: 110,
    era: 'Classical chess',
    difficulty: 'intermediate',
    steps: [
      { san: 'd4',  color: 'w', icon: '👸', commentary: 'Queen\'s pawn opening — solid and strategic, no early Queen attacks.' },
      { san: 'd5',  color: 'b', icon: '🛡️', commentary: 'Black mirrors — symmetrical and safe.' },
      { san: 'c4',  color: 'w', icon: '🎁', commentary: 'THE GAMBIT! "Take my pawn — I dare you!" You offer a pawn for central dominance.' },
      { san: 'e6',  color: 'b', icon: '🛡️', commentary: 'Queen\'s Gambit DECLINED. Black says "No thanks" and defends d5 instead.' },
      { san: 'Nc3', color: 'w', icon: '🐴', commentary: 'Develop the knight, attacking d5 a second time.' },
      { san: 'Nf6', color: 'b', icon: '🐴', commentary: 'Black mirrors again — both sides develop classically.' },
    ],
  },
];

export function getOpening(id: string): Opening | undefined {
  return OPENINGS.find(o => o.id === id);
}
