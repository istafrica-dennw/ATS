import React from 'react';
import { useRegionalAccess } from '../../hooks/useRegionalAccess';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const RegionalAccessIndicator: React.FC = () => {
  const { accessInfo, loading, error } = useRegionalAccess();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
        <span>Loading access info...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>Access info unavailable</span>
      </div>
    );
  }

  if (!accessInfo) {
    return null;
  }

  const getAccessDisplay = () => {
    if (accessInfo.isEUAdmin) {
      return {
        text: 'EU Admin - EU Data Only',
        color: 'text-blue-600 dark:text-blue-400',
        icon: ShieldCheckIcon,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }
    
    if (accessInfo.isNonEUAdmin) {
      return {
        text: 'Non-EU Admin - Non-EU Data Only',
        color: 'text-green-600 dark:text-green-400',
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    }
    
    return {
      text: 'Full Access',
      color: 'text-gray-600 dark:text-gray-400',
      icon: GlobeAltIcon,
      bgColor: 'bg-gray-50 dark:bg-gray-700/50',
      borderColor: 'border-gray-200 dark:border-gray-600'
    };
  };

  const accessDisplay = getAccessDisplay();
  const IconComponent = accessDisplay.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${accessDisplay.bgColor} ${accessDisplay.borderColor}`}>
      <IconComponent className={`h-4 w-4 mr-2 ${accessDisplay.color}`} />
      <span className={accessDisplay.color}>
        {accessDisplay.text}
      </span>
    </div>
  );
};

export default RegionalAccessIndicator;