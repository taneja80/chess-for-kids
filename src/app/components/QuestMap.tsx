'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import { PUZZLES } from '../../lib/gameData';
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
  const { puzzleProgress, startPuzzle } = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState<typeof PUZZLES[0] | null>(null);

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

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <h2 className={styles.mapTitle}>🗺️ Tactical Quest Map</h2>
        <p className={styles.mapSubtitle}>
          Complete tactical chess puzzles sequentially to save the kingdom and earn massive chest rewards!
        </p>
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
                    ].join(' ')}
                    onClick={() => handleQuestClick(puzzle)}
                    title={puzzle.title}
                  >
                    <div className={styles.nodeIcon}>
                      {isCompleted ? '🏆' : !isUnlocked ? '🔒' : diff.icon}
                    </div>
                    {isCurrent && <span className={styles.pulseRing} />}
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
