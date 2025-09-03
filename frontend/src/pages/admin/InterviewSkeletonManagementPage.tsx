import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { interviewSkeletonAPI, skeletonJobAssociationAPI } from '../../services/api';
import { jobService, JobDTO } from '../../services/jobService';
import { InterviewSkeleton, CreateInterviewSkeletonRequest } from '../../types/interview';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
      type === 'success' 
        ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' 
        : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
    } border rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-4`}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface FocusAreaForm {
  title: string;
  description: string;
}

interface SkeletonWithJobs {
  id: number;
  name: string;
  description?: string;
  focusAreas: {
    title: string;
    description?: string;
    weight?: number;
  }[];
  associatedJobs: {
    id: number;
    title: string;
    status: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

const InterviewSkeletonManagementPage: React.FC = () => {
  const [skeletons, setSkeletons] = useState<SkeletonWithJobs[]>([]);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showJobAssociationModal, setShowJobAssociationModal] = useState(false);
  const [editingSkeleton, setEditingSkeleton] = useState<InterviewSkeleton | null>(null);
  const [selectedSkeletonForJobs, setSelectedSkeletonForJobs] = useState<SkeletonWithJobs | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    focusAreas: [{ title: '', description: '' }] as FocusAreaForm[]
  });

  useEffect(() => {
    fetchSkeletons();
  }, []);

  const fetchSkeletons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching skeletons with jobs...');
      
      const [skeletonsResponse, jobsResponse] = await Promise.all([
        skeletonJobAssociationAPI.getSkeletonsWithJobs(),
        jobService.getAllJobs()
      ]);
      
      console.log('Skeletons response:', skeletonsResponse);
      console.log('Jobs response:', jobsResponse);
      
      setSkeletons(skeletonsResponse.data || []);
      setJobs(jobsResponse || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load skeletons. Please try again.');
      setSkeletons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSkeleton(null);
    setFormData({
      name: '',
      description: '',
      focusAreas: [{ title: '', description: '' }]
    });
    setShowModal(true);
  };

  const handleEdit = (skeleton: InterviewSkeleton) => {
    setEditingSkeleton(skeleton);
    setFormData({
      name: skeleton.name,
      description: skeleton.description || '',
      focusAreas: skeleton.focusAreas.map(area => ({
        title: area.title,
        description: area.description || ''
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this interview skeleton?')) {
      return;
    }

    try {
      await interviewSkeletonAPI.delete(id);
      fetchSkeletons();
    } catch (err) {
      console.error('Error deleting skeleton:', err);
      setError('Failed to delete interview skeleton');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.focusAreas.length === 0 || !formData.focusAreas[0].title.trim()) {
      setError('At least one focus area is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestData: CreateInterviewSkeletonRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        focusAreas: formData.focusAreas
          .filter(area => area.title.trim())
          .map(area => ({
            title: area.title.trim(),
            description: area.description.trim() || undefined
          }))
      };

      if (editingSkeleton) {
        await interviewSkeletonAPI.update(editingSkeleton.id, requestData);
      } else {
        await interviewSkeletonAPI.create(requestData);
      }

      setShowModal(false);
      fetchSkeletons();
    } catch (err) {
      console.error('Error saving skeleton:', err);
      setError('Failed to save interview skeleton');
    } finally {
      setSubmitting(false);
    }
  };

  const addFocusArea = () => {
    setFormData(prev => ({
      ...prev,
      focusAreas: [...prev.focusAreas, { title: '', description: '' }]
    }));
  };

  const removeFocusArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, i) => i !== index)
    }));
  };

  const updateFocusArea = (index: number, field: keyof FocusAreaForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.map((area, i) => 
        i === index ? { ...area, [field]: value } : area
      )
    }));
  };

  const handleJobAssociation = (skeleton: SkeletonWithJobs) => {
    setSelectedSkeletonForJobs(skeleton);
    setSelectedJobIds(skeleton.associatedJobs.map(job => job.id));
    setShowJobAssociationModal(true);
  };

  const handleSaveJobAssociations = async () => {
    if (!selectedSkeletonForJobs) return;

    try {
      setSubmitting(true);
      await skeletonJobAssociationAPI.associateSkeletonWithJobs({
        skeletonId: selectedSkeletonForJobs.id,
        jobIds: selectedJobIds
      });
      
      // Refresh skeletons to show updated associations
      await fetchSkeletons();
      
      // Show success message
      const jobCount = selectedJobIds.length;
      setToast({
        message: `Successfully ${jobCount === 0 ? 'removed all job associations' : `associated skeleton with ${jobCount} job(s)`}`,
        type: 'success'
      });
      
      setShowJobAssociationModal(false);
      setSelectedSkeletonForJobs(null);
      setSelectedJobIds([]);
    } catch (err) {
      console.error('Error saving job associations:', err);
      setToast({
        message: 'Failed to save job associations. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleJobSelection = (jobId: number) => {
    setSelectedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Helper function to determine if changes were made
  const hasChanges = () => {
    if (!selectedSkeletonForJobs) return false;
    const currentJobIds = selectedSkeletonForJobs.associatedJobs.map(job => job.id).sort();
    const newJobIds = [...selectedJobIds].sort();
    return JSON.stringify(currentJobIds) !== JSON.stringify(newJobIds);
  };

  // Helper function to get change summary
  const getChangeSummary = () => {
    if (!selectedSkeletonForJobs) return '';
    const currentJobIds = selectedSkeletonForJobs.associatedJobs.map(job => job.id);
    const newJobIds = selectedJobIds;
    
    const added = newJobIds.filter(id => !currentJobIds.includes(id));
    const removed = currentJobIds.filter(id => !newJobIds.includes(id));
    
    const changes = [];
    if (added.length > 0) {
      const addedJobs = jobs.filter(job => added.includes(job.id)).map(job => job.title);
      changes.push(`+${added.length} (${addedJobs.join(', ')})`);
    }
    if (removed.length > 0) {
      const removedJobs = selectedSkeletonForJobs.associatedJobs.filter(job => removed.includes(job.id)).map(job => job.title);
      changes.push(`-${removed.length} (${removedJobs.join(', ')})`);
    }
    
    return changes.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Skeletons</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage interview templates and focus areas
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 font-medium transform hover:scale-[1.02]"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Skeleton
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-md p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Interview Skeletons ({skeletons.length})
          </h2>
        </div>

        {skeletons.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No interview skeletons</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new interview skeleton.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Skeleton
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {skeletons.map((skeleton) => (
              <div key={skeleton.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{skeleton.name}</h3>
                    {skeleton.description && (
                      <ul className="mt-2 list-none space-y-2">
                        {skeleton.description.split('\n').filter(line => line.trim()).map((line, sIndex) => (
                          <li key={sIndex} className="text-sm text-gray-700 dark:text-gray-300">
                            {line.trim()}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center text-base font-medium text-gray-800 dark:text-gray-200">
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>
                        {skeleton.focusAreas.length} Focus Areas
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleJobAssociation(skeleton)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      <LinkIcon className="h-4 w-4 mr-1.5" />
                      Manage Jobs
                    </button>
                    <button
                      onClick={() => handleEdit(skeleton)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      <PencilIcon className="h-4 w-4 mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skeleton.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      <TrashIcon className="h-4 w-4 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {skeleton.associatedJobs.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Associated Jobs ({skeleton.associatedJobs.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skeleton.associatedJobs.map((job) => (
                        <span
                          key={job.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {job.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Focus Areas ({skeleton.focusAreas.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skeleton.focusAreas.map((area, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-gray-700/50">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{area.title}</h4>
                        {area.description && (
                          <div className="flex flex-wrap gap-2">
                            {area.description.split(/[,.]|\d+\.\s*/).filter(skill => skill.trim()).map((skill, sIndex) => (
                              <span key={sIndex} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl shadow-lg dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingSkeleton ? 'Edit Interview Skeleton' : 'Create Interview Skeleton'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                      placeholder="e.g., Technical Interview, Behavioral Interview"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all resize-none"
                      placeholder="Optional description of this interview template"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Focus Areas <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addFocusArea}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Area
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.focusAreas.map((area, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Focus Area {index + 1}
                          </span>
                          {formData.focusAreas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFocusArea(index)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              value={area.title}
                              onChange={(e) => updateFocusArea(index, 'title', e.target.value)}
                              className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                              placeholder="Focus area title"
                              required
                            />
                          </div>
                          <div>
                            <textarea
                              rows={2}
                              value={area.description}
                              onChange={(e) => updateFocusArea(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all resize-none"
                              placeholder="Optional description or notes"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 h-10 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:transform-none"
              >
                {submitting ? 'Saving...' : (editingSkeleton ? 'Update Skeleton' : 'Create Skeleton')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showJobAssociationModal && selectedSkeletonForJobs && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Associate Jobs with "{selectedSkeletonForJobs.name}"
              </h3>
              <button
                onClick={() => setShowJobAssociationModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select which jobs this interview skeleton should be available for. When creating interviews, only associated skeletons will be shown for each job.
              </p>

              {selectedSkeletonForJobs && selectedSkeletonForJobs.associatedJobs.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Currently Associated Jobs:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkeletonForJobs.associatedJobs.map((job) => (
                      <span
                        key={job.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {job.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSkeletonForJobs && selectedSkeletonForJobs.associatedJobs.length === 0 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This skeleton is not currently associated with any jobs.
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {jobs.map((job) => (
                  <label
                    key={job.id}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedJobIds.includes(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {job.title}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.jobStatus === 'OPEN' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {job.jobStatus}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedJobIds.length} job(s) selected
                  {hasChanges() && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                      • Changes: {getChangeSummary()}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {selectedSkeletonForJobs && selectedSkeletonForJobs.associatedJobs.length > 0 && (
                    <button
                      onClick={() => setSelectedJobIds([])}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700 transition-colors"
                    >
                      Remove All
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedJobIds(jobs.map(job => job.id))}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700 transition-colors"
                  >
                    Select All
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowJobAssociationModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveJobAssociations}
                    disabled={submitting || !hasChanges()}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Saving...' : hasChanges() ? 'Save Changes' : 'No Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default InterviewSkeletonManagementPage; 