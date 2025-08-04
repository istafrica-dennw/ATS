import React, { useState, useEffect } from 'react';
import { interviewSkeletonAPI } from '../../services/api';
import { InterviewSkeleton, CreateInterviewSkeletonRequest, CreateFocusAreaRequest } from '../../types/interview';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface FocusAreaForm {
  title: string;
  description: string;
}

const InterviewSkeletonManagementPage: React.FC = () => {
  const [skeletons, setSkeletons] = useState<InterviewSkeleton[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSkeleton, setEditingSkeleton] = useState<InterviewSkeleton | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
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
      
      console.log('Fetching skeletons...');
      
      const skeletonsResponse = await interviewSkeletonAPI.getAll();
      
      console.log('Skeletons response:', skeletonsResponse);
      
      setSkeletons(skeletonsResponse.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Skeletons</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage interview templates and focus areas
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 font-medium transform hover:scale-[1.02]"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Skeleton
          </button>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Skeletons List Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
              <div key={skeleton.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{skeleton.name}</h3>
                    {skeleton.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{skeleton.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{skeleton.focusAreas.length} focus areas</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(skeleton)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skeleton.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-xs font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Focus Areas Preview */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {skeleton.focusAreas.map((area, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">{area.title}</h4>
                      {area.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{area.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl shadow-lg dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] rounded-lg bg-white dark:bg-gray-800">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
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

                {/* Focus Areas Section */}
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

            {/* Modal Footer */}
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
        </div>
      )}
    </div>
  );
};

export default InterviewSkeletonManagementPage; 