import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WorkSetting } from '../../types/job';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedWorkSetting: string;
  onWorkSettingChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  departments: string[];
  locations: string[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

const WORK_SETTINGS = [
  { value: 'ALL', name: 'All Work Settings' },
  { value: 'HYBRID', name: 'Hybrid' },
  { value: 'ONSITE', name: 'On-site' },
  { value: 'REMOTE', name: 'Remote' },
];

const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedWorkSetting,
  onWorkSettingChange,
  selectedDepartment,
  onDepartmentChange,
  selectedLocation,
  onLocationChange,
  departments,
  locations,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors"
          />
        </div>

        {/* Work Setting Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Work Setting
          </label>
          <Listbox value={selectedWorkSetting} onChange={onWorkSettingChange}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-4 pr-10 text-left text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors">
                <span className="block truncate">
                  {WORK_SETTINGS.find((s) => s.value === selectedWorkSetting)?.name || 'All Work Settings'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {WORK_SETTINGS.map((setting) => (
                    <Listbox.Option
                      key={setting.value}
                      value={setting.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                          active
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {setting.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <Listbox value={selectedDepartment} onChange={onDepartmentChange}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-4 pr-10 text-left text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors">
                <span className="block truncate">
                  {selectedDepartment || 'All Departments'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Listbox.Option
                    value=""
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                        active
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          All Departments
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                  {departments.map((dept) => (
                    <Listbox.Option
                      key={dept}
                      value={dept}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                          active
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {dept}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      {/* Active Filters & Reset */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                Search: {searchTerm}
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1.5 hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedWorkSetting !== 'ALL' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {WORK_SETTINGS.find((s) => s.value === selectedWorkSetting)?.name}
                <button
                  onClick={() => onWorkSettingChange('ALL')}
                  className="ml-1.5 hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedDepartment && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {selectedDepartment}
                <button
                  onClick={() => onDepartmentChange('')}
                  className="ml-1.5 hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
