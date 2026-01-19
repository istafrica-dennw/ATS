import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  MapPinIcon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import JobCard from "../components/jobs/JobCard";
import jobService from "../services/jobService";
import { Job } from "../types/job";
import { ReactComponent as ISTLogo } from "../assets/logo/IST logo black.svg";

const values = [
  {
    icon: HeartIcon,
    title: "Passion",
    description:
      "We are driven by our passion to make a difference in education.",
  },
  {
    icon: UserGroupIcon,
    title: "Collaboration",
    description:
      "We believe in the power of working together to achieve great things.",
  },
  {
    icon: SparklesIcon,
    title: "Innovation",
    description:
      "We constantly push boundaries to create cutting-edge solutions.",
  },
];

const locations = [
  { name: "Växjö (HQ)", country: "Sweden", image: "🇸🇪" },
  { name: "Stockholm", country: "Sweden", image: "🇸🇪" },
  { name: "Berlin", country: "Germany", image: "🇩🇪" },
  { name: "Oslo", country: "Norway", image: "🇳🇴" },
  { name: "Roskilde", country: "Denmark", image: "🇩🇰" },
];

const HomePage: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await jobService.getAllJobs();
        // Get most recent 3 jobs as featured
        const sorted = jobs.sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setFeaturedJobs(sorted.slice(0, 3));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute min-w-full min-h-full w-auto h-auto object-cover"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              A career that makes a difference
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Join us in shaping the future of education technology. We're
              looking for passionate people who want to make learning better for
              everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                View Job Openings
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/connect"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Connect
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                This is us!
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                We are the leading edtech company in Scandinavia!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                For more than 35 years we have made everyday life easier for
                students, parents, teachers, and managers. Half of us that work
                here have a background as teachers or school leaders, so we
                understand all aspects of school.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Together with our users we develop digital solutions for a
                better way of learning. We combine technical competence with
                work experience from schools - to empower learning!
              </p>
              <p className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                Do you also want to make a difference? Welcome to us!
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-800 dark:to-gray-700 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-32 mx-auto mb-6 flex items-center justify-center">
                    <ISTLogo className="w-full h-full dark:invert dark:brightness-200" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    TwISTers
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    That's what we call ourselves
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join IST!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore our latest opportunities and find your perfect role
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <JobCard job={job} variant="featured" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No open positions at the moment
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/jobs"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View all jobs
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Workplace & Culture
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everyone of us working at IST is a TwISTer. We're different and
              unique. This is a great strength – always finding ways of
              connecting, cooperating and collaborating to bring our different
              experiences, knowledge and personalities together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-700 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We have offices across Scandinavia and Europe
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to="/locations"
                  className="block bg-white dark:bg-gray-900 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-4xl mb-3 block">{location.image}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {location.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {location.country}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/locations"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View all locations
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
