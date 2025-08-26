import { formatTime } from '../../utils/timeUtils';

const UserAvatar = ({ user, timeLeft, isCurrentUser = false }) => {
  // Calculate progress percentage
  const studyDurationSeconds = user.studyDuration || 1500; // Default 25 minutes
  const progress = studyDurationSeconds > 0 ? 
    ((studyDurationSeconds - timeLeft) / studyDurationSeconds) * 100 : 0;
  
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Generate avatar color based on user name
  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600',
      'from-teal-400 to-teal-600'
    ];
    const hash = name?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
      isCurrentUser 
        ? 'border-blue-300 shadow-lg' 
        : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
    }`}>
      {/* Progress Ring */}
      <div className="relative w-20 h-20 mb-3">
        {/* Background circle */}
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="m 18,2.0845 a 15.9155,15.9155 0 0 1 0,31.831 a 15.9155,15.9155 0 0 1 0,-31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <path
            d="m 18,2.0845 a 15.9155,15.9155 0 0 1 0,31.831 a 15.9155,15.9155 0 0 1 0,-31.831"
            fill="none"
            stroke={timeLeft <= 300 ? "#ef4444" : "#3b82f6"} // Red when < 5 minutes
            strokeWidth="2"
            strokeDasharray={`${clampedProgress}, 100`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* User Avatar */}
        <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white text-lg font-semibold shadow-inner`}>
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Current user indicator */}
        {isCurrentUser && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* User Info */}
      <div className="text-center min-h-[40px] flex flex-col justify-center">
        <p className={`font-medium truncate max-w-[80px] ${
          isCurrentUser ? 'text-blue-900' : 'text-gray-900'
        }`} title={user.name}>
          {user.name || 'Anonymous'}
        </p>
        <p className={`text-sm mt-1 ${
          timeLeft <= 300 ? 'text-red-500 font-medium' : 'text-gray-500'
        }`}>
          {formatTime(timeLeft)}
        </p>
        {isCurrentUser && (
          <p className="text-xs text-blue-600 mt-1">You</p>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;