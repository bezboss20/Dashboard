import { Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSettings } from '../../components/settings/LanguageSettings';
import { SaveButtonRow } from '../../components/settings/SaveButtonRow';

export function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();

    const handleSave = () => {
        console.log('Settings saved');
        alert(t('common.save') + ' ' + t('settings.subtitle'));
    };

    const handleCancel = () => {
        window.location.reload();
    };

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
