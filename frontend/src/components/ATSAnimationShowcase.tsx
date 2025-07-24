import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  BellIcon,
  PlayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface AnimationStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const animationSteps: AnimationStep[] = [
  {
    title: 'Create & Post Jobs',
    description: 'Rich text editor, multi-platform publishing',
    icon: BriefcaseIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    title: 'Receive Applications',
    description: 'Resume uploads, cover letters, tracking',
    icon: DocumentTextIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    title: 'AI Resume Analysis',
    description: 'Smart ranking, skill matching, scoring',
    icon: SparklesIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    title: 'Schedule Interviews',
    description: 'Calendar integration, automated coordination',
    icon: CalendarIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    title: 'Team Collaboration',
    description: 'Real-time chat, admin support, notifications',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    title: 'Make Offers & Hire',
    description: 'Decision tracking, offer management, onboarding',
    icon: CheckCircleIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
];

const mockStats = [
  { label: 'Active Jobs', value: 45, icon: BriefcaseIcon, trend: '+12%' },
  { label: 'Applications', value: 234, icon: DocumentTextIcon, trend: '+25%' },
  { label: 'Interviews', value: 28, icon: CalendarIcon, trend: '+8%' },
  { label: 'Hired', value: 12, icon: TrophyIcon, trend: '+15%' }
];

const mockActivities = [
  { type: 'application', message: 'New application received', time: '2m ago', icon: DocumentTextIcon },
  { type: 'interview', message: 'Interview scheduled', time: '5m ago', icon: CalendarIcon },
  { type: 'hire', message: 'Candidate hired!', time: '1h ago', icon: CheckCircleIcon },
  { type: 'job', message: 'New job posted', time: '2h ago', icon: BriefcaseIcon }
];

const ATSAnimationShowcase: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(mockStats.map(stat => ({ ...stat, animatedValue: 0 })));
  const [showActivities, setShowActivities] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= animationSteps.length - 1) {
          // Show dashboard at the end
          setShowDashboard(true);
          // Animate stats
          animatedStats.forEach((stat, index) => {
            setTimeout(() => {
              setAnimatedStats(prevStats => 
                prevStats.map((s, i) => 
                  i === index ? { ...s, animatedValue: s.value } : s
                )
              );
            }, index * 150);
          });
          // Show activities one by one
          mockActivities.forEach((_, index) => {
            setTimeout(() => {
              setShowActivities(prev => prev + 1);
            }, 500 + index * 200);
          });
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isPlaying, animatedStats]);

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(-1);
    setShowDashboard(false);
    setShowActivities(0);
    setAnimatedStats(mockStats.map(stat => ({ ...stat, animatedValue: 0 })));
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setShowDashboard(false);
    setShowActivities(0);
    setAnimatedStats(mockStats.map(stat => ({ ...stat, animatedValue: 0 })));
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-2xl border border-white/20">


      {!isPlaying && !showDashboard && (
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10"
          initial={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <SparklesIcon className="h-16 w-16 text-indigo-600" />
          </motion.div>
          
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ATS System in Action
          </motion.h3>
          <motion.p 
            className="text-gray-600 mb-6 max-w-md text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Experience our comprehensive Applicant Tracking System's complete hiring workflow in just 5 seconds
          </motion.p>
          
          <motion.button
            onClick={startAnimation}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Start 5-Second Demo
          </motion.button>


        </motion.div>
      )}

      <>
        {isPlaying && !showDashboard && (
          <motion.div 
            className="absolute inset-0 p-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Progress Bar */}
            <div className="absolute top-4 left-6 right-6 z-20">
              <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 shadow-sm">
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full shadow-sm"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 2) / (animationSteps.length + 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600 font-medium">Hiring Workflow</span>
                <span className="text-xs text-gray-600 font-medium">
                  {Math.round(((currentStep + 2) / (animationSteps.length + 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Main Animation Area */}
            <div className="mt-8 flex items-center justify-center h-full">
              <div className="grid grid-cols-3 gap-2 max-w-5xl w-full">
                {animationSteps.map((step, index) => {
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`relative p-2 rounded-lg border-2 transition-all duration-500 ${
                        isActive 
                          ? `${step.bgColor} ${step.borderColor} shadow-lg` 
                          : isPending
                          ? 'bg-white/40 border-gray-200/50 backdrop-blur-sm'
                          : 'bg-white/60 border-gray-300/50 backdrop-blur-sm'
                      }`}
                      initial={{ opacity: 0.3, scale: 0.8, y: 20 }}
                      animate={{
                        opacity: isActive ? 1 : isPending ? 0.5 : 0.8,
                        scale: isCurrent ? 1.05 : isActive ? 1 : 0.9,
                        y: isActive ? 0 : isPending ? 10 : 0,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {/* Animated Icon Container */}
                      <motion.div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 shadow-sm ${
                          isActive ? step.bgColor : 'bg-gray-100/50'
                        }`}
                        animate={isCurrent ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 360],
                        } : isActive ? {
                          scale: [1, 1.05, 1],
                        } : {}}
                        transition={{ 
                          duration: isCurrent ? 0.8 : 2,
                          repeat: isCurrent ? 1 : isActive ? Infinity : 0,
                          repeatDelay: 1
                        }}
                      >
                        <step.icon className={`h-4 w-4 ${isActive ? step.color : 'text-gray-400'}`} />
                      </motion.div>

                      {/* Content */}
                      <h4 className={`font-semibold text-xs mb-1 ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs leading-tight ${
                        isActive ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>



                      {/* Flow Arrow */}
                      {index < animationSteps.length - 1 && (
                        <motion.div
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2 z-10"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: isActive ? 1 : 0.3, 
                            x: 0,
                            scale: isCurrent ? [1, 1.2, 1] : 1
                          }}
                          transition={{ 
                            duration: 0.5, 
                            repeat: isCurrent ? Infinity : 0,
                            repeatDelay: 0.5
                          }}
                        >
                          <ArrowRightIcon className={`h-3 w-3 ${isActive ? 'text-indigo-600' : 'text-gray-300'}`} />
                        </motion.div>
                      )}

                      {/* Active pulse effect */}
                      {isCurrent && (
                        <motion.div
                          className={`absolute inset-0 rounded-lg border-2 ${step.borderColor}`}
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}

                      {/* Completion checkmark */}
                      {isActive && !isCurrent && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          <CheckCircleIcon className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </>

      <>
        {showDashboard && (
          <motion.div
            className="absolute inset-0 p-4 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Dashboard Header */}
            <div className="text-center mb-4">
              <motion.h3
                className="text-lg font-bold text-gray-900 mb-1"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎉 ATS Dashboard Overview
              </motion.h3>
              <motion.p
                className="text-gray-600 text-xs"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Real-time hiring metrics and team collaboration
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Stats Grid */}
              <div className="space-y-2">
                {animatedStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {stat.label}
                        </p>
                        <div className="flex items-center space-x-2">
                          <motion.p
                            className="text-lg font-bold text-gray-900"
                            key={stat.animatedValue}
                            initial={{ scale: 1.3, color: '#059669' }}
                            animate={{ scale: 1, color: '#111827' }}
                            transition={{ duration: 0.5 }}
                          >
                            {stat.animatedValue}
                          </motion.p>
                          <motion.span
                            className="text-xs font-medium text-green-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 + index * 0.1 }}
                          >
                            {stat.trend}
                          </motion.span>
                        </div>
                      </div>
                      <motion.div
                        className="p-2 bg-indigo-100 rounded-lg"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      >
                        <stat.icon className="h-4 w-4 text-indigo-600" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/50">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <BellIcon className="h-4 w-4 mr-1 text-indigo-600" />
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {mockActivities.slice(0, showActivities).map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-2 text-xs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.2 }}
                    >
                      <activity.icon className="h-3 w-3 text-indigo-500" />
                      <span className="text-gray-700 flex-1">{activity.message}</span>
                      <span className="text-gray-400">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-center mt-4 space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <button
                onClick={resetAnimation}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                Replay Demo
              </button>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <MagnifyingGlassIcon className="h-3 w-3 mr-1" />
                Explore Features
              </button>
            </motion.div>


          </motion.div>
        )}
      </>
    </div>
  );
};

export default ATSAnimationShowcase; 