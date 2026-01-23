import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { ReactComponent as ISTLogo } from "../assets/logo/IST logo black.svg";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Link to="/" className="mr-4">
                <ISTLogo className="h-10 w-auto dark:invert dark:brightness-200" />
              </Link>
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Privacy Policy
                </h1>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        {/* Header Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8 p-8">
          <div className="bg-primary-50 dark:bg-gray-700/50 border-l-4 border-primary-600 dark:border-primary-400 p-4 rounded">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <p className="text-sm text-primary-700 dark:text-primary-200">
                <strong>Effective Date:</strong> January 1, 2025
              </p>
            </div>
            <p className="text-sm text-primary-700 dark:text-primary-200 mt-2">
              <strong>IST Africa Ltd - Applicant Tracking System (ATS)</strong>
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            At IST Africa Ltd, we are committed to protecting the privacy and
            personal data of all users who interact with our Applicant Tracking
            System (ATS), in line with the Rwanda Data Protection and Privacy
            Law (Law No. 058/2021 of 13/10/2021). This Privacy Policy outlines
            how we collect, use, share, and protect your data.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Scope */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              1. Scope
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              This Privacy Policy applies to all users of our ATS platform,
              including job applicants, recruiters, HR professionals, and
              employers operating or residing in Rwanda.
            </p>
          </div>

          {/* Section 2: Data We Collect */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Data We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect the following categories of personal data:
            </p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-medium px-2.5 py-0.5 rounded mr-3 mt-1">
                  Identity
                </span>
                Name, date of birth, gender.
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded mr-3 mt-1">
                  Contact
                </span>
                Email address, telephone number, physical address.
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded mr-3 mt-1">
                  Employment
                </span>
                CV/resume details, education history, employment history,
                references, certifications.
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded mr-3 mt-1">
                  System
                </span>
                IP address, browser information, usage logs, and device
                information.
              </li>
              <li className="flex items-start">
                <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded mr-3 mt-1">
                  Optional
                </span>
                Profile photo, social media links, preferences, portfolio links.
              </li>
            </ul>
          </div>

          {/* Section 3: Purpose of Data Collection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              3. Purpose of Data Collection
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect and process your personal data for the following
              purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                To facilitate the recruitment process between applicants and
                employers.
              </li>
              <li>
                To assess candidate suitability and match skills to job
                vacancies.
              </li>
              <li>
                To improve our services through analytics and user feedback.
              </li>
              <li>
                To comply with legal and regulatory obligations under Rwandan
                law.
              </li>
              <li>
                To communicate with you regarding your applications, interviews,
                or account.
              </li>
              <li>
                To power AI features that analyze CV content for skill-matching
                and recruitment insights.
              </li>
            </ul>
          </div>

          {/* Section 4: Lawful Basis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              4. Lawful Basis for Processing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We process personal data based on:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Consent
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When creating an account or submitting a job application.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Contractual Necessity
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Managing your recruitment process.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Legitimate Interest
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Improving platform performance or analytics.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Legal Obligation
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Retention of records under labor laws.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: AI Usage and Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              5. AI Usage and Disclaimer
            </h2>
            <div className="bg-amber-50 dark:bg-yellow-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 mb-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 dark:text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Important Notice
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Our ATS may integrate third-party AI services that process
                    and analyze CV and profile data to assist with job matching,
                    skill extraction, and performance prediction.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              While we take care to partner with reputable AI providers and
              enforce strict confidentiality measures, IST Africa Ltd is not
              responsible for any data breach, misuse, or exposure caused by
              these AI service providers. By using our platform, you acknowledge
              and accept this limitation.
            </p>
          </div>

          {/* Section 6: Data Sharing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              6. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may share your personal data with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>Employers or recruiters using the ATS for hiring purposes.</li>
              <li>
                Our third-party service providers (e.g., cloud storage,
                analytics, or AI tools), under strict confidentiality
                agreements.
              </li>
              <li>Regulatory or government authorities when required by law.</li>
            </ul>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                We do not sell personal data to third parties.
              </p>
            </div>
          </div>

          {/* Section 7: International Transfers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              7. International Data Transfers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Where data is transferred outside Rwanda (e.g., for cloud or AI
              processing), we ensure appropriate safeguards are in place, such
              as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Standard contractual clauses,</li>
              <li>Hosting in countries with adequate data protection laws,</li>
              <li>Explicit user consent where required.</li>
            </ul>
          </div>

          {/* Section 8: Data Retention */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We retain personal data only as long as necessary for the
              recruitment purpose or to comply with applicable laws. Afterward,
              data is securely deleted or anonymized.
            </p>
          </div>

          {/* Section 9: Your Rights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              9. Your Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Under Rwanda's data protection law, you have the right to:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                Access your personal data
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                Request correction or deletion
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                Object to or restrict processing
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                Withdraw consent at any time
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                Lodge a complaint with the NCSA
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-4">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>To exercise your rights, contact us at:</strong>{" "}
                <a
                  href="mailto:privacy@istafrica.rw"
                  className="underline hover:text-blue-600 dark:hover:text-blue-200"
                >
                  privacy@istafrica.rw
                </a>
              </p>
            </div>
          </div>

          {/* Section 10: Data Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              10. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement robust technical and organizational security measures
              including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-3"></div>
                Secure encryption
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-3"></div>
                Access controls
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-3"></div>
                Regular system audits
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-3"></div>
                Staff training on data protection
              </div>
            </div>
          </div>

          {/* Section 11: Children's Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              11. Children's Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our ATS is not intended for individuals under 18. We do not
              knowingly collect personal data from children.
            </p>
          </div>

          {/* Section 12: Changes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              12. Changes to this Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Privacy Policy periodically. All changes will
              be posted on this page with an updated effective date. Continued
              use of the ATS implies your acceptance of these changes.
            </p>
          </div>

          {/* Section 13: Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy or how your data
              is processed, please contact:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                IST Africa Ltd
              </h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:privacy@istlegal.rw"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline"
                  >
                    privacy@istlegal.rw
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:0782371420"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    0782371420
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> KG 28 Ave, 57
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This Privacy Policy was last updated on January 1, 2025.
            </p>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} IST Africa Ltd. All rights
              reserved.
            </p>
            <Link
              to="/"
              className="mt-4 md:mt-0 text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
            >
              Back to Careers
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
