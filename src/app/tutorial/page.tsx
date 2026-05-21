'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import TutorialBoard, { QuestConfig } from '../components/TutorialBoard';

interface Lesson {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  content: string;
  quest: QuestConfig;
}

const LESSONS: Lesson[] = [
  {
    id: 'board',
    icon: '🏰',
    title: 'The Kingdom (Board)',
    subtitle: 'Learn the battlefield',
    color: '#fbbf24',
    content: `The chess board is your kingdom! It has 64 squares arranged in 8 rows (called **ranks**, numbered 1-8) and 8 columns (called **files**, labeled a-h).

The board always starts with a **light square** in the bottom-right corner. Remember: "Light on Right!"

Each square has a unique name like **e4** (file e, rank 4). This is called **chess notation**.

🟨 **Light squares** and 🟫 **Dark squares** alternate in a checkerboard pattern.

Your pieces start at ranks 1 and 2, and your opponent starts at ranks 7 and 8.`,
    quest: {
      id: 'board',
      mode: 'click_sequence',
      fen: 'k7/8/8/8/8/8/8/7K w - - 0 1',
      instruction: 'Brave Squire! Click on the coordinate e4, then d5, and finally f3!',
      targets: ['e4', 'd5', 'f3'],
    },
  },
  {
    id: 'king',
    icon: '♔',
    title: 'The King',
    subtitle: 'Protect the royal family!',
    color: '#fbbf24',
    content: `The **King** (♔) is the most important piece on the board. If your King is captured, you lose the game!

**How the King moves:**
The King can move **one square** in any direction — forward, backward, sideways, or diagonally. It's slow but powerful!

⚠️ **Danger zone:** Your King must never move into a square where it can be captured by an enemy piece. This is called **check**.

🏰 **Castling:** The King has one special move — it can castle with the Rook to keep itself safe (we'll learn this later!).

The King is slow — keep it safe behind your pawns!`,
    quest: {
      id: 'king',
      mode: 'move_piece',
      fen: 'k7/8/8/8/8/8/r7/4K3 w - - 0 1',
      instruction: 'Your King is trapped by the Rook on rank 2! March safely to f1.',
      targets: ['f1'],
    },
  },
  {
    id: 'queen',
    icon: '♕',
    title: 'The Queen',
    subtitle: 'The most powerful piece!',
    color: '#a78bfa',
    content: `The **Queen** (♕) is the most powerful piece in chess! She is the warrior queen of your army.

**How the Queen moves:**
The Queen can move in **any direction** — forward, backward, sideways, or diagonally — as many squares as she wants!

She combines the powers of the Rook AND the Bishop. This makes her incredibly powerful.

🐉 **Tip:** The Queen is worth **9 points** (way more than any other piece). Guard her with your life!

In our game, capturing the enemy Queen earns you the **Dragon Slayer** 🐉 badge!`,
    quest: {
      id: 'queen',
      mode: 'move_piece',
      fen: 'k7/3p4/8/8/3Q4/8/6p1/7K w - - 0 1',
      instruction: 'The Warrior Queen is ready! Capture the pawn on d8 first, then on g7!',
      targets: ['d8', 'g7'],
    },
  },
  {
    id: 'rook',
    icon: '♖',
    title: 'The Rook',
    subtitle: 'The castle on wheels!',
    color: '#2dd4bf',
    content: `The **Rook** (♖) looks like a castle tower and moves like one too — strong and straight!

**How the Rook moves:**
The Rook can move as many squares as it likes, but only in a **straight line** — horizontally or vertically. No diagonal moves!

Two Rooks working together are incredibly powerful — they can control entire rows and columns.

🏰 **Castling:** The Rook can do a special move with the King called **castling**. The King slides two squares toward the Rook, and the Rook jumps over to the other side!

The Rook is worth **5 points**.`,
    quest: {
      id: 'rook',
      mode: 'move_piece',
      fen: '4k2p/p7/8/8/8/8/8/R6K w - - 0 1',
      instruction: 'A castle on wheels! Capture the pawn on a8 first, then turn right and capture h8!',
      targets: ['a8', 'h8'],
    },
  },
  {
    id: 'bishop',
    icon: '♗',
    title: 'The Bishop',
    subtitle: 'The diagonal master!',
    color: '#f87171',
    content: `The **Bishop** (♗) is the church's representative and glides gracefully across the board on the diagonal.

**How the Bishop moves:**
The Bishop can move as many squares as it likes, but only **diagonally**. 

Because it always stays on the same color, each player has one Bishop that only moves on **light squares** and one that only moves on **dark squares**.

🎯 **Strategy tip:** Keep both your Bishops! Together, they cover all the squares on the board.

The Bishop is worth **3 points**.`,
    quest: {
      id: 'bishop',
      mode: 'move_piece',
      fen: 'k7/2p5/8/8/5p2/8/8/2B4K w - - 0 1',
      instruction: 'Glide on the dark squares! Capture both goblin pawns: first f4, then c7!',
      targets: ['f4', 'c7'],
    },
  },
  {
    id: 'knight',
    icon: '♘',
    title: 'The Knight',
    subtitle: 'The tricky jumper!',
    color: '#4ade80',
    content: `The **Knight** (♘) is the most unique piece in chess — it moves in an L-shape and is the ONLY piece that can **jump over** other pieces!

**How the Knight moves:**
The Knight moves in an **L-shape**: 2 squares in one direction, then 1 square perpendicular (or vice versa). It can jump over any piece in its way.

🐴 **Fun fact:** The Knight always lands on a different colored square than where it started!

Knights are great in crowded positions because they can jump right over the traffic!

The Knight is worth **3 points**.`,
    quest: {
      id: 'knight',
      mode: 'move_piece',
      fen: 'k7/8/8/8/8/8/8/6NK w - - 0 1',
      instruction: 'The tricky Knight jumps over boundaries! Hop to f3, then jump to target e5!',
      targets: ['f3', 'e5'],
    },
  },
  {
    id: 'pawn',
    icon: '♙',
    title: 'The Pawn',
    subtitle: 'Little heroes with big dreams!',
    color: '#94a3b8',
    content: `The **Pawn** (♙) is the foot soldier of your army. They seem weak, but they have secret powers!

**How the Pawn moves:**
- Pawns move **forward** one square at a time
- On their very first move, they can move **two squares** forward
- Pawns **capture diagonally** (one square forward-diagonal)

✨ **Secret power — Promotion:** If a pawn reaches the **other end of the board** (rank 8 for white, rank 1 for black), it gets promoted! It can become a Queen, Rook, Bishop, or Knight!

In our game, promoting a pawn earns the **Royal Ascension** ✨ badge!

Each pawn is worth **1 point**.`,
    quest: {
      id: 'pawn',
      mode: 'move_piece',
      fen: 'k7/2p5/3P4/8/8/8/8/7K w - - 0 1',
      instruction: 'Capture the goblin pawn on c7, then advance to c8 to promote to a Queen!',
      targets: ['c7', 'c8'],
    },
  },
  {
    id: 'check',
    icon: '⚠️',
    title: 'Check & Checkmate',
    subtitle: 'The goal of the game!',
    color: '#f87171',
    content: `Now you know all the pieces — time to learn how to WIN!

⚠️ **Check:** When your piece threatens to capture the opponent's King, the King is "in check." Your opponent MUST get out of check on their next move.

Ways to escape check:
1. **Move the King** to a safe square
2. **Block** the attacking piece with another piece
3. **Capture** the attacking piece

♟ **Checkmate:** When the King is in check AND there's no way to escape — that's **CHECKMATE**! The game is over and you WIN!

🎉 Winning the game earns you the legendary **Grand Master** 🏆 badge!`,
    quest: {
      id: 'check',
      mode: 'move_piece',
      fen: '7k/5Q2/8/8/3B4/8/8/6K1 w - - 0 1',
      instruction: 'Deliver the final blow! Move your Queen to g7 to deliver checkmate!',
      targets: ['g7'],
    },
  },
];

export default function TutorialPage() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  const lesson = LESSONS[currentLesson];

  const handleQuestSuccess = () => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson);
    setCompletedLessons(newCompleted);
  };

  const goNext = () => {
    if (currentLesson < LESSONS.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const allDone = completedLessons.size === LESSONS.length;

  // Parse **bold** markdown
  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: '#fbbf24' }}>{part}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/">
          <button className={`btn btn-ghost ${styles.backBtn}`}>← Home</button>
        </Link>
        <h1 className={styles.title}>🎓 Chess Tutorial</h1>
        <div className={styles.progressText}>
          {completedLessons.size}/{LESSONS.length} done
        </div>
      </header>

      <main className={styles.main}>
        {/* Lesson sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>📚 Lessons</h2>
          <div className={styles.lessonList}>
            {LESSONS.map((l, i) => (
              <button
                key={l.id}
                id={`lesson-${l.id}`}
                className={[
                  styles.lessonBtn,
                  i === currentLesson ? styles.lessonBtnActive : '',
                  completedLessons.has(i) ? styles.lessonBtnDone : '',
                ].join(' ')}
                onClick={() => { setCurrentLesson(i); }}
              >
                <span className={styles.lessonBtnIcon}>{l.icon}</span>
                <span className={styles.lessonBtnLabel}>{l.title}</span>
                {completedLessons.has(i) && <span className={styles.doneCheck}>✓</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Lesson content */}
        <div className={styles.content}>
          <div
            className={styles.lessonCard}
            style={{ '--lesson-color': lesson.color } as React.CSSProperties}
          >
            {/* Lesson header */}
            <div className={styles.lessonHeader}>
              <span className={styles.lessonIcon}>{lesson.icon}</span>
              <div>
                <h2 className={styles.lessonTitle}>{lesson.title}</h2>
                <p className={styles.lessonSubtitle}>{lesson.subtitle}</p>
              </div>
            </div>

            {/* Lesson text */}
            <div className={styles.lessonBody}>
              {lesson.content.split('\n\n').map((para, i) => (
                <p key={i} className={styles.lessonPara}>
                  {renderContent(para)}
                </p>
              ))}
            </div>

            {/* Interactive Chess Board Mini-Quest */}
            <div className={styles.quiz}>
              <h3 className={styles.quizTitle}>🧠 Interactive Challenge</h3>
              <TutorialBoard
                key={lesson.id}
                quest={lesson.quest}
                onSuccess={handleQuestSuccess}
              />
            </div>

            {/* Navigation */}
            <div className={styles.navigation}>
              <button
                id="lesson-prev"
                className="btn btn-ghost"
                onClick={goPrev}
                disabled={currentLesson === 0}
              >
                ← Previous
              </button>
              <span className={styles.navProgress}>
                {currentLesson + 1} / {LESSONS.length}
              </span>
              {currentLesson < LESSONS.length - 1 ? (
                <button
                  id="lesson-next"
                  className="btn btn-primary"
                  onClick={goNext}
                >
                  Next →
                </button>
              ) : (
                <Link href="/game">
                  <button id="btn-start-game" className="btn btn-gold">
                    ⚔️ Play Now!
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* All done banner */}
          {allDone && (
            <div className={styles.allDoneBanner}>
              <span className={styles.allDoneEmoji}>🏆</span>
              <div>
                <h3 className={styles.allDoneTitle}>You&apos;ve completed all lessons!</h3>
                <p className={styles.allDoneDesc}>You&apos;re ready for battle. Go challenge the Wizard AI!</p>
              </div>
              <Link href="/game">
                <button id="btn-done-play" className="btn btn-gold">⚔️ Play!</button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
