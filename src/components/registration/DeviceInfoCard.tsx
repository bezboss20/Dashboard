import { Stethoscope } from 'lucide-react';

interface DeviceInfoCardProps {
    formData: {
        deviceId: string;
        sensorType: string;
    };
    t: (key: string) => string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function DeviceInfoCard({
    formData,
    t,
    onInputChange
}: DeviceInfoCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="mb-2 flex items-center gap-2 min-w-0">
                <Stethoscope className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0">
                    {t('registration.deviceInfo')}
                </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.deviceId')} *</label>
                    <input
                        type="text" name="deviceId" value={formData.deviceId}
                        onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="D123456789"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.sensorType')} *</label>
                    <select
                        name="sensorType" value={formData.sensorType} onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">{t('registration.select')}</option>
                        <option value="Radar">{t('registration.radar60ghz')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
