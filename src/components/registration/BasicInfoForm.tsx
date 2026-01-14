import { User } from 'lucide-react';

interface BasicInfoFormProps {
    formData: {
        patientNameKorean: string;
        dateOfBirth: string;
        gender: string;
        contactNumber: string;
    };
    language: string;
    t: (key: string) => string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function BasicInfoForm({
    formData,
    language,
    t,
    onInputChange
}: BasicInfoFormProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="mb-2 flex items-center gap-2 min-w-0">
                <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0">
                    {t('registration.basicInfo')}
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.patientName')} *</label>
                    <input
                        type="text" name="patientNameKorean" value={formData.patientNameKorean}
                        onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={language === 'ko' ? '홍길동' : 'John Doe'}
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.dob')} *</label>
                    <input
                        type="date" name="dateOfBirth" value={formData.dateOfBirth}
                        onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.gender')} *</label>
                    <select
                        name="gender" value={formData.gender} onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">{t('registration.select')}</option>
                        <option value="Male">{t('registration.male')}</option>
                        <option value="Female">{t('registration.female')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.contact')}</label>
                    <input
                        type="tel" name="contactNumber" value={formData.contactNumber}
                        onChange={onInputChange}
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="010-1234-5678"
                    />
                </div>
            </div>
        </div>
    );
}
