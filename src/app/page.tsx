'use client';

import React from 'react';
import Link from 'next/link';
import { useGameStore } from '../lib/gameStore';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: '🧙‍♂️',
    title: 'Wizard Coach',
    description: 'Your magical mentor guides you through every move with helpful hints and warnings.',
  },
  {
    icon: '⚔️',
    title: '4 Difficulty Levels',
    description: 'From Squire (easy) to King (expert) — the AI adapts to your skill level.',
  },
  {
    icon: '🏆',
    title: '12 Achievements',
    description: 'Earn badges like "Dragon Slayer" and "Castle Builder" as you master the game.',
  },
  {
    icon: '🪙',
    title: 'Gold Coins',
    description: 'Earn coins for good moves, captures, and winning! Grow your treasury.',
  },
  {
    icon: '↩️',
    title: 'Takeback',
    description: 'Made a mistake? Use the Takeback to undo your last move and learn from it.',
  },
  {
    icon: '🎓',
    title: 'Tutorial Mode',
    description: 'Learn chess step by step, piece by piece, at your own pace.',
  },
];

const PIECES = [
  { symbol: '♔', name: 'King',   color: '#fbbf24', delay: '0s' },
  { symbol: '♕', name: 'Queen',  color: '#a78bfa', delay: '0.2s' },
  { symbol: '♖', name: 'Rook',   color: '#2dd4bf', delay: '0.4s' },
  { symbol: '♗', name: 'Bishop', color: '#f87171', delay: '0.6s' },
  { symbol: '♘', name: 'Knight', color: '#4ade80', delay: '0.8s' },
  { symbol: '♙', name: 'Pawn',   color: '#94a3b8', delay: '1.0s' },
];

export default function HomePage() {
  const { newGame, setPhase } = useGameStore();

  const handlePlay = () => {
    newGame();
    setPhase('playing');
  };

  return (
    <div className={styles.page}>
      {/* ── Hero Section ────────────────────── */}
      <section className={styles.hero}>
        {/* Floating piece decorations */}
        <div className={styles.floatingPieces} aria-hidden="true">
          {PIECES.map(p => (
            <span
              key={p.name}
              className={styles.floatingPiece}
              style={{ color: p.color, animationDelay: p.delay }}
            >
              {p.symbol}
            </span>
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>🏰</span>
            <span>Medieval Chess Academy</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine1}>Chess</span>
            <span className={styles.titleLine2}>for Kids</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Learn chess the fun way! Battle the Wizard AI, earn gold coins,
            and unlock legendary badges on your quest to become a Grand Master. ♟️
          </p>

          <div className={styles.heroCta}>
            <Link href="/game" id="btn-play-now">
              <button className={`btn btn-gold ${styles.heroBtn}`} onClick={handlePlay}>
                ⚔️ Play Now!
              </button>
            </Link>
            <Link href="/tutorial" id="btn-learn">
              <button className={`btn btn-primary ${styles.heroBtn}`}>
                🎓 Learn First
              </button>
            </Link>
          </div>

          {/* Mini piece showcase */}
          <div className={styles.pieceShowcase}>
            {PIECES.map(p => (
              <div key={p.name} className={styles.pieceCard}>
                <span className={styles.pieceSymbol} style={{ color: p.color }}>
                  {p.symbol}
                </span>
                <span className={styles.pieceName}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────── */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>
          🌟 Why Kids Love It
        </h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to Play Section ─────────────── */}
      <section className={styles.howTo}>
        <h2 className={styles.sectionTitle}>🗺️ Your Quest Begins</h2>
        <div className={styles.steps}>
          {[
            { n: '1', icon: '🎓', title: 'Start the Tutorial', desc: 'Learn how each piece moves in fun mini-quests.' },
            { n: '2', icon: '⚔️', title: 'Battle the AI', desc: 'Challenge the Squire AI and work your way up to King level.' },
            { n: '3', icon: '🏆', title: 'Earn Badges', desc: 'Complete achievements and build your legendary reputation.' },
          ].map(step => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepNumber}>{step.n}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────── */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaCard}>
          <h2 className={styles.finalCtaTitle}>Ready for Battle? ⚔️</h2>
          <p className={styles.finalCtaDesc}>
            The chessboard awaits. Will you become the next Grand Master?
          </p>
          <Link href="/game">
            <button className={`btn btn-gold ${styles.finalCtaBtn}`} onClick={handlePlay}>
              ♟️ Start Playing Now
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className={styles.footer}>
        <p>♟ Chess for Kids — Medieval Chess Academy © 2025</p>
      </footer>
    </div>
  );
}
