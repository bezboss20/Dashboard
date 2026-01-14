import { Stethoscope } from 'lucide-react';

interface DeviceInfoCardProps {
  formData: {
    deviceId: string;
    sensorType: string;
  };
  t: (key: string) => string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function DeviceInfoCard({ formData, t, onInputChange }: DeviceInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-[2500px]:p-8 min-[2500px]:rounded-2xl">
      <h3 className="mb-2 flex items-center gap-2 min-w-0 min-[2500px]:mb-5 min-[2500px]:gap-3">
        <Stethoscope className="w-3 h-3 text-blue-600 flex-shrink-0 min-[2500px]:w-5 min-[2500px]:h-5" />
        <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0 min-[2500px]:text-lg">
          {t('registration.deviceInfo')}
        </span>
      </h3>

      <div className="min-[2500px]:bg-gray-50 min-[2500px]:border min-[2500px]:border-gray-200 min-[2500px]:rounded-2xl min-[2500px]:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-[2500px]:gap-8">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[12px] min-[2500px]:mb-2">
              {t('registration.deviceId')} *
            </label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-4 min-[2500px]:py-3 min-[2500px]:text-[16px] min-[2500px]:rounded-xl"
              placeholder="D123456789"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[12px] min-[2500px]:mb-2">
              {t('registration.sensorType')} *
            </label>
            <select
              name="sensorType"
              value={formData.sensorType}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-4 min-[2500px]:py-3 min-[2500px]:text-[16px] min-[2500px]:rounded-xl"
            >
              <option value="">{t('registration.select')}</option>
              <option value="Radar">{t('registration.radar60ghz')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
