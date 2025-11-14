import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface LogoProps {
  className?: string;
  height?: string;
  alt?: string;
}

/**
 * Logo component that switches between EU-specific logos and default logos
 * based on EU access detection and theme (dark/light mode)
 */
const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  height = 'h-10',
  alt = 'IST Logo' 
}) => {
  const { isEU, loading } = useGeolocation();

  // Determine which logos to use based on EU access
  // For EU access: use the new IST logos
  // For other regions: use the current IST-Africa logos
  
  // Wait until region is detected before showing any logo
  if (loading) {
    // Show loading placeholder or nothing while detecting region
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${height} w-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
      </div>
    );
  }

  if (isEU) {
    // EU access detected - use new IST logos
    // Light mode: use dark version of IST logo
    // Dark mode: use light version of IST logo
    return (
      <div className={`flex items-center justify-center min-w-0 ${className}`}>
        <img 
          src="/ist-logo-light.jpeg" 
          alt={alt} 
          className={`${height} w-auto min-w-0 object-contain dark:hidden`}
          onError={(e) => {
            console.error('Failed to load EU logo (dark):', e);
          }}
        />
        <img 
          src="/ist-logo-light.jpeg" 
          alt={alt} 
          className={`${height} w-auto min-w-0 object-contain hidden dark:block`}
          onError={(e) => {
            console.error('Failed to load EU logo (light):', e);
          }}
        />
      </div>
    );
  }

  // Non-EU access - use current IST-Africa logos
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/IST-Africa-logo-dark.png" 
        alt={alt} 
        className={`${height} w-auto object-contain dark:hidden`} 
      />
      <img 
        src="/IST-Africa-logo-light.png" 
        alt={alt} 
        className={`${height} w-auto object-contain hidden dark:block`} 
      />
    </div>
  );
};

export default Logo;

