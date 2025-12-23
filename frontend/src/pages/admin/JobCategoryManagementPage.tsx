import React, { useState, useEffect, Fragment } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  TagIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  jobCategoryService,
  JobCategoryDTO,
  CreateJobCategoryDTO,
  UpdateJobCategoryDTO,
} from "../../services/jobCategoryService";

// Predefined color options for categories
const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Emerald", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Orange", value: "#f97316" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

const initialFormData: CategoryFormData = {
  name: "",
  description: "",
  color: "#6366f1",
};

const JobCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await jobCategoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch job categories. Please try again later.");
      console.error("Error fetching job categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color: color,
    });
  };

  // Submit form to create or update a category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && currentCategoryId) {
        const updateData: UpdateJobCategoryDTO = {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        };
        await jobCategoryService.updateCategory(currentCategoryId, updateData);
        toast.success("Category updated successfully!");
      } else {
        const createData: CreateJobCategoryDTO = {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        };
        await jobCategoryService.createCategory(createData);
        toast.success("Category created successfully!");
      }

      setShowModal(false);
      setFormData(initialFormData);
      setIsEditing(false);
      setCurrentCategoryId(null);
      fetchCategories();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Failed to save category. Please try again.";
      toast.error(message);
      console.error("Error saving category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal with category data
  const handleEdit = (category: JobCategoryDTO) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#6366f1",
    });
    setIsEditing(true);
    setCurrentCategoryId(category.id);
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = (id: number, name: string) => {
    setCategoryToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      await jobCategoryService.deleteCategory(categoryToDelete.id);
      toast.success(
        `Category "${categoryToDelete.name}" deleted successfully!`
      );
      await fetchCategories();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Failed to delete category. Please try again.";
      toast.error(message);
      console.error("Error deleting category:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showDeleteModal) {
          cancelDelete();
        }
        if (showModal) {
          setShowModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDeleteModal, showModal]);

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Job Category Management
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Create and manage job categories to organize your job postings.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setIsEditing(false);
                setCurrentCategoryId(null);
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto transform hover:scale-[1.02] transition-all duration-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"} total
          </span>
          <button
            type="button"
            onClick={fetchCategories}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
          >
            <ArrowPathIcon
              className="-ml-0.5 mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <TagIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <div className="text-gray-500 dark:text-gray-400">
              No categories found. Create a new category to get started.
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    category.isActive
                      ? "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50"
                      : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60"
                  }`}
                >
                  {/* Color indicator */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                    style={{ backgroundColor: category.color }}
                  ></div>

                  <div className="pt-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {category.name}
                        </h3>
                      </div>
                      {!category.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>

                    {category.description && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mx-auto">
                  <TagIcon
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    {isEditing ? "Edit Category" : "Create New Category"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Engineering"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of this category..."
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => handleColorSelect(colorOption.value)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            formData.color === colorOption.value
                              ? "border-gray-900 dark:border-white ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400"
                              : "border-transparent hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                          style={{ backgroundColor: colorOption.value }}
                          title={colorOption.name}
                        >
                          {formData.color === colorOption.value && (
                            <CheckIcon className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:ml-3 sm:w-auto sm:text-sm transform hover:scale-[1.02] transition-all duration-200 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        "Update Category"
                      ) : (
                        "Create Category"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 transition-opacity"
              onClick={cancelDelete}
              aria-hidden="true"
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <TrashIcon
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-gray-100">
                      Delete Category
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          "{categoryToDelete.name}"
                        </span>
                        ?
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        This will deactivate the category. Jobs using this
                        category will remain unchanged.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className={`w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className={`w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-sm font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 transform hover:scale-[1.02] transition-all duration-200 ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon
                          className="-ml-1 mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                        Delete Category
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCategoryManagementPage;
