interface SaveButtonRowProps {
    onCancel: () => void;
    onSave: () => void;
    t: (key: string) => string;
}

export function SaveButtonRow({ onCancel, onSave, t }: SaveButtonRowProps) {
    return (
        <div className="flex gap-3 justify-center sm:justify-end bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <button
                onClick={onCancel}
                className="px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
            >
                {t('common.cancel')}
            </button>
            <button
                onClick={onSave}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
            >
                {t('common.save')}
            </button>
        </div>
    );
}
