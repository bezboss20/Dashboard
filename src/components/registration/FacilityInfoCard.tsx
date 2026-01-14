import { Building2 } from 'lucide-react';

interface FacilityInfoCardProps {
  formData: {
    hospital: string;
    registrationDate: string;
  };
  language: string;
  t: (key: string) => string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function FacilityInfoCard({ formData, language, t, onInputChange }: FacilityInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-[2500px]:p-8 min-[2500px]:rounded-2xl">
      <h3 className="mb-2 flex items-center gap-2 min-w-0 min-[2500px]:mb-5 min-[2500px]:gap-3">
        <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0 min-[2500px]:w-5 min-[2500px]:h-5" />
        <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0 min-[2500px]:text-lg">
          {t('registration.careFacility')}
        </span>
      </h3>

      <div className="min-[2500px]:bg-gray-50 min-[2500px]:border min-[2500px]:border-gray-200 min-[2500px]:rounded-2xl min-[2500px]:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-[2500px]:gap-8">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[12px] min-[2500px]:mb-2">
              {t('registration.facilityName')} *
            </label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-4 min-[2500px]:py-3 min-[2500px]:text-[16px] min-[2500px]:rounded-xl"
              placeholder={language === 'ko' ? '서울대학교병원' : 'Main Hospital'}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[12px] min-[2500px]:mb-2">
              {t('registration.registrationDate')} *
            </label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-4 min-[2500px]:py-3 min-[2500px]:text-[16px] min-[2500px]:rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
