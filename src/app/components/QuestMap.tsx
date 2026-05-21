'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import { PUZZLES } from '../../lib/gameData';
import { getDailyPuzzleId, getTodayDateStr } from '../../lib/daily';
import styles from './QuestMap.module.css';

interface QuestMapProps {
  onAttemptQuest: () => void;
}

const DIFFICULTY_LABELS = {
  squire: { text: 'Squire (Easy)', color: '#4ade80', icon: '🗡️' },
  knight: { text: 'Knight (Medium)', color: '#38bdf8', icon: '🛡️' },
  bishop: { text: 'Bishop (Hard)', color: '#fbbf24', icon: '⛪' },
};

export default function QuestMap({ onAttemptQuest }: QuestMapProps) {
  const {
    puzzleProgress,
    startPuzzle,
    dailyStreak,
    dailyBestStreak,
    lastDailyDate,
  } = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState<typeof PUZZLES[0] | null>(null);

  const today = getTodayDateStr();
  const dailyPuzzleId = getDailyPuzzleId(today);
  const dailyPuzzle = PUZZLES.find((p) => p.id === dailyPuzzleId) || PUZZLES[0];
  const dailyClaimedToday = lastDailyDate === today;

  const isPuzzleUnlocked = (puzzleId: string) => {
    if (puzzleId === 'p1') return true;
    const index = parseInt(puzzleId.replace('p', ''));
    const prevId = 'p' + (index - 1);
    return !!puzzleProgress[prevId];
  };

  const handleQuestClick = (quest: typeof PUZZLES[0]) => {
    if (isPuzzleUnlocked(quest.id)) {
      setSelectedQuest(quest);
    }
  };

  const handleStartQuest = () => {
    if (!selectedQuest) return;
    startPuzzle(selectedQuest.id);
    setSelectedQuest(null);
    onAttemptQuest();
  };

  const handleStartDaily = () => {
    startPuzzle(dailyPuzzle.id);
    onAttemptQuest();
  };

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <h2 className={styles.mapTitle}>🗺️ Tactical Quest Map</h2>
        <p className={styles.mapSubtitle}>
          Complete tactical chess puzzles sequentially to save the kingdom and earn massive chest rewards!
        </p>
      </div>

      {/* ── Daily Quest featured card ─────────────────── */}
      <div
        className={[styles.dailyCard, dailyClaimedToday ? styles.dailyDone : ''].join(' ')}
        id="daily-quest-card"
      >
        <div className={styles.dailyLeft}>
          <div className={styles.dailyEyebrow}>
            <span className={styles.dailySparkle}>✨</span>
            <span>Today&apos;s Daily Quest</span>
          </div>
          <h3 className={styles.dailyTitle}>{dailyPuzzle.title}</h3>
          <p className={styles.dailyDesc}>{dailyPuzzle.description}</p>
          <div className={styles.dailyMeta}>
            <span className={styles.dailyReward}>🪙 {dailyPuzzle.reward * 2} gold (2× bonus!)</span>
          </div>
        </div>

        <div className={styles.dailyRight}>
          <div className={styles.streakBox} title={`Best streak: ${dailyBestStreak}`}>
            <span className={styles.streakIcon}>🔥</span>
            <div className={styles.streakInfo}>
              <span className={styles.streakNum}>{dailyStreak}</span>
              <span className={styles.streakLabel}>day streak</span>
            </div>
          </div>
          {dailyClaimedToday ? (
            <div className={styles.dailyDoneBadge}>✅ Claimed today</div>
          ) : (
            <button
              id="btn-start-daily"
              className={`btn btn-gold ${styles.dailyBtn}`}
              onClick={handleStartDaily}
            >
              ⚔️ Play Today&apos;s Quest
            </button>
          )}
        </div>
      </div>

      {/* Interactive winding road map */}
      <div className={styles.scrollContainer}>
        <div className={styles.mapBackground}>
          <div className={styles.nodesContainer}>
            {PUZZLES.map((puzzle, index) => {
              const isCompleted = !!puzzleProgress[puzzle.id];
              const isUnlocked = isPuzzleUnlocked(puzzle.id);
              const isCurrent = isUnlocked && !isCompleted;
              const diff = DIFFICULTY_LABELS[puzzle.difficulty] || DIFFICULTY_LABELS.squire;
              const isToday = puzzle.id === dailyPuzzleId;

              return (
                <div key={puzzle.id} className={styles.nodeWrapper}>
                  {/* Winding path line connector (except for the last one) */}
                  {index < PUZZLES.length - 1 && (
                    <div
                      className={[
                        styles.pathConnector,
                        isPuzzleUnlocked(PUZZLES[index + 1].id) ? styles.pathUnlocked : '',
                      ].join(' ')}
                    />
                  )}

                  {/* The interactive node circle */}
                  <div
                    className={[
                      styles.node,
                      isCompleted ? styles.nodeCompleted : '',
                      isCurrent ? styles.nodeCurrent : '',
                      !isUnlocked ? styles.nodeLocked : '',
                      isToday ? styles.nodeToday : '',
                    ].join(' ')}
                    onClick={() => handleQuestClick(puzzle)}
                    title={puzzle.title}
                  >
                    <div className={styles.nodeIcon}>
                      {isCompleted ? '🏆' : !isUnlocked ? '🔒' : diff.icon}
                    </div>
                    {isCurrent && <span className={styles.pulseRing} />}
                    {isToday && <span className={styles.todayDot} aria-label="Today's daily quest">⭐</span>}
                  </div>

                  {/* Level details details below node */}
                  <div className={styles.nodeDetails}>
                    <span className={styles.nodeNumber}>Quest {index + 1}</span>
                    <h4 className={styles.nodeTitle}>{puzzle.title.split(' - ')[0]}</h4>
                    <span
                      className={styles.nodeDifficulty}
                      style={{ color: isUnlocked ? diff.color : '#6b7280' }}
                    >
                      {isUnlocked ? diff.text : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quest Details Modal Pop-Up */}
      {selectedQuest && (
        <div className={styles.modalOverlay} onClick={() => setSelectedQuest(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalCategory}>⚔️ Current Active Quest ⚔️</span>
              <h3 className={styles.modalTitle}>{selectedQuest.title}</h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.difficultyBadge}>
                <span>{DIFFICULTY_LABELS[selectedQuest.difficulty]?.icon}</span>
                <span>{DIFFICULTY_LABELS[selectedQuest.difficulty]?.text} Challenge</span>
              </div>

              <p className={styles.modalDesc}>{selectedQuest.description}</p>

              <div className={styles.rewardBox}>
                <span className={styles.rewardLabel}>Completion Reward:</span>
                <span className={styles.rewardAmount}>🪙 {selectedQuest.reward} Gold Coins</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-primary btn-full" onClick={handleStartQuest}>
                ⚔️ Start Quest Challenge
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setSelectedQuest(null)}>
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
