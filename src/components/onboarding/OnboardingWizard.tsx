'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Pencil, Users, Compass, Check, ArrowRight } from 'lucide-react';
import { logError } from '@/lib/error-logger';


type GoalType = 'reader' | 'writer' | 'community-leader' | 'explorer';

interface OnboardingStep {
  title: string;
  description: string;
  actionText: string;
  actionUrl: string;
  completed: boolean;
}

interface OnboardingPath {
  goal: GoalType;
  steps: OnboardingStep[];
  completedSteps: number;
  totalSteps: number;
  nextStep: OnboardingStep | null;
}

const GOAL_OPTIONS = [
  {
    id: 'reader' as GoalType,
    icon: BookOpen,
    title: 'Discover & Read',
    description: 'Find great works and build your reading list',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'writer' as GoalType,
    icon: Pencil,
    title: 'Write & Publish',
    description: 'Share your creative work with the community',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'community-leader' as GoalType,
    icon: Users,
    title: 'Build Community',
    description: 'Create spaces for discussion and collaboration',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'explorer' as GoalType,
    icon: Compass,
    title: 'Explore Everything',
    description: 'Try all features and discover what fits you',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [onboardingPath, setOnboardingPath] = useState<OnboardingPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (selectedGoal) {
      fetchOnboardingPath(selectedGoal);
    }
  }, [selectedGoal]);

  async function fetchOnboardingPath(goal: GoalType) {
    try {
      setLoading(true);
      const res = await fetch(`/api/onboarding/path?goal=${goal}`);
      
      if (!res.ok) {
        throw new Error('Failed to load onboarding path');
      }

      const data = await res.json();
      setOnboardingPath(data.path);
    } catch (err) {
      logError('Onboarding path error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleGoalSelect = (goal: GoalType) => {
    setSelectedGoal(goal);
    setCurrentStep(1);
  };

  const handleSkip = () => {
    router.push('/library');
  };

  const handleNextStep = () => {
    if (onboardingPath && currentStep < onboardingPath.steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/library');
    }
  };

  if (currentStep === 0) {
    // Goal Selection
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-primary mb-3">
              Welcome to Shared Thread
            </h1>
            <p className="text-lg text-support">
              What would you like to do first?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {GOAL_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleGoalSelect(option.id)}
                  className={`${option.bgColor} ${option.borderColor} border-2 rounded-lg p-6 text-left hover:shadow-lg transition-all transform hover:scale-105`}
                >
                  <Icon className={`w-8 h-8 ${option.color} mb-4`} />
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {option.title}
                  </h3>
                  <p className="text-support">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-support hover:text-secondary transition-colors"
            >
              Skip tutorial and explore on my own
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !onboardingPath) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-support">Loading your personalized path...</p>
        </div>
      </div>
    );
  }

  const selectedGoalOption = GOAL_OPTIONS.find(g => g.id === selectedGoal);
  const currentStepData = onboardingPath.steps[currentStep - 1];
  const Icon = selectedGoalOption?.icon || Compass;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 ${selectedGoalOption?.bgColor} ${selectedGoalOption?.borderColor} border px-4 py-2 rounded-full mb-4`}>
            <Icon className={`w-5 h-5 ${selectedGoalOption?.color}`} />
            <span className={`font-medium ${selectedGoalOption?.color}`}>
              {selectedGoalOption?.title}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            {onboardingPath.steps.map((step, idx) => (
              <div
                key={idx}
                className={`h-2 w-12 rounded-full transition-colors ${
                  idx < currentStep
                    ? 'bg-accent'
                    : idx === currentStep
                    ? 'bg-accent/50'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-support">
            Step {currentStep} of {onboardingPath.totalSteps}
          </p>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-lg border border-border p-8 mb-6">
          {currentStepData?.completed && (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <Check className="w-5 h-5" />
              <span className="font-medium">Already completed!</span>
            </div>
          )}

          <h2 className="text-2xl font-bold text-primary mb-3">
            {currentStepData?.title}
          </h2>
          
          <p className="text-support mb-6">
            {currentStepData?.description}
          </p>

          <a
            href={currentStepData?.actionUrl}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            {currentStepData?.actionText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-support hover:text-secondary transition-colors"
          >
            Skip tutorial
          </button>

          {currentStep < onboardingPath.steps.length ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2 border border-border rounded-md hover:border-accent hover:text-accent transition-colors"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={() => router.push('/library')}
              className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Get Started! 🎉
            </button>
          )}
        </div>

        {/* Helpful Tips */}
        <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-sm text-support">
            💡 <strong>Tip:</strong> You can always access the help center from anywhere using the ? icon in the navigation
          </p>
        </div>
      </div>
    </div>
  );
}
