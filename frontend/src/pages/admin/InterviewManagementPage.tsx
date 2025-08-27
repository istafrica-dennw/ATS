import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import InterviewSkeletonManagementPage from './InterviewSkeletonManagementPage';
import InterviewAssignmentPage from './InterviewAssignmentPage';
import InterviewResultsPage from './InterviewResultsPage';

type ActiveSection = 'skeletons' | 'assignments' | 'results';

const InterviewManagementPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('skeletons');
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle section change
  const handleSectionChange = (sectionId: ActiveSection) => {
    setActiveSection(sectionId);
    setShowDropdown(false);
  };

  const sections = [
    {
      id: 'skeletons' as const,
      name: 'Interview Skeletons',
      description: 'Create and manage templates',
      icon: DocumentTextIcon,
      component: InterviewSkeletonManagementPage
    },
    {
      id: 'assignments' as const,
      name: 'Interview Assignments',
      description: 'Assign interviews to candidates',
      icon: ClipboardDocumentListIcon,
      component: InterviewAssignmentPage
    },
    {
      id: 'results' as const,
      name: 'Interview Results',
      description: 'View and compare results',
      icon: ChartBarIcon,
      component: InterviewResultsPage
    }
  ];

  const currentSection = sections.find(section => section.id === activeSection);
  const CurrentComponent = currentSection?.component;

  return (
    <div className="space-y-8">
      {/* Header with Dropdown Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Management</h1>
            
            {/* Dropdown Navigation */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transform hover:scale-[1.02] transition-all duration-200"
              >
                {currentSection && (
                  <>
                    <currentSection.icon className="h-5 w-5" />
                    {currentSection.name}
                  </>
                )}
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          activeSection === section.id 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <section.icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{section.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-screen">
        {CurrentComponent && <CurrentComponent />}
      </div>
    </div>
  );
};

export default InterviewManagementPage;