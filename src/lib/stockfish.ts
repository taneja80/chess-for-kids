import { Chess } from 'chess.js';

export type Difficulty = 'squire' | 'knight' | 'bishop' | 'king';

const DIFFICULTY_SETTINGS: Record<Difficulty, { depth: number; skillLevel: number; moveTime: number }> = {
  squire: { depth: 1, skillLevel: 0, moveTime: 100 },
  knight: { depth: 3, skillLevel: 5, moveTime: 500 },
  bishop: { depth: 6, skillLevel: 10, moveTime: 1000 },
  king:   { depth: 12, skillLevel: 20, moveTime: 2000 },
};

let stockfishWorker: Worker | null = null;

export function initStockfish(): Promise<Worker> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('/stockfish.js');
      worker.postMessage('uci');
      worker.onmessage = (e) => {
        if (e.data === 'uciok') {
          stockfishWorker = worker;
          resolve(worker);
        }
      };
      worker.onerror = reject;
    } catch (e) {
      reject(e);
    }
  });
}

export function getStockfishMove(
  fen: string,
  difficulty: Difficulty
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use a simple random move for squire level or if stockfish failed to load
    if (difficulty === 'squire' || !stockfishWorker) {
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) {
        reject(new Error('No moves available'));
        return;
      }
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      // Add slight delay to feel natural
      setTimeout(() => {
        const promotion = randomMove.promotion ? randomMove.promotion : '';
        resolve(`${randomMove.from}${randomMove.to}${promotion}`);
      }, 500);
      return;
    }

    const settings = DIFFICULTY_SETTINGS[difficulty];
    const worker = stockfishWorker;

    let resolved = false;
    const handler = (e: MessageEvent) => {
      const line: string = e.data;
      if (line.startsWith('bestmove')) {
        if (!resolved) {
          resolved = true;
          worker.removeEventListener('message', handler);
          const parts = line.split(' ');
          resolve(parts[1]);
        }
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage('ucinewgame');
    worker.postMessage(`setoption name Skill Level value ${settings.skillLevel}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${settings.depth} movetime ${settings.moveTime}`);

    // Timeout safety
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        worker.removeEventListener('message', handler);
        const chess = new Chess(fen);
        const moves = chess.moves({ verbose: true });
        if (moves.length > 0) {
          const m = moves[Math.floor(Math.random() * moves.length)];
          resolve(`${m.from}${m.to}`);
        } else {
          reject(new Error('Timeout and no moves'));
        }
      }
    }, settings.moveTime + 2000);
  });
}

export function terminateStockfish() {
  if (stockfishWorker) {
    stockfishWorker.terminate();
    stockfishWorker = null;
  }
}
