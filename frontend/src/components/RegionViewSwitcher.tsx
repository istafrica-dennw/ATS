import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import regionViewAPI from '../services/regionViewAPI';

const RegionViewSwitcher: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingAsNonEU, setViewingAsNonEU] = useState(false);
  const [isEUAdmin, setIsEUAdmin] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch current view mode
  useEffect(() => {
    const fetchViewMode = async () => {
      try {
        setIsLoading(true);
        const response = await regionViewAPI.getRegionViewMode();
        setViewingAsNonEU(response.viewingAsNonEU || false);
        setIsEUAdmin(response.isEUAdmin || false);
        setCanToggle(response.canToggle || false);
      } catch (error) {
        console.error('Failed to fetch region view mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchViewMode();
    }
  }, [user]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 224, // 224px is w-56 (14rem)
        width: rect.width
      });
    }
  }, [isOpen]);

  // Don't show if not EU admin or loading
  if (isLoading || !isEUAdmin || !canToggle) {
    return null;
  }

  const handleViewChange = async (newView: boolean) => {
    if (newView === viewingAsNonEU || isToggling) return;

    try {
      setIsToggling(true);
      await regionViewAPI.toggleRegionView(newView);
      setViewingAsNonEU(newView);
      setIsOpen(false);
      
      // Reload the page to reflect the change in data
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle region view:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const getViewDisplayName = (): string => {
    return viewingAsNonEU ? 'Non-EU View' : 'EU View';
  };

  const getViewColor = (): string => {
    return viewingAsNonEU 
      ? 'text-blue-600 dark:text-blue-400' 
      : 'text-indigo-600 dark:text-indigo-400';
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isToggling}
          className={`inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-medium rounded-md uppercase tracking-wider transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${getViewColor()} ${
            isToggling ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {getViewDisplayName()}
          <ChevronDownIcon className="ml-1 h-4 w-4" />
        </button>
      </div>

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="fixed z-50 w-56 rounded-md bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                Switch Region View
              </div>
              <button
                onClick={() => handleViewChange(false)}
                disabled={!viewingAsNonEU || isToggling}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  !viewingAsNonEU
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 cursor-default'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    EU View
                  </span>
                  {!viewingAsNonEU && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Current
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleViewChange(true)}
                disabled={viewingAsNonEU || isToggling}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  viewingAsNonEU
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 cursor-default'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400">
                    Non-EU View
                  </span>
                  {viewingAsNonEU && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Current
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default RegionViewSwitcher;

