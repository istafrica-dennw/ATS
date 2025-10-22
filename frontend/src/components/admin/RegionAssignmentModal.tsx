import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { Region } from '../../types/user';
import { regionManagementService } from '../../services/regionManagementService';
import { useRegionalAccess } from '../../hooks/useRegionalAccess';
import { toast } from 'react-toastify';

interface RegionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  currentRegion: string | null;
  onRegionUpdated: () => void;
}

const RegionAssignmentModal: React.FC<RegionAssignmentModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentRegion,
  onRegionUpdated
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessInfo } = useRegionalAccess();

  const availableRegions = regionManagementService.getAvailableRegions().filter(region => {
    // Only EU admins can assign EU region
    if (region.value === Region.EU) {
      return accessInfo?.isEUAdmin === true;
    }
    return true;
  });

  useEffect(() => {
    if (isOpen) {
      // Set initial region based on current region
      if (currentRegion && Object.values(Region).includes(currentRegion as Region)) {
        setSelectedRegion(currentRegion as Region);
      } else {
        setSelectedRegion(null);
      }
      setError(null);
    }
  }, [isOpen, currentRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedRegion) {
        await regionManagementService.assignRegion(userId, selectedRegion);
        toast.success(`Successfully assigned ${selectedRegion} region to ${userName}`);
      } else {
        await regionManagementService.removeRegion(userId);
        toast.success(`Successfully removed region from ${userName}`);
      }
      
      onRegionUpdated();
      onClose();
    } catch (error: any) {
      let message = error.response?.data?.message || 'Failed to update region';
      
      // Show specific message for EU region assignment restriction
      if (message.includes('Only EU administrators can assign EU region')) {
        message = 'Access denied: Only EU administrators can assign EU region to users.';
      }
      
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-bottom shadow-xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-6 sm:p-8 sm:pb-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Assign Region
              </h3>
              <button
                type="button"
                className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assigning region for: <span className="font-medium text-gray-900 dark:text-gray-100">{userName}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Current region: {currentRegion || 'Not set'}
              </p>
              {!accessInfo?.isEUAdmin && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> You can only assign non-EU regions. Only EU administrators can assign EU region to users.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Region
                </label>
                <Listbox value={selectedRegion} onChange={setSelectedRegion}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-3 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                      <span className="block truncate">
                        {selectedRegion ? availableRegions.find(r => r.value === selectedRegion)?.label : 'No region (default)'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <Listbox.Option
                          key="none"
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                            }`
                          }
                          value={null}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                No region (default)
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        {availableRegions.map((region) => (
                          <Listbox.Option
                            key={region.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                            value={region.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {region.label}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  {region.description}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Updating...' : 'Update Region'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:mt-0 sm:w-auto transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionAssignmentModal;