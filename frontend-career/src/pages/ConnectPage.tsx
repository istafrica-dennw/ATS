import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import {
  jobCategoryService,
  JobCategory,
} from "../services/jobCategoryService";
import { userJobPreferenceService } from "../services/userJobPreferenceService";
import { ReactComponent as ISTLogo } from "../assets/logo/IST logo black.svg";

const ConnectPage: React.FC = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [step, setStep] = useState<"interests" | "connect" | "success">(
    "interests"
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await jobCategoryService.getActiveCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load job categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.id));
    }
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      setStep("connect");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConnect = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!privacyConsent) {
      return;
    }

    setEmailError(null);
    setSubmitting(true);

    try {
      await userJobPreferenceService.savePreference({
        email: email.trim().toLowerCase(),
        categoryIds: selectedCategories,
        consentAccepted: privacyConsent,
      });

      // Show success state
      setStep("success");
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save your preferences. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  if (error && step !== "connect") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            You're connected!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for connecting with us. We'll keep you updated on
            opportunities that match your interests at{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {email}
            </span>
          </p>
          <div className="space-y-4">
            <Link
              to="/jobs"
              className="block w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Browse Open Positions
            </Link>
            <Link
              to="/"
              className="block w-full py-3 px-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3">
            <ISTLogo className="h-12 w-auto dark:invert dark:brightness-200" />
          </Link>
        </div>

        {step === "interests" ? (
          <>
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                What interests you?
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Select the areas you're interested in to help us match you with
                the right opportunities.
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`relative group p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
                    }`}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-3 h-3 rounded-full mb-3"
                      style={{ backgroundColor: category.color }}
                    ></div>

                    <h3
                      className={`font-semibold text-sm sm:text-base ${
                        isSelected
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {category.name}
                    </h3>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* All option */}
              <button
                onClick={selectAll}
                className={`relative group p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedCategories.length === categories.length
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
                }`}
              >
                <div className="w-3 h-3 rounded-full mb-3 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
                <h3
                  className={`font-semibold text-sm sm:text-base ${
                    selectedCategories.length === categories.length
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  All
                </h3>
                {selectedCategories.length === categories.length && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={handleContinue}
                disabled={selectedCategories.length === 0}
                className={`inline-flex items-center px-8 py-3.5 text-lg font-semibold rounded-xl transition-all duration-200 ${
                  selectedCategories.length > 0
                    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
              {selectedCategories.length > 0 && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {selectedCategories.length}{" "}
                  {selectedCategories.length === 1 ? "area" : "areas"} selected
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Connect Section */}
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Connect with us
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Stay updated on opportunities that match your interests.
                </p>
              </div>

              {/* Selected interests summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Your interests:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => selectedCategories.includes(c.id))
                    .map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></span>
                        {category.name}
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => setStep("interests")}
                  className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  ← Change selection
                </button>
              </div>

              {/* Email input */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="you@example.com"
                    className={`block w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      emailError
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-2 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              {/* Privacy consent */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      I have read the{" "}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        privacy policy
                      </Link>{" "}
                      and confirm that IST store my personal details to be able
                      to contact me for future job opportunities.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      IST will hold your data for future employment
                      opportunities for a maximum period of 2 years, or until
                      you decide to withdraw your consent, which you can do at
                      any given time by contacting us.
                    </p>
                  </div>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={!privacyConsent || !email.trim() || submitting}
                className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  privacyConsent && email.trim() && !submitting
                    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>

              {/* LinkedIn Connect */}
              <button
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl"
                onClick={() => {
                  // Store preferences before LinkedIn auth
                  const selectedCategoryNames = categories
                    .filter((c) => selectedCategories.includes(c.id))
                    .map((c) => c.name);
                  localStorage.setItem(
                    "connectPreferences",
                    JSON.stringify({
                      categories: selectedCategoryNames,
                      categoryIds: selectedCategories,
                    })
                  );
                  // Redirect to main app LinkedIn OAuth
                  const mainAppUrl =
                    process.env.REACT_APP_MAIN_APP_URL ||
                    "http://localhost:3001";
                  window.location.href = `${mainAppUrl}/login?oauth=linkedin`;
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Sign in with LinkedIn
              </button>

              {/* Already connected link */}
              <div className="text-center mt-6">
                <span className="text-gray-500 dark:text-gray-400">
                  Already connected?{" "}
                </span>
                <a
                  href={`${
                    process.env.REACT_APP_MAIN_APP_URL ||
                    "http://localhost:3001"
                  }/login`}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Sign in
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectPage;
