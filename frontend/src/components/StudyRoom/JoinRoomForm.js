import  { useState } from 'react';
import { Users, Play, Clock, AlertCircle } from 'lucide-react';

const JoinRoomForm = ({ onJoin, isConnected }) => {
  const [name, setName] = useState('');
  const [studyDuration, setStudyDuration] = useState(25);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const studyOptions = [
	{ value: 1, label: '1 minutes'},
    { value: 15, label: '15 minutes' },
    { value: 25, label: '25 minutes (Pomodoro)' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const handleSubmit = async () => {
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!isConnected) {
      setError('Not connected to server. Please try again.');
      return;
    }

    setIsJoining(true);

    try {
      await onJoin({
        name: name.trim(),
        studyDuration,
        avatar: name.trim().charAt(0).toUpperCase()
      });
    } catch (err) {
      setError('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Study Room</h1>
          <p className="text-gray-600">Start your focused study session</p>
          
          {/* Connection Status */}
          <div className={`flex items-center justify-center gap-2 mt-3 text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your name"
              maxLength={20}
              disabled={isJoining}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/20 characters
            </p>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Study Duration
            </label>
            <select
              value={studyDuration}
              onChange={(e) => setStudyDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isJoining}
            >
              {studyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Join Button */}
          <button
            onClick={handleSubmit}
            disabled={isJoining || !isConnected || !name.trim()}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isJoining || !isConnected || !name.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isJoining ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Studying
              </>
            )}
          </button>

          {/* Tips */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 Tip: Use the Pomodoro technique (25 min) for better focus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomForm;