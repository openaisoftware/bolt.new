import { useState, useCallback, useEffect } from 'react';
import type { Step } from 'react-joyride';

const TUTORIAL_COMPLETED_KEY = 'tutorial_completed';

export const tutorialSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Bolt! Let\'s take a quick tour to help you get started.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.flex.flex-col.h-full.w-full',
    content: 'This is where you can start interacting with Bolt. Ask questions, get help with coding, or explore templates.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'button:has(.i-ph\\:git-branch)',
    content: 'Clone any Git repository to start working on existing projects.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.relative.w-full.max-w-chat.mx-auto.z-prompt textarea',
    content: 'Type your questions or commands here to interact with Bolt.',
    placement: 'top',
    disableBeacon: true,
  }
];

export function useTutorial() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!hasCompletedTutorial) {
      setIsTutorialOpen(true);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  }, []);

  return {
    isTutorialOpen,
    startTutorial,
    closeTutorial,
    tutorialSteps,
  };
} 