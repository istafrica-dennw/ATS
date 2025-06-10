import React, { useState, useEffect } from 'react';
import { interviewSkeletonAPI } from '../../services/api';
import { jobService, JobDTO } from '../../services/jobService';
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
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSkeleton, setEditingSkeleton] = useState<InterviewSkeleton | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jobId: '',
    focusAreas: [{ title: '', description: '' }] as FocusAreaForm[]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching skeletons and jobs...');
      
      // Fetch both skeletons and jobs in parallel
      const [skeletonsResponse, jobsData] = await Promise.all([
        interviewSkeletonAPI.getAll(),
        jobService.getAllJobs() // Returns JobDTO[] directly
      ]);
      
      console.log('Skeletons response:', skeletonsResponse);
      console.log('Jobs data:', jobsData);
      
      setSkeletons(skeletonsResponse.data || []);
      setJobs(jobsData || []);
      
      console.log('Jobs set to state:', jobsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      // Set default empty arrays to prevent undefined errors
      setSkeletons([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSkeleton(null);
    setFormData({
      name: '',
      description: '',
      jobId: '',
      focusAreas: [{ title: '', description: '' }]
    });
    setShowModal(true);
  };

  const handleEdit = (skeleton: InterviewSkeleton) => {
    setEditingSkeleton(skeleton);
    setFormData({
      name: skeleton.name,
      description: skeleton.description || '',
      jobId: '', // We don't have jobId in the skeleton response, would need to be added
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
      fetchInitialData();
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

    if (!formData.jobId) {
      setError('Please select a job');
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
        jobId: parseInt(formData.jobId),
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
        // Note: Update endpoint would need to be implemented
        console.log('Update not implemented yet:', requestData);
        setError('Update functionality not implemented yet');
      } else {
        await interviewSkeletonAPI.create(requestData);
      }

      setShowModal(false);
      fetchInitialData();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Skeletons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage interview templates and focus areas
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Skeleton
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Skeletons List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Interview Skeletons ({skeletons.length})
          </h2>
        </div>

        {skeletons.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No interview skeletons</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new interview skeleton.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Skeleton
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {skeletons.map((skeleton) => (
              <div key={skeleton.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{skeleton.name}</h3>
                    {skeleton.description && (
                      <p className="mt-1 text-sm text-gray-600">{skeleton.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{skeleton.focusAreas.length} focus areas</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(skeleton)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skeleton.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Focus Areas Preview */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {skeleton.focusAreas.map((area, index) => (
                    <div key={index} className="bg-gray-50 rounded-md p-2">
                      <h4 className="text-xs font-medium text-gray-900">{area.title}</h4>
                      {area.description && (
                        <p className="text-xs text-gray-600 mt-1">{area.description}</p>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSkeleton ? 'Edit Interview Skeleton' : 'Create Interview Skeleton'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job *</label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a job</option>
                  {(jobs || []).map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.department} ({job.location})
                    </option>
                  ))}
                </select>
                {(!jobs || jobs.length === 0) && (
                  <p className="mt-1 text-sm text-gray-500">
                    No jobs available. Please create a job first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Technical Interview, Behavioral Interview"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional description of this interview template"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Focus Areas *</label>
                  <button
                    type="button"
                    onClick={addFocusArea}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Area
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.focusAreas.map((area, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Focus Area {index + 1}</span>
                        {formData.focusAreas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFocusArea(index)}
                            className="text-red-600 hover:text-red-800"
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
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Focus area title"
                            required
                          />
                        </div>
                        <div>
                          <textarea
                            rows={2}
                            value={area.description}
                            onChange={(e) => updateFocusArea(index, 'description', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Optional description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !jobs || jobs.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingSkeleton ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSkeletonManagementPage; 