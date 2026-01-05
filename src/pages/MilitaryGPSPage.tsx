import { useLanguage } from '../context/LanguageContext';

export function MilitaryGPSPage() {
    const { t } = useLanguage();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t('gps.title')}</h1>
            <p className="text-gray-600">{t('gps.description')}</p>
        </div>
    );
}
