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

export function FacilityInfoCard({
    formData,
    language,
    t,
    onInputChange
}: FacilityInfoCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="mb-2 flex items-center gap-2 min-w-0">
                <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0">
                    {t('registration.careFacility')}
                </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.facilityName')} *</label>
                    <input
                        type="text" name="hospital" value={formData.hospital}
                        onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={language === 'ko' ? '서울대학교병원' : 'Main Hospital'}
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('registration.registrationDate')} *</label>
                    <input
                        type="date" name="registrationDate" value={formData.registrationDate}
                        onChange={onInputChange} required
                        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
