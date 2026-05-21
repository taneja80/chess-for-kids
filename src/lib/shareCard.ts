import { Chess } from 'chess.js';

const PIECE_UNI: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  squire: 'Squire (Easy)',
  knight: 'Knight (Medium)',
  bishop: 'Bishop (Hard)',
  king:   'King (Expert)',
};

interface ShareCardOptions {
  chess: Chess;
  moves: number;
  difficulty: string;
  result: 'win' | 'loss' | 'draw';
  playerColor: 'w' | 'b';
}

/**
 * Render the final board state into a downloadable PNG share card.
 * Returns a data URL — caller can download or copy to clipboard.
 */
export function generateShareCard(opts: ShareCardOptions): string {
  const { chess, moves, difficulty, result, playerColor } = opts;

  const W = 800;
  const H = 1040;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // ── Background ─────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0f2e');
  bg.addColorStop(0.5, '#2d1f52');
  bg.addColorStop(1, '#1a0f2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft glow
  const glow = ctx.createRadialGradient(W / 2, 200, 50, W / 2, 200, 500);
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
  glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Header ─────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const headline =
    result === 'win'  ? '🏆  Victory!' :
    result === 'draw' ? '🤝  Honourable Draw' :
                        '⚔️  Fought Bravely';

  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillStyle = result === 'win' ? '#fbbf24' : '#e2d5f8';
  ctx.fillText(headline, W / 2, 100);

  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillStyle = '#e2d5f8';
  const subtitle =
    result === 'win'  ? `I defeated the Wizard in ${moves} moves!` :
    result === 'draw' ? `${moves} moves — a true tactical battle!` :
                        `${moves} moves of brave play — I'll be back!`;
  ctx.fillText(subtitle, W / 2, 152);

  // ── Difficulty pill ────────────────────────────────────────────────────
  const diffLabel = DIFFICULTY_LABELS[difficulty] || difficulty;
  const pillText = `⚔️  ${diffLabel}`;
  ctx.font = '22px Georgia, serif';
  const pillMetrics = ctx.measureText(pillText);
  const pillW = pillMetrics.width + 48;
  const pillX = (W - pillW) / 2;
  const pillY = 178;
  ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  roundRect(ctx, pillX, pillY, pillW, 38, 19);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pillX, pillY, pillW, 38, 19);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(pillText, W / 2, pillY + 26);

  // ── Board ──────────────────────────────────────────────────────────────
  const boardSize = 560;
  const boardX = (W - boardSize) / 2;
  const boardY = 260;
  const sq = boardSize / 8;

  // Frame
  ctx.fillStyle = '#3d2870';
  ctx.fillRect(boardX - 8, boardY - 8, boardSize + 16, boardSize + 16);
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(boardX - 4, boardY - 4, boardSize + 8, boardSize + 8);

  const board = chess.board();
  const rRange = playerColor === 'b' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cRange = playerColor === 'b' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  rRange.forEach((boardR, displayR) => {
    cRange.forEach((boardC, displayC) => {
      const x = boardX + displayC * sq;
      const y = boardY + displayR * sq;
      const isLight = (displayR + displayC) % 2 === 0;
      ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
      ctx.fillRect(x, y, sq, sq);

      const piece = board[boardR][boardC];
      if (piece) {
        const key = piece.color + piece.type;
        const glyph = PIECE_UNI[key];
        ctx.font = `${sq * 0.78}px "Arial Unicode MS", "Segoe UI Symbol", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Drop shadow for legibility
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillText(glyph, x + sq / 2 + 2, y + sq / 2 + 5);
        ctx.fillStyle = piece.color === 'w' ? '#ffffff' : '#1a1714';
        ctx.fillText(glyph, x + sq / 2, y + sq / 2 + 3);
      }
    });
  });

  // ── Footer ─────────────────────────────────────────────────────────────
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText('♟  Chess for Kids', W / 2, 900);

  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = 'rgba(226, 213, 248, 0.7)';
  ctx.fillText('Medieval Chess Academy', W / 2, 932);

  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillStyle = 'rgba(226, 213, 248, 0.55)';
  ctx.fillText('Can you beat the Wizard too?', W / 2, 980);

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadShareCard(dataUrl: string, filename = 'chess-for-kids-victory.png'): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function copyShareCardToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
