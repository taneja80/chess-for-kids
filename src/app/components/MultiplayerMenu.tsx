'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './MultiplayerMenu.module.css';

export default function MultiplayerMenu() {
  const {
    isMultiplayer,
    roomId,
    createMultiplayerRoom,
    joinMultiplayerRoom,
    leaveMultiplayerRoom
  } = useGameStore();

  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async () => {
    await createMultiplayerRoom();
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    await joinMultiplayerRoom(joinCode.trim());
    setIsJoining(false);
    setJoinCode('');
  };

  if (isMultiplayer && roomId) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🌐 Multiplayer Mode</h3>
        <div className={styles.activeRoom}>
          <div className={styles.roomCodeBox}>
            <span className={styles.label}>Room Code</span>
            <span className={styles.code}>{roomId}</span>
          </div>
          <button className={`btn btn-ghost ${styles.leaveBtn}`} onClick={leaveMultiplayerRoom}>
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🌐 Play with a Friend</h3>
      
      <div className={styles.actions}>
        <button className={`btn btn-gold ${styles.createBtn}`} onClick={handleCreate}>
          🪄 Create New Room
        </button>
        
        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <form className={styles.joinForm} onSubmit={handleJoin}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.joinBtn}`}
            disabled={!joinCode.trim() || isJoining}
          >
            {isJoining ? '...' : 'Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
