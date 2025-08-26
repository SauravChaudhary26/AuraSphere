import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useTimer } from '../../hooks/useTimer';
import { minutesToSeconds, getRemainingTime } from '../../utils/timeUtils';
import JoinRoomForm from './JoinRoomForm';
import StudyRoomInterface from './StudyRoomInterface';
import BreakScreen from './BreakScreen';

const StudyRoom = () => {
  const { socket, connected } = useSocket();
  const [currentUser, setCurrentUser] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [gameState, setGameState] = useState('join'); // 'join', 'studying', 'break'
  const [roomId] = useState('default-room'); // You can make this dynamic
  const [error, setError] = useState('');
  const [completedDuration, setCompletedDuration] = useState(0);

  // Timer management
  const handleTimeEnd = useCallback(() => {
    setCompletedDuration(currentUser?.studyDuration || 0);
    setGameState('break');
    if (socket) {
      socket.emit('leave-study-room', roomId);
    }
  }, [currentUser, socket, roomId]);

  const { timeLeft, startTimer, resetTimer, stopTimer } = useTimer(
    currentUser?.studyDuration || 1500,
    handleTimeEnd
  );

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleRoomUsersUpdated = (users) => {
      console.log('Room users updated:', users);
      // Update time left for other users based on their join time
      const updatedUsers = users.map(user => ({
        ...user,
        timeLeft: getRemainingTime(user.joinedAt, user.studyDuration)
      }));
      setRoomUsers(updatedUsers);
    };

    const handleStudyTimeEnded = () => {
      console.log('Study time ended by server');
      setCompletedDuration(currentUser?.studyDuration || 0);
      setGameState('break');
    };

    const handleJoinedRoomSuccess = ({ roomId: joinedRoomId }) => {
      console.log('Successfully joined room:', joinedRoomId);
      setError('');
    };

    const handleJoinRoomError = (errorMessage) => {
      console.error('Failed to join room:', errorMessage);
      setError(errorMessage || 'Failed to join room');
      setGameState('join');
      setCurrentUser(null);
    };

    const handleUserLeft = ({ socketId, userName }) => {
      console.log('User left:', userName);
      setRoomUsers(prev => prev.filter(user => user.socketId !== socketId));
    };

    // Register socket listeners
    socket.on('room-users-updated', handleRoomUsersUpdated);
    socket.on('study-time-ended', handleStudyTimeEnded);
    socket.on('joined-room-success', handleJoinedRoomSuccess);
    socket.on('join-room-error', handleJoinRoomError);
    socket.on('user-left', handleUserLeft);

    // Cleanup
    return () => {
      socket.off('room-users-updated', handleRoomUsersUpdated);
      socket.off('study-time-ended', handleStudyTimeEnded);
      socket.off('joined-room-success', handleJoinedRoomSuccess);
      socket.off('join-room-error', handleJoinRoomError);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, currentUser]);

  // Handle connection status changes
  useEffect(() => {
    if (!connected && gameState === 'studying') {
      setError('Connection lost. Trying to reconnect...');
    } else if (connected && error === 'Connection lost. Trying to reconnect...') {
      setError('');
    }
  }, [connected, gameState, error]);

  // Auto-reconnect to room if connection is restored
  useEffect(() => {
    if (connected && currentUser && gameState === 'studying') {
      // Re-join the room after reconnection
      const rejoinData = {
        roomId,
        user: currentUser,
        studyDuration: Math.ceil(timeLeft / 60) // Convert remaining time to minutes
      };
      
      socket.emit('join-study-room', rejoinData);
    }
  }, [connected, socket, currentUser, roomId, gameState, timeLeft]);

  const handleJoinRoom = async (userData) => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    try {
      const user = {
        ...userData,
        studyDuration: minutesToSeconds(userData.studyDuration),
        joinedAt: Date.now()
      };

      setCurrentUser(user);
      setGameState('studying');
      resetTimer(user.studyDuration);
      startTimer();
      setError('');

      // Emit join room event
      socket.emit('join-study-room', {
        roomId,
        user,
        studyDuration: userData.studyDuration
      });

    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
      setGameState('join');
      setCurrentUser(null);
      throw err;
    }
  };

  const handleLeaveRoom = () => {
    try {
      if (socket && connected) {
        socket.emit('leave-study-room', roomId);
      }
      
      // Clean up local state
      stopTimer();
      setGameState('join');
      setCurrentUser(null);
      setRoomUsers([]);
      setError('');
      setCompletedDuration(0);
    } catch (err) {
      console.error('Error leaving room:', err);
      // Still clean up local state even if socket fails
      setGameState('join');
      setCurrentUser(null);
      setRoomUsers([]);
      setError('');
    }
  };

  const handleRejoin = () => {
    setGameState('join');
    setCurrentUser(null);
    setRoomUsers([]);
    setError('');
    setCompletedDuration(0);
  };

  // Handle component unmount
  useEffect(() => {
    return () => {
      if (socket && currentUser) {
        socket.emit('leave-study-room', roomId);
      }
    };
  }, [socket, currentUser, roomId]);

  // Render appropriate screen based on state
  if (gameState === 'join') {
    return (
      <JoinRoomForm 
        onJoin={handleJoinRoom} 
        isConnected={connected}
        error={error}
      />
    );
  }

  if (gameState === 'break') {
    return (
      <BreakScreen 
        onRejoin={handleRejoin}
        completedDuration={completedDuration}
        userName={currentUser?.name}
      />
    );
  }

  return (
    <StudyRoomInterface
      user={currentUser}
      onLeave={handleLeaveRoom}
      roomUsers={roomUsers}
      timeLeft={timeLeft}
      isConnected={connected}
      roomId={roomId}
    />
  );
};

export default StudyRoom;