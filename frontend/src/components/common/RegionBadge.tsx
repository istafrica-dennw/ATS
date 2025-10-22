import React from 'react';
import { Region } from '../../types/user';
import { 
  GlobeEuropeAfricaIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RegionBadgeProps {
  region: string | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const RegionBadge: React.FC<RegionBadgeProps> = ({ 
  region, 
  size = 'md', 
  showIcon = true 
}) => {
  const getRegionInfo = (region: string | null) => {
    switch (region) {
      case Region.EU:
        return {
          label: 'EU',
          fullLabel: 'Europe',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          icon: GlobeEuropeAfricaIcon,
          description: 'European Union'
        };
      case Region.RW:
        return {
          label: 'RW',
          fullLabel: 'Rwanda',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          icon: MapPinIcon,
          description: 'Rwanda'
        };
      case Region.OTHER:
        return {
          label: 'OTHER',
          fullLabel: 'Other',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: GlobeAltIcon,
          description: 'Other Region'
        };
      default:
        return {
          label: 'None',
          fullLabel: 'No Region',
          color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
          icon: ExclamationTriangleIcon,
          description: 'No region assigned'
        };
    }
  };

  const regionInfo = getRegionInfo(region);
  const IconComponent = regionInfo.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${regionInfo.color}`}
      title={regionInfo.description}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} mr-1`} />
      )}
      {regionInfo.label}
    </span>
  );
};

export default RegionBadge;