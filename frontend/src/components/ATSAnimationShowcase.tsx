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
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= animationSteps.length - 1) {
          // Animation complete - stay at this stage with blinking
          setAnimationComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(-1);
    setAnimationComplete(false);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setAnimationComplete(false);
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-2xl border border-white/20">


      {!isPlaying && (
        <motion.div 
          className="absolute inset-0 z-10"
          initial={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dashboard Preview Background */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-full h-full flex flex-col items-center justify-center p-8 text-white">
            <div className="text-2xl font-bold mb-4">ATS Dashboard Preview</div>
            <div className="text-lg mb-8">Streamlined candidate management</div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white bg-opacity-20 rounded-lg p-3 h-16 flex items-center justify-center">
                  <div className="text-sm">Feature {i}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={startAnimation}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-75 text-indigo-600 shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <PlayIcon className="h-8 w-8" />
            </motion.button>
          </div>
        </motion.div>
      )}

      <>
        {isPlaying && (
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
                  animate={{ 
                    width: `${((currentStep + 2) / (animationSteps.length + 1)) * 100}%`,
                    // Add pulsing effect when animation is complete
                    ...(animationComplete && {
                      opacity: [1, 0.7, 1],
                      scale: [1, 1.02, 1]
                    })
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    // Continuous pulsing when complete
                    ...(animationComplete && {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    })
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600 font-medium">Hiring Workflow</span>
                <motion.span 
                  className="text-xs text-gray-600 font-medium"
                  animate={animationComplete ? {
                    opacity: [1, 0.6, 1]
                  } : {}}
                  transition={animationComplete ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                >
                  {Math.round(((currentStep + 2) / (animationSteps.length + 1)) * 100)}%
                </motion.span>
              </div>
            </div>

            {/* Main Animation Area */}
            <div className="mt-8 mb-6 flex items-center justify-center h-full">
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
                        // Add continuous blinking when animation is complete and step is active
                        ...(animationComplete && isActive && {
                          opacity: [1, 0.7, 1],
                          scale: [isActive ? 1 : 0.9, isActive ? 1.05 : 0.95, isActive ? 1 : 0.9]
                        })
                      }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeOut",
                        // Continuous blinking when complete
                        ...(animationComplete && isActive && {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.3 // Stagger the blinking
                        })
                      }}
                    >
                      {/* Animated Icon Container */}
                      <motion.div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 shadow-sm ${
                          isActive ? step.bgColor : 'bg-gray-100/50'
                        }`}
                        animate={
                          animationComplete && isActive 
                            ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0],
                              }
                            : isCurrent 
                            ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, 360],
                              } 
                            : isActive 
                            ? {
                                scale: [1, 1.05, 1],
                              } 
                            : {}
                        }
                        transition={{ 
                          duration: animationComplete && isActive ? 3 : isCurrent ? 0.8 : 2,
                          repeat: animationComplete && isActive ? Infinity : isCurrent ? 1 : isActive ? Infinity : 0,
                          repeatDelay: animationComplete && isActive ? 0 : 1,
                          delay: animationComplete && isActive ? index * 0.5 : 0 // Stagger icon animations
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
                            scale: isCurrent ? [1, 1.2, 1] : 1,
                            // Add pulsing to arrows when animation complete
                            ...(animationComplete && isActive && {
                              opacity: [1, 0.5, 1],
                              scale: [1, 1.3, 1]
                            })
                          }}
                          transition={{ 
                            duration: 0.5,
                            // Continuous pulsing for arrows when complete
                            ...(animationComplete && isActive && {
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.4
                            })
                          }}
                        >
                          <ArrowRightIcon className="h-3 w-3 text-indigo-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Centered Glass Replay Button - only show when animation is complete */}
            {animationComplete && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <motion.button
                  onClick={resetAnimation}
                  className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/20 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 8px 20px rgba(99, 102, 241, 0.15)",
                      "0 12px 30px rgba(99, 102, 241, 0.25)",
                      "0 8px 20px rgba(99, 102, 241, 0.15)"
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowPathIcon className="h-8 w-8 text-indigo-600/40 group-hover:text-indigo-700/60" />
                  </motion.div>
                  
                  {/* Subtle glass shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-30" />
                </motion.button>
              </motion.div>
            )}

          </motion.div>
        )}
      </>
    </div>
  );
};

export default ATSAnimationShowcase; 