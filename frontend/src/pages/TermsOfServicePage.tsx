import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';
import ScrollToTopButton from '../components/common/ScrollToTopButton';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Terms of Service</h1>
            </div>
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        {/* Header Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8 p-8">
          <div className="bg-indigo-50 dark:bg-gray-700/50 border-l-4 border-indigo-600 dark:border-indigo-400 p-4 rounded">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <p className="text-sm text-indigo-700 dark:text-indigo-200">
                <strong>Effective Date:</strong> January 1, 2025
              </p>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-200 mt-2">
              <strong>IST Africa Ltd – Applicant Tracking System (ATS)</strong>
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the Applicant Tracking System (ATS) provided by IST Africa Ltd ("we," "our," or "us"). By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, please do not use the ATS.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Eligibility */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Eligibility</h2>
            <div className="flex items-start">
              <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You must be at least 18 years old and legally authorized to work and engage in recruitment or job-seeking activities in Rwanda or other relevant jurisdictions.
              </p>
            </div>
          </div>

          {/* Section 2: Accounts & Access */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Accounts & Access</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">To use certain features, users must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>Provide accurate and complete registration information.</li>
              <li>Keep your login credentials confidential.</li>
              <li>Be responsible for any activity conducted through your account.</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 font-medium">
                IST Africa Ltd reserves the right to suspend or terminate any account that violates these Terms.
              </p>
            </div>
          </div>

          {/* Section 3: User Responsibilities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">You agree not to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300">Provide false, misleading, or fraudulent information.</p>
              </div>
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300">Post or share any content that is defamatory, obscene, abusive, or discriminatory.</p>
              </div>
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300">Interfere with the security, integrity, or performance of the platform.</p>
              </div>
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300">Use the platform to distribute malware, spam, or unsolicited messages.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Use of the Platform */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Use of the Platform</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Our ATS is designed to:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/30">
                <p className="text-sm text-green-800 dark:text-green-300">Help employers manage recruitment and hiring processes.</p>
              </div>
              <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/30">
                <p className="text-sm text-green-800 dark:text-green-300">Allow job seekers to apply for and track job opportunities.</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300">
                You agree to use the platform only for lawful recruitment purposes. Any misuse may lead to account suspension or legal consequences.
              </p>
            </div>
          </div>

          {/* Section 5: AI-Powered Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. AI-Powered Features</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our platform includes features powered by third-party Artificial Intelligence (AI) services that analyze CVs and recruitment data.
            </p>
            <div className="bg-amber-50 dark:bg-yellow-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 dark:text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">AI Limitation Notice</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    While IST Africa Ltd strives to use reliable AI services, we are not liable for any data processing errors, inaccuracies, or breaches caused by third-party AI providers. By using these features, you acknowledge and accept this limitation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Intellectual Property */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All content, software, designs, and trademarks on the platform are the property of IST Africa Ltd or its licensors. Users may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Copy, distribute, or reverse engineer any part of the platform.</li>
              <li>Use our branding or materials without written permission.</li>
            </ul>
          </div>

          {/* Section 7: Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We collect and process user data in accordance with our <a href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline">Privacy Policy</a>, which forms part of these Terms. By using the platform, you consent to the collection, use, and sharing of your data as described.
            </p>
          </div>

          {/* Section 8: Data Retention */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We retain user data only as long as necessary to fulfill recruitment or legal obligations. Users may request deletion of their data by contacting our support team.
            </p>
          </div>

          {/* Section 9: Termination */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">We may suspend or terminate your account at any time if:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>You breach these Terms.</li>
              <li>You misuse the platform.</li>
              <li>We are required by law or regulation to do so.</li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                You may also deactivate your account at any time by contacting us.
              </p>
            </div>
          </div>

          {/* Section 10: Disclaimers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. Disclaimers</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The platform is provided "as is" without warranties of any kind. We do not guarantee:</p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                That job applications will result in offers.
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                That employer listings are accurate or verified.
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                That the platform will be free from errors or interruptions.
              </div>
            </div>
          </div>

          {/* Section 11: Limitation of Liability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">To the fullest extent permitted by law, IST Africa Ltd is not liable for:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/30">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">Indirect or consequential damages.</p>
              </div>
              <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/30">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">Loss of employment opportunities.</p>
              </div>
              <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/30">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">AI-related inaccuracies or decisions.</p>
              </div>
              <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/30">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">Data breaches by third-party service providers.</p>
              </div>
            </div>
          </div>

          {/* Section 12: Governing Law */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">12. Governing Law</h2>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300">
                These Terms are governed by and construed under the laws of the Republic of Rwanda. Any disputes shall be subject to the jurisdiction of competent Rwandan courts.
              </p>
            </div>
          </div>

          {/* Section 13: Changes to Terms */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">13. Changes to These Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may update these Terms from time to time. Continued use of the platform after changes are made constitutes your acceptance of the revised Terms.
            </p>
          </div>

          {/* Section 14: Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">14. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For questions or support regarding these Terms, contact:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">IST Africa Ltd</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>Email:</strong> <a href="mailto:support@istlegal.rw" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline">support@istlegal.rw</a></p>
                <p><strong>Phone:</strong> <a href="tel:+250782371420" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">+250782371420</a></p>
                <p><strong>Address:</strong> KG 28 Ave, 57</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              These Terms of Service were last updated on January 1, 2025.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
};

export default TermsOfServicePage; 