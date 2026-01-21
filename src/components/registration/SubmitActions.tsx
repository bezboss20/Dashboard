interface SubmitActionsProps {
  t: (key: string) => string;
  onReset: () => void;
}

export function SubmitActions({ t, onReset }: SubmitActionsProps) {
  return (
    <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 min-h-[44px] min-[2500px]:p-8 min-[2500px]:min-h-[110px] min-[2500px]:rounded-[20px] min-[2500px]:gap-8">
      <button
        type="button"
        onClick={onReset}
        className="flex items-center justify-center px-4 h-8 text-[11px] leading-none whitespace-nowrap bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors
                   min-[2500px]:px-14 min-[2500px]:h-16 min-[2500px]:text-xl min-[2500px]:rounded-xl"
      >
        {t('registration.reset')}
      </button>

      <button
        type="submit"
        className="flex items-center justify-center px-4 h-8 text-[11px] leading-none whitespace-nowrap bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm
                   min-[2500px]:px-16 min-[2500px]:h-16 min-[2500px]:text-xl min-[2500px]:rounded-xl"
      >
        {t('registration.submit')}
      </button>
    </div>
  );
}
