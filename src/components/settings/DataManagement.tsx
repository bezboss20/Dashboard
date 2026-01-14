import { Database } from 'lucide-react';

interface DataManagementProps {
    settings: {
        dataRetentionDays: number;
        autoBackup: boolean;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    t: (key: string) => string;
}

export function DataManagement({ settings, onInputChange, t }: DataManagementProps) {
    return (
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
                        onChange={onInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="autoBackup"
                        checked={settings.autoBackup}
                        onChange={onInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">
                        {t('settings.autoBackup')}
                    </span>
                </label>
            </div>
        </div>
    );
}
