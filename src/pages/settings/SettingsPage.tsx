import { useSettings } from '../../hooks/useSettings';
import { SettingsView } from '../../components/settings/SettingsView';

export function SettingsPage() {
    const model = useSettings();

    return <SettingsView model={model} />;
}
