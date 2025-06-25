import { useState, useEffect } from 'react';

export const useDynamicTime = (dateString: string, shortFormat: boolean = false) => {
  const [timeText, setTimeText] = useState<string>('');

  const formatTime = (dateStr: string, short: boolean = false) => {
    try {
      // Handle empty or null dateString
      if (!dateStr || dateStr.trim() === '') {
        return 'recently';
      }

      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string provided to useDynamicTime:', dateStr);
        return 'recently';
      }

      const now = new Date();
      const diffInMilliseconds = now.getTime() - date.getTime();
      
      // Handle future dates (shouldn't happen but just in case)
      if (diffInMilliseconds < 0) {
        return 'just now';
      }
      
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      
      // Ensure we have valid numbers
      if (isNaN(diffInSeconds) || diffInSeconds < 0) {
        return 'recently';
      }
      
      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        if (isNaN(minutes) || minutes <= 0) {
          return 'just now';
        }
        return short ? `${minutes}m ago` : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        if (isNaN(hours) || hours <= 0) {
          return 'just now';
        }
        return short ? `${hours}h ago` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        if (isNaN(days) || days <= 0) {
          return 'just now';
        }
        return short ? `${days}d ago` : `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        if (isNaN(months) || months <= 0) {
          return 'recently';
        }
        return short ? `${months}mo ago` : `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        if (isNaN(years) || years <= 0) {
          return 'recently';
        }
        return short ? `${years}y ago` : `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.warn('Error formatting time for:', dateStr, error);
      return 'recently';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      setTimeText(formatTime(dateString, shortFormat));
    };

    // Update immediately
    updateTime();

    // Update every 30 seconds for real-time updates
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [dateString, shortFormat]);

  return timeText;
}; 