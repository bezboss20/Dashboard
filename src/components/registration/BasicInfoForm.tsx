import { User } from 'lucide-react';

interface BasicInfoFormProps {
  formData: {
    patientNameKorean: string;
    patientNameEnglish: string;
    patientCode: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    emergencyPhone: string;
    status: string;
  };
  language: string;
  t: (key: string) => string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// Phone format configuration per language
const getPhoneConfig = (language: string) => {
  switch (language) {
    case 'ko':
      return { placeholder: '010-1234-5678', emergencyPlaceholder: '010-9876-5432' };
    case 'en':
      return { placeholder: '123-456-7890', emergencyPlaceholder: '098-765-4321' };
    case 'ja':
      return { placeholder: '+81 90-1234-5678', emergencyPlaceholder: '+81 90-9876-5432' };
    case 'ch':
      return { placeholder: '+86 138-1234-5678', emergencyPlaceholder: '+86 138-9876-5432' };
    case 'es':
      return { placeholder: '123 456 789', emergencyPlaceholder: '098 765 432' };
    default:
      return { placeholder: '010-1234-5678', emergencyPlaceholder: '010-9876-5432' };
  }
};

export function BasicInfoForm({ formData, language, t, onInputChange }: BasicInfoFormProps) {
  const phoneConfig = getPhoneConfig(language);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-[2500px]:p-10 min-[2500px]:rounded-[24px]">
      <h3 className="mb-2 flex items-center gap-2 min-w-0 min-[2500px]:mb-8 min-[2500px]:gap-4">
        <User className="w-3 h-3 text-blue-600 flex-shrink-0 min-[2500px]:w-6 min-[2500px]:h-6" />
        <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0 min-[2500px]:text-2xl">
          {t('registration.basicInfo')}
        </span>
      </h3>

      <div className="min-[2500px]:bg-gray-50 min-[2500px]:border min-[2500px]:border-gray-200 min-[2500px]:rounded-[20px] min-[2500px]:p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 min-[2500px]:gap-10">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.patientName')} *
            </label>
            <input
              type="text"
              name="patientNameKorean"
              value={formData.patientNameKorean}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
              placeholder={language === 'ko' ? '홍길동' : 'John Doe'}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.patientNameEn')}
            </label>
            <input
              type="text"
              name="patientNameEnglish"
              value={formData.patientNameEnglish}
              onChange={onInputChange}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.patientCode')}
            </label>
            <input
              type="text"
              name="patientCode"
              value={formData.patientCode}
              onChange={onInputChange}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
              placeholder="H12345"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.dob')} *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-lg min-[2500px]:rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.gender')} *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-4 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
            >
              <option value="">{t('registration.select')}</option>
              <option value="Male">{t('registration.male')}</option>
              <option value="Female">{t('registration.female')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.contact')}
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
              placeholder={phoneConfig.placeholder}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.emergencyPhone')}
            </label>
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={onInputChange}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
              placeholder={phoneConfig.emergencyPlaceholder}
            />
          </div>

          {/*<div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
              {t('registration.status')} *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              required
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
            >
              <option value="ACTIVE">{t('filter.active')}</option>
              <option value="DISCHARGED">{t('filter.discharged')}</option>
              <option value="TRANSFERRED">{t('filter.transferred')}</option>
            </select>
          </div>*/}
        </div>
      </div>
    </div>
  );
}
