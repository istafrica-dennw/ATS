import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ScrollToTopButton from '../components/common/ScrollToTopButton';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <ShieldCheckIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
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
                <strong>Template privacy policy</strong>
              </p>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-200 mt-2">
              This is a template privacy policy, based on the GDPR's information requirements. Please review, amend and add to it, to reflect the processing you will be doing in the service.
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            The service for handling recruitments and simplifying the hiring process (the "Service") is powered by Teamtailor on behalf of IST ("Controller" "we" "us" etc.). It is important that the persons using the Service ("Users") feel safe with, and are informed about, how we handle User's personal data in the recruitment process. We strive to maintain the highest possible standard regarding the protection of personal data. We process, manage, use, and protect User's Personal Data in accordance with this Privacy Policy ("Privacy Policy").
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: General */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. General</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We are the controller in accordance with current privacy legislations. The Users' personal data is processed with the purpose of managing and facilitating recruitment of employees to our business.
            </p>
          </div>

          {/* Section 2: Collection of personal data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Collection of personal data</h2>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">We are responsible for the processing of the personal data</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We are responsible for the processing of the personal data that the Users contributes to the Service, or for the personal data that we in other ways collects with regards to the Service.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">When and how we collect personal data</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">We collect personal data about Users from Users when Users:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>make an application through the Service or otherwise, adding personal data about themselves either personally or by using a third-party source such as Facebook or LinkedIn; and</li>
              <li>use the Service to connect with our staff, adding personal data about themselves either personally or by using a third-party source such as Facebook or LinkedIn.</li>
              <li>provides identifiable data in the chat (provided through the website that uses the Service) and such data is of relevance to the application procedure;</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect data from third parties, such as Facebook, LinkedIn and through other public sources. This is referred to as "Sourcing" and be manually performed by our employees or automatically in the Service.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              In some cases, existing employees can make recommendations about potential applicants. Such employees will add personal data about such potential applicants. In the cases where this is made, the potential applicant is considered a User in the context of this Privacy Policy and will be informed about the processing.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">The types of personal data collected and processed</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The categories of personal data that can be collected through the Service can be used to identify natural persons from names, e-mails, pictures and videos, information from Facebook and LinkedIn accounts, answers to questions asked through the recruiting, titles, education and other information that the User or others have provided through the Service. Only data that is relevant for the recruitment process is collected and processed.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">Purpose and lawfulness of processing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The purpose of the collecting and processing of personal data is to manage recruiting. The lawfulness of the processing of personal data is our legitimate interest to simplify and facilitate recruitment. Personal data that is processed with the purpose of aggregated analysis or market research is always made unidentifiable. Such personal data cannot be used to identify a certain User. Thus, such data is not considered personal data.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">The consent of the data subject</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The User consents to the processing of its personal data with the purpose of Controller's handling recruiting. The User consents that personal data is collected through the Service, when Users</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>make an application through the Service, adding personal data about themselves either personally or by using a third-party source as Facebook or LinkedIn, and that Controller may use external sourcing-tools to add additional information; and</li>
              <li>when they use the Service to connect to Controller's recruitment department, adding personal data about themselves either personally or by using a third-party source such as Facebook or LinkedIn.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The User also consents to the Controller collecting publically available information about the User and compiles them for use in recruitment purposes. The User consents to the personal data being collected in accordance with the above a) and b) will be processed according to the below sections Storage and transfer and How long the personal data will be processed.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300">
                The User has the right to withdraw his or her consent at any time, by contacting Controller using the contact details listed under 9. Using this right may however, mean that the User can not apply for a specific job or otherwise use the Service.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">Storage and transfers</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The personal data collected through the Service is stored and processed inside the EU/EEA, such third country that is considered by the European Commission to have an adequate level of protection, or processed by such suppliers that have entered into such binding agreements that fully complies with the lawfulness of third country transfers (as Privacy Shield) or to other supplies where the adequate safeguards are in order to protect the rights of the data subjects whose data is transferred. To obtain documentation regarding such adequate safeguards, contact us using the Contact details listed in 9.
            </p>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">How long the personal data will be processed</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If a User does not object, in writing, to the processing of their personal data, the personal data will be stored and processed by us in accordance with relevant local legislation, with regards to the purposes stated above. Note that an applicant (User) may be interesting for future recruitment and for this purpose we may store Users' Personal Data until they are no longer of value as potential recruitments. If you as a User wish not to have your Personal Data processed for this purpose (future recruitment) please contact us using the contact details in paragraph 9.
            </p>
          </div>

          {/* Section 3: Users' rights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. Users' rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Users have the right to request information about the personal data that is processed by us, by notifying in writing, us using the contact details below under paragraph 9 below. Users have the right to one (1) copy of the processed personal data which belongs to them without any charge. For further demanded copies, Controller has a right to charge a reasonable fee on the basis of the administrative costs for such demand.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Users have the right to, if necessary, rectification of inaccurate personal data concerning that User, via a written request, using the contact details in paragraph 9 below.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The User has the right to demand deletion or restriction of processing, and the right to object to processing based on legitimate interest under certain circumstances.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The User has the right to revoke any consent to processing that has been given by the User to Controller. Using this right may however, mean that the User can not apply for a specific job or otherwise use the Service.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              User has under certain circumstances a right to data portability, which means a right to get the personal data and transfer these to another controller as long as this does not negatively affect the rights and freedoms of others.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              User has the right to lodge a complaint to the supervisory authority regarding the processing of personal data relating to him or her, if the User considers that the processing of personal data infringes the legal framework of privacy law.
            </p>
          </div>

          {/* Section 4: Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Security</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We prioritize the personal integrity and therefore works actively so that the personal data of the Users are processed with utmost care. We take the measures that can be reasonably expected to the make sure that the personal data of Users and others are processed safely and in accordance to this Privacy Policy and the GDPR-regulation.
            </p>
            <div className="bg-amber-50 dark:bg-yellow-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4">
              <p className="text-amber-800 dark:text-amber-200">
                However, transfers of information over the internet and mobile networks can never occur without any risk, so all transfers are made on the own risk of the person transferring the data. Hence, we encourage our Users to safeguard their login details. It is important that Users also take responsibility to ensure that their data is protected.
              </p>
            </div>
          </div>

          {/* Section 5: Transfer of personal data to third party */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. Transfer of personal data to third party</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We will not sell or otherwise transfer Users' personal data to third parties. We may transfer Users' Personal Data to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>Our contractors and sub-contractors, acting as our Processors and Sub-Processors in accordance with our instructions, for the provision of the Service;</li>
              <li>authorities or legal advisors in case criminal or improper behaviour is suspected; and</li>
              <li>authorities, legal advisors or other actors, if required by us according to law or authority's injunction.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We will only transfer Users' personal data to third parties that we have a contract with. We carefully choose partners to ensure that the User's personal data is processed in accordance to current privacy legislations. We cooperate with the following categories of processors of personal data: Teamtailor, who supplies the Service, server and hosting companies, e-mail reference companies, video processing companies, information-sourcing companies, analytical service companies and other companies with regards to suppling the Service.
            </p>
          </div>

          {/* Section 6: Aggregated data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Aggregated data (non-identifiable personal data)</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may share aggregated data to third parties. The aggregated data has in such instances been compiled from information that has been collected through the Service and can, for example, consist of statistics of internet traffic or the geological location for the use of the Service. The aggregated data does not contain any information that can be used to identify individual persons and is thus not personal data.
            </p>
          </div>

          {/* Section 7: Cookies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When Users use the Service, information about the usage may be stored as cookies. Cookies are passive text files that are stored in the internet browser on the User's device, such as computer, mobile phone or tablet, when using the Service. We use cookies to improve the User's usage of the Service and to gather information about, for example, statistics about the usage of the Service. This is done to secure, maintain and improve the Service.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The information that is collected through the cookies can in some instances be personal data and is, in such instances, regulated by our "Cookie Policy" link. Users can at any time disable the use of cookies by changing the local settings in their devices. Disabling of cookies can affect the experience of the Service, for example disabling some functions in the Service.
            </p>
          </div>

          {/* Section 8: Changes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Changes</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We have the right to, at any time, make changes or additions to the Privacy Policy. The latest version of the Privacy Policy will always be available through the Service. A new version is considered communicated to the Users when the User has either received an email informing the User of the new version (using the e-mail stated by the User in connection to the use of the Service) or when the User is otherwise informed of the new Privacy Policy.
            </p>
          </div>

          {/* Section 9: Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For questions, further information about our handling of personal data or for contact with us in other matters, please use the below stated contact details:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">IST</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>Email:</strong> <a href="mailto:privacy@ist.com" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline">privacy@ist.com</a></p>
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

export default PrivacyPolicyPage;
