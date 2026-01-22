import { Settings } from 'lucide-react';
import { LanguageSettings } from './LanguageSettings';
import { SaveButtonRow } from './SaveButtonRow';
import { useSettings } from '../../hooks/useSettings';

interface SettingsViewProps {
    model: ReturnType<typeof useSettings>;
}

export function SettingsView({ model }: SettingsViewProps) {
    const { language, setLanguage, t, handleSave, handleCancel } = model;

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Page Header - Compact */}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <div>
                        <h1 className="text-gray-900 text-lg">{t('settings.title')}</h1>
                        <p className="text-xs text-gray-500">{t('settings.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2">
                <div className="w-full mx-auto space-y-6">
                    {/* Language Settings */}
                    <LanguageSettings
                        language={language}
                        setLanguage={setLanguage}
                        t={t}
                    />

                    {/* Save Button */}
                    <SaveButtonRow
                        onCancel={handleCancel}
                        onSave={handleSave}
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
}
