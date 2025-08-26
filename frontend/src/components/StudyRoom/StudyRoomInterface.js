import { useState } from 'react';
import { Users, Clock, LogOut, AlertCircle } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { formatTime } from '../../utils/timeUtils';

const StudyRoomInterface = ({ 
  user, 
  onLeave, 
  roomUsers = [], 
  timeLeft,
  isConnected,
  roomId 
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    onLeave();
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-500'; // Less than 5 minutes
    if (timeLeft <= 600) return 'text-yellow-500'; // Less than 10 minutes
    return 'text-gray-900';
  };

  const getActiveUsers = () => {
    return roomUsers.filter(u => u.socketId !== user?.socketId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Room info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Virtual Study Room</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{roomUsers.length} participant{roomUsers.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                  </span>
                  {roomId && (
                    <>
                      <span>•</span>
                      <span>Room: {roomId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side - Timer and controls */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-2xl font-bold ${getTimeColor()}`}>
                <Clock className="w-6 h-6" />
                {formatTime(timeLeft)}
              </div>
              
              <button
                onClick={handleLeaveClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>

          {/* Progress bar for time */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft <= 300 ? 'bg-red-500' : 
                timeLeft <= 600 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.max(0, Math.min(100, ((user?.studyDuration - timeLeft) / user?.studyDuration) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Disconnection Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-yellow-800">Connection lost. Attempting to reconnect...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Current User Section */}
        {user && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="max-w-xs">
              <UserAvatar
                user={user}
                timeLeft={timeLeft}
                isCurrentUser={true}
              />
            </div>
          </div>
        )}

        {/* Other Users Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Other Participants ({getActiveUsers().length})
          </h2>
          
          {getActiveUsers().length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {getActiveUsers().map((roomUser) => (
                <UserAvatar
                  key={roomUser.socketId || roomUser.name}
                  user={roomUser}
                  timeLeft={roomUser.timeLeft || 1500}
                  isCurrentUser={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Studying solo for now</p>
              <p className="text-gray-400 text-sm">Others will appear here when they join</p>
            </div>
          )}
        </div>

        {/* Study Tips */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 Study Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>• Minimize distractions around you</p>
              <p>• Take notes by hand when possible</p>
            </div>
            <div>
              <p>• Use the Pomodoro technique</p>
              <p>• Stay hydrated during your session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Study Room?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave? Your progress will be lost and you'll need to rejoin to continue studying.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLeave}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRoomInterface;