import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Region } from '../../types/user';
import { 
  GlobeAltIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const GeolocationIndicator: React.FC = () => {
  const { region, isEU, isRwanda, ip, loading, error } = useGeolocation();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
        <span>Detecting location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>Location detection failed</span>
      </div>
    );
  }

  const getRegionDisplay = () => {
    switch (region) {
      case Region.EU:
        return { text: 'Europe (EU)', color: 'text-blue-600 dark:text-blue-400', icon: CheckCircleIcon };
      case Region.RW:
        return { text: 'Rwanda', color: 'text-green-600 dark:text-green-400', icon: CheckCircleIcon };
      case Region.OTHER:
        return { text: 'Other Region', color: 'text-gray-600 dark:text-gray-400', icon: GlobeAltIcon };
      default:
        return { text: 'Unknown', color: 'text-gray-500 dark:text-gray-500', icon: XCircleIcon };
    }
  };

  const regionDisplay = getRegionDisplay();
  const IconComponent = regionDisplay.icon;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <IconComponent className={`h-4 w-4 ${regionDisplay.color}`} />
      <span className={regionDisplay.color}>
        {regionDisplay.text}
      </span>
      {ip && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({ip})
        </span>
      )}
    </div>
  );
};

export default GeolocationIndicator;