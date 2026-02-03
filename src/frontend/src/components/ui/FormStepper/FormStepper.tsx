export interface FormStep {
  id: number;
  title: string;
  description: string;
}

export interface FormStepperProps {
  steps: readonly FormStep[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  canNavigateToStep: (stepId: number) => boolean;
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    className="w-4 h-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
  canNavigateToStep,
}: FormStepperProps) {
  return (
    <div className="mb-8 max-w-md mx-auto">
      <div className="flex items-start justify-between relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-700">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const canNavigate = canNavigateToStep(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => canNavigate && onStepClick(step.id)}
              disabled={!canNavigate}
              className="flex flex-col items-center relative z-10"
              aria-label={`${step.title}: ${step.description}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 border-2
                  ${
                    isActive
                      ? 'bg-gold-500 border-gold-400 text-dark-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : isCompleted
                        ? 'bg-gold-600 border-gold-500 text-dark-950 cursor-pointer hover:bg-gold-500'
                        : 'bg-dark-800 border-dark-600 text-cream-500'
                  }
                `}
              >
                {isCompleted ? <CheckIcon /> : step.id}
              </div>
              <div
                className={`mt-2 text-center transition-colors duration-300 ${
                  isActive
                    ? 'text-gold-400'
                    : isCompleted
                      ? 'text-cream-300'
                      : 'text-cream-600'
                }`}
              >
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
