import { useState, useEffect } from 'react';
import { Coffee, Play, RotateCcw, Award } from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';

const BreakScreen = ({ onRejoin, completedDuration, userName }) => {
  const [breakTime, setBreakTime] = useState(0);
  
  useEffect(() => {
    // Start break timer
    const interval = setInterval(() => {
      setBreakTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCompletedTime = () => {
    if (!completedDuration) return 'Unknown duration';
    const minutes = Math.floor(completedDuration / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const getMotivationalMessage = () => {
    if (!completedDuration) return "Great job studying!";
    
    const minutes = Math.floor(completedDuration / 60);
    if (minutes >= 120) return "Outstanding dedication! 🌟";
    if (minutes >= 90) return "Incredible focus! 💪";
    if (minutes >= 60) return "Amazing work! 🎯";
    if (minutes >= 45) return "Great concentration! 👏";
    if (minutes >= 25) return "Excellent session! ✨";
    return "Good start! Keep going! 🚀";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Award className="w-12 h-12 text-white" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getMotivationalMessage()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {userName && `${userName}, you've`} completed a {formatCompletedTime()} study session!
        </p>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCompletedTime()}
              </div>
              <div className="text-sm text-gray-600">Studied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(breakTime)}
              </div>
              <div className="text-sm text-gray-600">Break Time</div>
            </div>
          </div>
        </div>

        {/* Break suggestions */}
        <div className="text-left mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            Break Suggestions:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Stretch or take a short walk</li>
            <li>• Hydrate with water</li>
            <li>• Do some deep breathing</li>
            <li>• Rest your eyes from the screen</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRejoin}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Start Another Session
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Return to AuraSphere
          </button>
        </div>

        {/* Encouragement */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 Regular study sessions help build lasting habits!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreakScreen;