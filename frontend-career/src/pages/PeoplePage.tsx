import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const values = [
  {
    icon: HeartIcon,
    title: 'Passion',
    description: 'We are driven by our passion to make a difference in education. Every line of code, every feature we build, is designed with students and teachers in mind.',
    color: 'red',
  },
  {
    icon: UserGroupIcon,
    title: 'Collaboration',
    description: 'We believe in the power of working together. Our best ideas come from diverse perspectives and open dialogue.',
    color: 'blue',
  },
  {
    icon: SparklesIcon,
    title: 'Innovation',
    description: 'We constantly push boundaries to create cutting-edge solutions. We embrace new technologies and approaches to solve old problems.',
    color: 'purple',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Openness',
    description: 'We have an open climate, choose dialogue over confrontation and listen before we speak.',
    color: 'green',
  },
  {
    icon: LightBulbIcon,
    title: 'Curiosity',
    description: 'We stay curious, always learning and growing. Half of us have backgrounds in education, bringing real-world insights to our work.',
    color: 'yellow',
  },
  {
    icon: AcademicCapIcon,
    title: 'Impact',
    description: 'We measure success by the positive impact we have on students, teachers, and schools around the world.',
    color: 'indigo',
  },
];

const benefits = [
  'Competitive salary and benefits package',
  'Flexible working hours and remote options',
  'Professional development and training',
  'Health and wellness programs',
  'Modern office environments',
  'Team events and activities',
  'Parental leave benefits',
  'Work-life balance focus',
];

const testimonials = [
  {
    quote: "Working at IST has been incredibly rewarding. I get to build products that actually help teachers and students every day.",
    name: 'Anna Svensson',
    role: 'Senior Developer',
    location: 'Stockholm',
  },
  {
    quote: "The culture here is unique. Everyone is passionate about education and we really support each other.",
    name: 'Marcus Jensen',
    role: 'Product Manager',
    location: 'Växjö',
  },
  {
    quote: "I joined IST because I wanted my work to have meaning. Three years later, I still feel that every day.",
    name: 'Laura Schmidt',
    role: 'UX Designer',
    location: 'Berlin',
  },
];

const PeoplePage: React.FC = () => {
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
              Meet the TwISTers
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 dark:text-gray-300 max-w-2xl mx-auto">
              We're different and unique. That's our greatest strength – bringing diverse experiences, 
              knowledge, and personalities together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our values are our common ground. They say something about what we find important, 
              what we are proud of, and what we strive towards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-14 h-14 mb-6 bg-${value.color}-100 dark:bg-${value.color}-900/30 rounded-xl flex items-center justify-center`}>
                  <value.icon className={`h-7 w-7 text-${value.color}-600 dark:text-${value.color}-400`} />
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

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our People Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <svg className="h-8 w-8 text-primary-300 dark:text-primary-700 mb-4" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} · {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Benefits & Perks
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                We believe in taking care of our people. Here's what you can expect when you join IST.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center"
                  >
                    <svg className="h-5 w-5 text-secondary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-800 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Join Our Team
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be part of something meaningful
                  </p>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Open Positions
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Development Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Grow With Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We invest in our people's development. Whether it's learning new skills, 
              taking on new challenges, or growing into leadership roles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Continuous Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access to courses, conferences, and learning resources to keep growing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Career Paths
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Clear progression paths and opportunities to move across teams and roles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Mentorship
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from experienced colleagues who are invested in your success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PeoplePage;
