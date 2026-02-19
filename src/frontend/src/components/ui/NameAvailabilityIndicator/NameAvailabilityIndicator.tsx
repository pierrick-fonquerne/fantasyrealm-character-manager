interface NameAvailabilityIndicatorProps {
  isChecking: boolean;
  isAvailable: boolean | null;
  errorMessage?: string;
}

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4 text-cream-500" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4 text-green-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg
    className="h-4 w-4 text-red-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const NameAvailabilityIndicator = ({
  isChecking,
  isAvailable,
  errorMessage = 'Ce nom est déjà pris, veuillez en choisir un autre',
}: NameAvailabilityIndicatorProps) => {
  if (isChecking) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        <SpinnerIcon />
        <span className="text-cream-500">Vérification en cours...</span>
      </div>
    );
  }

  if (isAvailable === true) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        <CheckIcon />
        <span className="text-green-500">Nom disponible</span>
      </div>
    );
  }

  if (isAvailable === false) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        <CrossIcon />
        <span className="text-red-500">{errorMessage}</span>
      </div>
    );
  }

  return null;
};

export { NameAvailabilityIndicator };
