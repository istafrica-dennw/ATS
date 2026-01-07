import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, BuildingOfficeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const locations = [
  {
    name: 'Växjö (HQ)',
    country: 'Sweden',
    address: 'Linnégatan 12',
    description: 'Our headquarters, located in the heart of Småland. This is where IST started and continues to grow.',
    image: '🇸🇪',
    isHeadquarters: true,
  },
  {
    name: 'Stockholm',
    country: 'Sweden',
    address: 'Sveavägen 17',
    description: 'Our Stockholm office brings us closer to our customers in the capital region.',
    image: '🇸🇪',
  },
  {
    name: 'Linköping',
    country: 'Sweden',
    address: 'Platensgatan 8',
    description: 'A hub for innovation and development in eastern Sweden.',
    image: '🇸🇪',
  },
  {
    name: 'Berlin',
    country: 'Germany',
    address: 'Friedrichstraße 123',
    description: 'Our German office serves the growing DACH market with localized solutions.',
    image: '🇩🇪',
  },
  {
    name: 'Neritz',
    country: 'Germany',
    address: 'Hauptstraße 45',
    description: 'Supporting German schools with dedicated local expertise.',
    image: '🇩🇪',
  },
  {
    name: 'Schmalkalden',
    country: 'Germany',
    address: 'Marktplatz 7',
    description: 'A key location for our German operations and customer support.',
    image: '🇩🇪',
  },
  {
    name: 'Oslo',
    country: 'Norway',
    address: 'Karl Johans gate 15',
    description: 'Our Norwegian office brings IST solutions to the Norwegian education sector.',
    image: '🇳🇴',
  },
  {
    name: 'Roskilde',
    country: 'Denmark',
    address: 'Algade 31',
    description: 'Serving Danish schools with innovative educational technology.',
    image: '🇩🇰',
  },
  {
    name: 'Midtfyn',
    country: 'Denmark',
    address: 'Østergade 12',
    description: 'Our second Danish location, expanding our reach across Denmark.',
    image: '🇩🇰',
  },
];

const LocationsPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Locations
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 dark:text-gray-300 max-w-2xl mx-auto">
              With offices across Scandinavia and Europe, we're always close to our customers and communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Overview */}
      <section className="bg-white dark:bg-gray-800 py-12 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-6">
              <GlobeAltIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {locations.length} Offices Across {[...new Set(locations.map(l => l.country))].length} Countries
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From our headquarters in Växjö to offices across Sweden, Germany, Norway, and Denmark, 
              we bring education technology closer to schools everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border ${
                  location.isHeadquarters
                    ? 'border-primary-300 dark:border-primary-700 ring-2 ring-primary-100 dark:ring-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-4xl mb-2 block">{location.image}</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{location.country}</p>
                  </div>
                  {location.isHeadquarters && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      HQ
                    </span>
                  )}
                </div>
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400" />
                  {location.address}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {location.description}
                </p>
                <Link
                  to={`/jobs?location=${encodeURIComponent(location.name)}`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  View jobs in {location.name}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="bg-white dark:bg-gray-800 py-16 sm:py-24 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              One Company, One Culture
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              No matter which office you join, you'll be part of the same IST family. We share the same 
              values, vision, and commitment to making education better.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Modern Workspaces
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All our offices are designed for collaboration, creativity, and comfort.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                <svg className="h-8 w-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Connected Teams
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Work with colleagues across borders. We're one team, wherever we are.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Work-Life Balance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Flexible working options to help you thrive both at work and at home.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
