import { useState } from 'react';
import { Settings, Database, Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

export function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();

    const [settings, setSettings] = useState({
        dataRetentionDays: 90,
        autoBackup: true
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleSave = () => {
        console.log('Settings saved:', settings);
        alert(t('common.save') + ' ' + t('settings.subtitle'));
    };

    const languageOptions: { value: Language; label: string; flag: string }[] = [
        { value: 'ko', label: '한국어 (Korean)', flag: '🇰🇷' },
        { value: 'en', label: 'English', flag: '🇺🇸' },
        { value: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
        { value: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
        { value: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
    ];

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

            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-6xl mx-auto space-y-4">

                    {/* Language Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <h3 className="text-sm text-gray-900">{t('settings.language')}</h3>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-xs text-gray-700 mb-2">
                                {t('settings.selectLanguage')}
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {languageOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.flag} {opt.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                {t('settings.langUpdateNote')}
                            </p>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="w-5 h-5 text-gray-600" />
                            <h3 className="text-sm text-gray-900">
                                {t('settings.dataManagement')}
                            </h3>
                        </div>
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-xs text-gray-700 mb-2">
                                    {t('settings.dataRetention')}
                                </label>
                                <input
                                    type="number"
                                    name="dataRetentionDays"
                                    value={settings.dataRetentionDays}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="autoBackup"
                                    checked={settings.autoBackup}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700">
                                    {t('settings.autoBackup')}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3 justify-end bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
