import { useState, useCallback, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { ClientOnly } from 'remix-utils/client-only';

interface TutorialProps {
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
}

export function Tutorial({ steps, isOpen, onClose }: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM elements are mounted
      const timer = setTimeout(() => {
        setShouldRun(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShouldRun(false);
    }
  }, [isOpen]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;
    console.log('Tutorial callback:', { action, index, status, type, stepsLength: steps.length });
    
    if (status === STATUS.SKIPPED) {
      setStepIndex(0);
      onClose();
      return;
    }

    if (status === STATUS.FINISHED) {
      setStepIndex(0);
      onClose();
      return;
    }

    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index + 1);
      } else if (action === 'prev') {
        setStepIndex(Math.max(0, index - 1));
      }
    }
  }, [onClose]);

  return (
    <ClientOnly>
      {() => (
        <Joyride
          callback={handleJoyrideCallback}
          continuous
          hideCloseButton
          run={shouldRun}
          scrollToFirstStep
          showProgress
          showSkipButton
          steps={steps}
          stepIndex={stepIndex}
          disableCloseOnEsc
          disableOverlayClose
          styles={{
            options: {
              primaryColor: '#3b82f6',
              textColor: '#1f2937',
              backgroundColor: '#ffffff',
              arrowColor: '#ffffff',
              zIndex: 1000,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            buttonNext: {
              backgroundColor: '#3b82f6',
            },
            buttonBack: {
              marginRight: 10,
            },
            spotlight: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }
          }}
        />
      )}
    </ClientOnly>
  );
} 