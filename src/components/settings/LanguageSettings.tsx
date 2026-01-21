import { Globe } from 'lucide-react';
import { Language } from '../../context/LanguageContext';

interface LanguageSettingsProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'ko', label: '한국어 (Korean)', flag: '🇰🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
    { value: 'ch', label: '中文 (Chinese)', flag: '🇨🇳' },
    { value: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
];

export function LanguageSettings({ language, setLanguage, t }: LanguageSettingsProps) {
    return (
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
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none max-[374px]:text-xs max-[374px]:px-2"
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
    );
}
