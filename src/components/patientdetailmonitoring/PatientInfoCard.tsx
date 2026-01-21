import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { PatientStatus } from '../../store/slices/monitoringSlice';

interface PatientInfoCardProps {
    data: {
        id: string;
        patientCode: string;
        name: string;
        englishName: string;
        age: number;
        gender: string;
        room: string;
        statusLabel: string;
        lastUpdated: string;
        bloodType: string;
        admissionDate: string;
        admissionDay: number;
        diagnosis: string;
        patientStatus?: PatientStatus;
    };
    language: string;
    t: (key: string) => string;
    onStatusChange?: (newStatus: PatientStatus) => void;
}

function InfoRow({
    label,
    value,
    isRed = false,
    compact = false
}: {
    label: string;
    value: string;
    isRed?: boolean;
    compact?: boolean;
}) {
    return (
        <div
            className={`flex justify-between items-center ${compact ? 'py-1' : 'py-2'
                } border-b border-gray-50 last:border-0`}
        >
            <span className={`${compact ? 'text-[11px]' : 'text-[13px]'} text-gray-500`}>{label}</span>
            <span
                className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}
            >
                {value}
            </span>
        </div>
    );
}

export function PatientInfoCard({ data, language, t, onStatusChange }: PatientInfoCardProps) {
    const [currentStatus, setCurrentStatus] = useState<PatientStatus>(data.patientStatus || 'ACTIVE');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with prop changes
    useEffect(() => {
        if (data.patientStatus) {
            setCurrentStatus(data.patientStatus);
        }
    }, [data.patientStatus]);

    const statusOptions: { value: PatientStatus; labelKey: string; color: string; bgColor: string; borderColor: string }[] = [
        { value: 'ACTIVE', labelKey: 'patientStatus.active', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
        { value: 'DISCHARGED', labelKey: 'patientStatus.discharged', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
        { value: 'TRANSFERRED', labelKey: 'patientStatus.transferred', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    ];

    const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

    const handleStatusChange = async (newStatus: PatientStatus) => {
        if (newStatus === currentStatus) {
            setIsDropdownOpen(false);
            return;
        }

        setIsUpdating(true);
        setIsDropdownOpen(false);

        try {
            setCurrentStatus(newStatus);
            if (onStatusChange) {
                await onStatusChange(newStatus);
            }
        } catch (error) {
            console.error('Failed to update patient status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6">
            <div className="mb-1.5 sm:mb-6">
                <div className="flex gap-2 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-[13px] sm:text-[17px] font-bold text-gray-900 leading-tight break-keep">
                        {t('detail.patientInfo')}
                    </h3>
                </div>
            </div>

            <div className="text-center mb-3 sm:mb-8">
                <p className="text-[9px] sm:text-[10px] text-gray-400 mb-2 sm:mb-4 leading-snug">
                    {t('alerts.patient')} ID: {data.patientCode} | {t('table.lastUpdated')}: {t(data.lastUpdated)}
                </p>

                <div className="w-[64px] h-[64px] sm:w-[100px] sm:h-[100px] bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 border border-teal-100 shadow-sm">
                    <User className="w-7 h-7 sm:w-10 sm:h-10 text-teal-600 opacity-40" />
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 mb-1.5 sm:mb-3 border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-green-600">
                        {t('status.labelPrefix')}
                        {t('status.' + data.statusLabel)}
                    </span>
                </div>

                <h2 className="text-[15px] sm:text-[20px] font-bold text-gray-900 mb-0.5 sm:mb-1">
                    {language === 'ko' ? data.name : data.englishName}
                </h2>

                <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium leading-snug mb-3 sm:mb-4">
                    🎂 1965.05.20 ({data.age}
                    {t('detail.yearsOld')}) |{' '}
                    {language === 'ko'
                        ? data.gender === '남성'
                            ? '남성'
                            : '여성'
                        : data.gender === '남성'
                            ? 'Male'
                            : 'Female'}{' '}
                    | {data.room}
                    {language === 'ko' ? '호' : ''}
                </p>

                {/* Patient Status Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isUpdating}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border transition-all ${currentOption.bgColor} ${currentOption.borderColor} ${isUpdating ? 'opacity-60 cursor-wait' : 'hover:shadow-sm'}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] sm:text-xs font-medium text-gray-500`}>
                                {t('patientStatus.label')}:
                            </span>
                            <span className={`text-[12px] sm:text-sm font-bold ${currentOption.color}`}>
                                {t(currentOption.labelKey)}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${currentStatus === option.value ? `${option.bgColor} font-medium` : ''
                                        }`}
                                >
                                    <span className={currentStatus === option.value ? option.color : 'text-gray-700'}>
                                        {t(option.labelKey)}
                                    </span>
                                    {currentStatus === option.value && (
                                        <div className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-0 text-gray-700">
                <InfoRow compact={true} label={t('table.bloodType') || 'Blood Type'} value={data.bloodType} />
                <InfoRow
                    compact={true}
                    label={t('detail.admissionDate')}
                    value={`${data.admissionDate} (${data.admissionDay}${t('detail.days')})`}
                />
                <InfoRow compact={true} label={t('detail.diagnosis')} value={t(data.diagnosis)} />
            </div>
        </div>
    );
}
