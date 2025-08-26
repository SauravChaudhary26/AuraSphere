
/**
 * Format seconds into MM:SS or HH:MM:SS format
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert minutes to seconds
 * @param {number} minutes
 * @returns {number} seconds
 */
export const minutesToSeconds = (minutes) => {
  return minutes * 60;
};

/**
 * Convert milliseconds to seconds
 * @param {number} milliseconds
 * @returns {number} seconds
 */
export const millisecondsToSeconds = (milliseconds) => {
  return Math.floor(milliseconds / 1000);
};

/**
 * Get remaining time from join timestamp and duration
 * @param {number} joinedAt - Timestamp when user joined
 * @param {number} studyDuration - Study duration in seconds
 * @returns {number} Remaining seconds
 */
export const getRemainingTime = (joinedAt, studyDuration) => {
  const elapsed = Date.now() - joinedAt;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  return Math.max(0, studyDuration - elapsedSeconds);
};