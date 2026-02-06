import { useLanguage } from '../context/LanguageContext';

export function useSettings() {
    const { language, setLanguage, t } = useLanguage();

    const handleSave = () => {
        alert(t('common.save') + ' ' + t('settings.subtitle'));
    };

    const handleCancel = () => {
        window.location.reload();
    };

    return {
        language,
        setLanguage,
        t,
        handleSave,
        handleCancel
    };
}
