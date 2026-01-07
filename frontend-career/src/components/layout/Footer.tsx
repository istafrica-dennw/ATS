import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as ISTLogo } from "../../assets/logo/IST logo black.svg";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <ISTLogo className="h-10 w-auto invert brightness-200" />
              <span className="text-xl font-semibold">Careers</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              We are the leading edtech company in Scandinavia! For more than 35
              years we have made everyday life easier for students, parents,
              teachers, and managers.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">X (Twitter)</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/ist-sverige-ab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Career Site Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Career site
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Start
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/people"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  People
                </Link>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Data & Privacy
                </a>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Locations
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Växjö (HQ)
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Stockholm
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Berlin
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Oslo
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  All locations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} IST. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="https://ist.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ist.com
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="/signup"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Candidate Connect login
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">Career site by IST ATS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
