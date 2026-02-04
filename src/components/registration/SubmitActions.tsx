interface SubmitActionsProps {
  t: (key: string) => string;
  onReset: () => void;
}

export function SubmitActions({ t, onReset }: SubmitActionsProps) {
  return (
    <div className="flex items-left justify-center sm:justify-end gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 min-h-[44px] lg:p-4 lg:min-h-[60px] lg:rounded-xl lg:gap-4 min-[2500px]:p-8 min-[2500px]:min-h-[110px] min-[2500px]:rounded-[20px] min-[2500px]:gap-8">
      <button
        type="button"
        onClick={onReset}
        className="flex items-center justify-center px-4 h-8 text-[11px] leading-none whitespace-nowrap bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors
                   lg:px-8 lg:h-11 lg:text-sm lg:rounded-lg
                   min-[2500px]:px-14 min-[2500px]:h-16 min-[2500px]:text-xl min-[2500px]:rounded-xl"
      >
        {t('registration.reset')}
      </button>

      <button
        type="submit"
        className="flex items-center justify-center px-4 h-8 text-[11px] leading-none whitespace-nowrap bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm
                   lg:px-10 lg:h-11 lg:text-sm lg:rounded-lg
                   min-[2500px]:px-16 min-[2500px]:h-16 min-[2500px]:text-xl min-[2500px]:rounded-xl"
      >
        {t('registration.submit')}
      </button>
    </div>
  );
}
